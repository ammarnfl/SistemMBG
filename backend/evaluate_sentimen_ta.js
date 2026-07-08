const fs = require('fs');
const readline = require('readline');

// Konfigurasi
const DATASET_PATH = 'evaluation_pairs.csv';
const OUTPUT_PATH = 'hasil_evaluasi_sentimen.json';
const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/w11wo/indonesian-roberta-base-sentiment-classifier';
const HF_TOKEN = process.env.HF_TOKEN || 'YOUR_HF_TOKEN'; // Dari .env

const REQUEST_TIMEOUT_MS = 8000;
const RETRY_DELAY_MS = 1500;
const DELAY_BETWEEN_REQUESTS_MS = 150;
const RETRIABLE_STATUS = new Set([429, 502, 503, 504]);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function mapLabel(label) {
  const normalized = label.toLowerCase();
  if (normalized === 'positive') return 'POSITIF';
  if (normalized === 'negative') return 'NEGATIF';
  return 'NETRAL';
}

async function callHuggingFace(text, token) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function analyzeSingle(text) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await callHuggingFace(text, HF_TOKEN);
      
      if (!response.ok) {
        const retriable = RETRIABLE_STATUS.has(response.status);
        if (retriable && attempt < 2) {
          console.warn(`[WARN] HF API returned ${response.status} (attempt ${attempt}/2, retrying...)`);
          await wait(RETRY_DELAY_MS);
          continue;
        }
        return null;
      }

      const data = await response.json();
      const results = data[0];
      if (!results || results.length === 0) return null;

      const top = results.reduce((prev, cur) => (cur.score > prev.score ? cur : prev));
      return {
        label: mapLabel(top.label),
        rawLabel: top.label,
        score: top.score,
      };
    } catch (error) {
      if (attempt < 2) {
        console.warn(`[WARN] Request failed, retrying... (${error.message})`);
        await wait(RETRY_DELAY_MS);
        continue;
      }
      return null;
    }
  }
  return null;
}

function parseCSVLine(line) {
  const result = [];
  let currentStr = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(currentStr);
      currentStr = '';
    } else {
      currentStr += char;
    }
  }
  result.push(currentStr);
  return result;
}

async function run() {
  console.log("=== Memulai Evaluasi Sentimen Model ===");
  
  // Baca dataset
  const fileStream = fs.createReadStream(DATASET_PATH);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let isHeader = true;
  let headers = [];
  const dataset = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    const cols = parseCSVLine(line);
    if (isHeader) {
      headers = cols.map(c => c.trim().toLowerCase());
      isHeader = false;
      continue;
    }
    
    // Asumsi dataset evaluation_pairs.csv punya index, text, gold, ...
    const textIdx = headers.indexOf('text');
    const goldIdx = headers.indexOf('gold');
    
    if (textIdx === -1 || goldIdx === -1) {
      console.error("Format CSV tidak sesuai. Pastikan ada kolom 'text' dan 'gold'.");
      process.exit(1);
    }
    
    dataset.push({
      teks_feedback: cols[textIdx],
      label_manual: cols[goldIdx].toUpperCase()
    });
  }

  const total = dataset.length;
  console.log(`Berhasil membaca ${total} sampel data dari ${DATASET_PATH}.\n`);

  const results = [];
  const errors = [];
  const misclassified = [];

  // Confusion matrix
  const classes = ['POSITIF', 'NETRAL', 'NEGATIF'];
  const cm = {
    POSITIF: { POSITIF: 0, NETRAL: 0, NEGATIF: 0 },
    NETRAL: { POSITIF: 0, NETRAL: 0, NEGATIF: 0 },
    NEGATIF: { POSITIF: 0, NETRAL: 0, NEGATIF: 0 },
  };

  console.log("Memulai prediksi HF Inference API...");
  for (let i = 0; i < total; i++) {
    const sample = dataset[i];
    const actual = sample.label_manual;
    
    const predResult = await analyzeSingle(sample.teks_feedback);
    
    let predicted = null;
    let score = null;
    
    if (predResult) {
      predicted = predResult.label;
      score = predResult.score;
      
      cm[actual][predicted]++;
      
      if (actual !== predicted) {
        misclassified.push({
          teks: sample.teks_feedback,
          seharusnya: actual,
          prediksi: predicted,
          confidence_score: score
        });
      }
    } else {
      errors.push(sample);
    }
    
    results.push({
      ...sample,
      prediksi: predicted,
      score: score
    });
    
    process.stdout.write(`\rMemproses sampel ke-${i + 1} dari ${total}... `);
    await wait(DELAY_BETWEEN_REQUESTS_MS);
  }
  console.log("\nSelesai!\n");

  // Kalkulasi Metrik
  const metrics = {};
  let totalTP = 0;
  let totalSamplesTested = total - errors.length;

  for (const c of classes) {
    let tp = cm[c][c];
    let fn = 0;
    let fp = 0;
    
    for (const otherC of classes) {
      if (otherC !== c) {
        fn += cm[c][otherC];
        fp += cm[otherC][c];
      }
    }
    
    const precision = (tp + fp) === 0 ? 0 : tp / (tp + fp);
    const recall = (tp + fn) === 0 ? 0 : tp / (tp + fn);
    const f1 = (precision + recall) === 0 ? 0 : 2 * (precision * recall) / (precision + recall);
    
    const support = tp + fn;
    
    metrics[c] = { precision, recall, f1, support };
    totalTP += tp;
  }

  const accuracy = totalTP / totalSamplesTested;
  
  let macroPrecision = 0, macroRecall = 0, macroF1 = 0;
  let weightedPrecision = 0, weightedRecall = 0, weightedF1 = 0;

  for (const c of classes) {
    macroPrecision += metrics[c].precision;
    macroRecall += metrics[c].recall;
    macroF1 += metrics[c].f1;
    
    weightedPrecision += metrics[c].precision * metrics[c].support;
    weightedRecall += metrics[c].recall * metrics[c].support;
    weightedF1 += metrics[c].f1 * metrics[c].support;
  }

  macroPrecision /= 3;
  macroRecall /= 3;
  macroF1 /= 3;

  weightedPrecision /= totalSamplesTested;
  weightedRecall /= totalSamplesTested;
  weightedF1 /= totalSamplesTested;

  const finalOutput = {
    ringkasan: {
      total_sampel: total,
      berhasil_diprediksi: totalSamplesTested,
      gagal_diprediksi: errors.length
    },
    confusion_matrix: cm,
    metrik_per_kelas: metrics,
    overall: {
      accuracy,
      macro_avg: {
        precision: macroPrecision,
        recall: macroRecall,
        f1: macroF1
      },
      weighted_avg: {
        precision: weightedPrecision,
        recall: weightedRecall,
        f1: weightedF1
      }
    },
    salah_prediksi: misclassified,
    hasil_lengkap: results
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalOutput, null, 2));
  console.log(`Semua hasil mentah telah disimpan ke: ${OUTPUT_PATH}\n`);

  console.log("=== HASIL EVALUASI ===");
  console.log(`Accuracy: ${(accuracy*100).toFixed(2)}%`);
  console.log("Macro F1:", (macroF1*100).toFixed(2) + "%");
  console.log("\nConfusion Matrix (Baris=Actual, Kolom=Predicted):");
  console.table(cm);
  
  console.log("\nMetrik Per Kelas:");
  const tableMetrics = {};
  classes.forEach(c => {
    tableMetrics[c] = {
      Precision: (metrics[c].precision*100).toFixed(2) + "%",
      Recall: (metrics[c].recall*100).toFixed(2) + "%",
      "F1-Score": (metrics[c].f1*100).toFixed(2) + "%",
      Support: metrics[c].support
    };
  });
  console.table(tableMetrics);

  console.log("\nRingkasan Pola Error (Misklasifikasi):");
  const misclassCount = {};
  misclassified.forEach(m => {
    const key = `Actual ${m.seharusnya} -> Diprediksi ${m.prediksi}`;
    misclassCount[key] = (misclassCount[key] || 0) + 1;
  });
  
  const sortedMisclass = Object.entries(misclassCount).sort((a, b) => b[1] - a[1]);
  if (sortedMisclass.length > 0) {
    sortedMisclass.forEach(([pattern, count]) => {
      console.log(`- ${pattern}: ${count} kali`);
    });
  } else {
    console.log("- Model memprediksi semua dengan benar (100% sempurna!)");
  }
}

run().catch(console.error);
