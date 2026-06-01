/**
 * evaluate-sentiment.ts
 * --------------------------------------------------------------------------
 * Evaluasi AKURASI model analisis sentimen terhadap GOLD STANDARD berlabel
 * manual (lihat sentimen-gold-set.ts).
 *
 * Berbeda dengan pendekatan "ground truth dari rating" (yang hanya mengukur
 * KONSISTENSI rating-vs-teks, bukan akurasi), skrip ini membandingkan prediksi
 * model terhadap label manusia atas TEKS yang sama — metodologi yang sah untuk
 * mengklaim akurasi (NF.6: target 75–80%).
 *
 * Skrip MEMAKAI ULANG `SentimenService.analyzeSingle` dari kode produksi
 * (lengkap dengan timeout + retry), sehingga yang diuji benar-benar code path
 * yang dipakai aplikasi — bukan reimplementasi terpisah yang bisa menyimpang.
 *
 * Menjalankan (dari folder backend, HUGGINGFACE_API_TOKEN ada di .env):
 *   npm run eval:sentimen
 *
 * Output:
 *   - Ringkasan metrik di terminal (confusion matrix, P/R/F1, akurasi)
 *   - evaluation_pairs.csv     (pasangan teks → gold vs prediksi, utk lampiran)
 *   - evaluation_result.json   (hasil terstruktur, utk arsip / grafik)
 * --------------------------------------------------------------------------
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { writeFileSync } from 'fs';
import { SentimenService } from '../src/sentimen/sentimen.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { GOLD_SET, LABELS, GoldLabel } from './sentimen-gold-set';

/**
 * Modul minimal khusus evaluasi: hanya butuh ConfigService (untuk token HF)
 * dan SentimenService. PrismaService di-stub karena analyzeSingle tidak
 * menyentuh database — ini sekaligus melepas evaluasi dari koneksi DB.
 */
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    SentimenService,
    { provide: PrismaService, useValue: {} },
  ],
})
class EvalModule {}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const idx = (l: GoldLabel) => LABELS.indexOf(l);
const pad = (s: string, n: number) => (s.length >= n ? s : s + ' '.repeat(n - s.length));
const fmt = (x: number) => (Number.isFinite(x) ? x.toFixed(4) : '0.0000');
const pct = (x: number) => (Number.isFinite(x) ? (x * 100).toFixed(2) + '%' : '-');

interface Row {
  text: string;
  gold: GoldLabel;
  pred: GoldLabel | null; // null = panggilan API gagal
  score: number | null;
}

async function main() {
  if (!process.env.HUGGINGFACE_API_TOKEN) {
    console.error(
      '\n[GAGAL] HUGGINGFACE_API_TOKEN tidak ada di environment / .env.\n' +
        'Set token dulu sebelum menjalankan evaluasi.\n',
    );
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(EvalModule, {
    logger: ['error', 'warn'],
  });
  const sentimen = app.get(SentimenService);

  console.log(`\nMenjalankan evaluasi pada ${GOLD_SET.length} sampel berlabel manual...`);
  console.log('(memanggil HuggingFace Inference API satu per satu)\n');

  const rows: Row[] = [];
  let errorCount = 0;

  for (let i = 0; i < GOLD_SET.length; i++) {
    const item = GOLD_SET[i];
    const result = await sentimen.analyzeSingle(item.text);

    if (!result) {
      errorCount++;
      rows.push({ text: item.text, gold: item.label, pred: null, score: null });
      process.stdout.write(`  [${i + 1}/${GOLD_SET.length}] ERROR (API gagal)\n`);
    } else {
      const pred = result.label as GoldLabel;
      rows.push({ text: item.text, gold: item.label, pred, score: result.score });
      const mark = pred === item.label ? 'OK ' : 'X  ';
      process.stdout.write(
        `  [${i + 1}/${GOLD_SET.length}] ${mark} gold=${pad(item.label, 8)} pred=${pad(pred, 8)} (${result.score.toFixed(2)})\n`,
      );
    }

    // Jeda kecil agar ramah terhadap rate limit HF.
    await sleep(250);
  }

  await app.close();

  // ---- confusion[actual][predicted] (hanya baris dengan prediksi valid) ----
  const confusion: number[][] = LABELS.map(() => LABELS.map(() => 0));
  for (const r of rows) {
    if (r.pred == null) continue;
    confusion[idx(r.gold)][idx(r.pred)]++;
  }
  const total = confusion.flat().reduce((a, b) => a + b, 0);

  // ---- metrik per kelas ----
  const perClass = LABELS.map((label, c) => {
    const tp = confusion[c][c];
    let fp = 0;
    let fn = 0;
    let support = 0;
    for (let i = 0; i < LABELS.length; i++) {
      support += confusion[c][i];
      if (i !== c) {
        fp += confusion[i][c];
        fn += confusion[c][i];
      }
    }
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    return { label, tp, fp, fn, support, precision, recall, f1 };
  });

  const correct = LABELS.reduce((s, _l, c) => s + confusion[c][c], 0);
  const accuracy = total === 0 ? 0 : correct / total;

  const macroP = perClass.reduce((s, x) => s + x.precision, 0) / LABELS.length;
  const macroR = perClass.reduce((s, x) => s + x.recall, 0) / LABELS.length;
  const macroF1 = perClass.reduce((s, x) => s + x.f1, 0) / LABELS.length;

  const weightedP = total === 0 ? 0 : perClass.reduce((s, x) => s + x.precision * x.support, 0) / total;
  const weightedR = total === 0 ? 0 : perClass.reduce((s, x) => s + x.recall * x.support, 0) / total;
  const weightedF1 = total === 0 ? 0 : perClass.reduce((s, x) => s + x.f1 * x.support, 0) / total;

  // ---- laporan terminal ----
  console.log('\n================ EVALUASI SENTIMENT ANALYSIS (GOLD STANDARD) ================');
  console.log('Model           : w11wo/indonesian-roberta-base-sentiment-classifier (HF API)');
  console.log('Metodologi      : prediksi model vs label manual atas teks (gold standard)');
  console.log(`Total sampel    : ${GOLD_SET.length}`);
  console.log(`Dievaluasi      : ${total}`);
  console.log(`Gagal/API error : ${errorCount}${errorCount ? '  <- dikeluarkan dari metrik' : ''}`);

  console.log('\n--- Confusion Matrix (baris = label manual, kolom = prediksi model) ---');
  console.log(pad('', 12) + LABELS.map((l) => pad(l, 10)).join(''));
  LABELS.forEach((l, i) => {
    console.log(pad(l, 12) + confusion[i].map((v) => pad(String(v), 10)).join(''));
  });

  console.log('\n--- Metrik per Kelas ---');
  console.log(pad('Kelas', 12) + pad('Presisi', 10) + pad('Recall', 10) + pad('F1', 10) + pad('Support', 10));
  perClass.forEach((x) => {
    console.log(
      pad(x.label, 12) + pad(fmt(x.precision), 10) + pad(fmt(x.recall), 10) + pad(fmt(x.f1), 10) + pad(String(x.support), 10),
    );
  });

  console.log('\n--- Ringkasan ---');
  console.log(`Akurasi         : ${fmt(accuracy)}  (${pct(accuracy)})`);
  console.log(`Macro    P/R/F1 : ${fmt(macroP)} / ${fmt(macroR)} / ${fmt(macroF1)}`);
  console.log(`Weighted P/R/F1 : ${fmt(weightedP)} / ${fmt(weightedR)} / ${fmt(weightedF1)}`);
  const target = accuracy >= 0.75;
  console.log(`Target NF.6 75% : ${target ? 'TERCAPAI ✔' : 'BELUM TERCAPAI ✘'}`);
  console.log('=============================================================================\n');

  // ---- ekspor file ----
  const csv = ['index,text,gold,pred,score,benar'];
  rows.forEach((r, i) => {
    const safeText = `"${r.text.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    const benar = r.pred == null ? '' : r.gold === r.pred ? 1 : 0;
    csv.push([i + 1, safeText, r.gold, r.pred ?? 'ERROR', r.score ?? '', benar].join(','));
  });
  writeFileSync('evaluation_pairs.csv', csv.join('\n'), 'utf-8');

  writeFileSync(
    'evaluation_result.json',
    JSON.stringify(
      {
        model: 'w11wo/indonesian-roberta-base-sentiment-classifier',
        methodology: 'gold-standard manual labels vs model prediction (text-based)',
        generatedAt: new Date().toISOString(),
        labels: LABELS,
        totalSamples: GOLD_SET.length,
        evaluated: total,
        apiErrors: errorCount,
        confusionMatrix: confusion,
        perClass,
        accuracy,
        macro: { precision: macroP, recall: macroR, f1: macroF1 },
        weighted: { precision: weightedP, recall: weightedR, f1: weightedF1 },
      },
      null,
      2,
    ),
    'utf-8',
  );

  console.log('File tersimpan: evaluation_pairs.csv, evaluation_result.json\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
