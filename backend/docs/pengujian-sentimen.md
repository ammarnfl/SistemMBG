# Pengujian Akurasi Analisis Sentimen

> Dokumen ini merangkum metodologi dan hasil pengujian akurasi model analisis
> sentimen pada Sistem Evaluasi Layanan MBG. Disusun sebagai bahan Bab Pengujian
> Tugas Akhir. Hasil bersifat reproducible melalui `npm run eval:sentimen`.

- **Model**: `w11wo/indonesian-roberta-base-sentiment-classifier` (HuggingFace Inference API)
- **Skrip evaluasi**: `scripts/evaluate-sentiment.ts`
- **Dataset uji**: `scripts/sentimen-gold-set.ts` (75 sampel berlabel manual)
- **Artefak hasil**: `evaluation_pairs.csv`, `evaluation_result.json`

---

## 1. Metodologi Pengujian

Pengujian akurasi model analisis sentimen dilakukan dengan pendekatan **gold
standard berlabel manual**. Sebanyak 75 sampel umpan balik simulasi yang
merepresentasikan ragam tanggapan siswa terhadap layanan MBG disusun dengan
distribusi seimbang antar kelas (25 POSITIF, 25 NETRAL, 25 NEGATIF). Setiap
sampel diberi label secara manual berdasarkan **pembacaan makna teks**, bukan
diturunkan dari rating numerik. Pendekatan ini menjadikan label sebagai acuan
kebenaran (gold standard) yang sah dibandingkan dengan prediksi model yang juga
berbasis teks.

Model yang diuji diakses melalui HuggingFace Inference API, menggunakan jalur
kode produksi yang sama dengan aplikasi (termasuk mekanisme *timeout* dan
*retry*). Metrik yang dihitung meliputi akurasi, presisi, *recall*, dan
F1-score per kelas, serta rata-rata *macro* dan *weighted*.

> **Catatan metodologis.** Pendekatan alternatif yang menurunkan *ground truth*
> dari rating numerik sengaja tidak digunakan untuk mengklaim akurasi, karena
> rating dan teks adalah dua sinyal berbeda sehingga hanya mengukur konsistensi
> rating–teks, bukan akurasi terhadap acuan kebenaran.

---

## 2. Hasil Pengujian

**Tabel 1. Metrik evaluasi per kelas**

| Kelas | Presisi | Recall | F1-Score | Support |
|-------|---------|--------|----------|---------|
| POSITIF | 0,61 | 1,00 | 0,76 | 25 |
| NETRAL | 1,00 | 0,04 | 0,08 | 25 |
| NEGATIF | 0,76 | 1,00 | 0,86 | 25 |
| **Akurasi** | | | **0,68** | 75 |
| Macro avg | 0,79 | 0,68 | 0,57 | 75 |

**Tabel 2. Confusion matrix** (baris = label manual, kolom = prediksi model)

| | POSITIF | NETRAL | NEGATIF |
|---|---|---|---|
| **POSITIF** | 25 | 0 | 0 |
| **NETRAL** | 16 | 1 | 8 |
| **NEGATIF** | 0 | 0 | 25 |

---

## 3. Analisis Hasil

Akurasi keseluruhan sebesar **68%** belum mencapai target NF.6 (75–80%). Namun,
distribusi kesalahan menunjukkan pola yang sangat spesifik dan dapat dijelaskan:

1. **Kelas berpolaritas jelas diklasifikasikan secara sempurna.** Seluruh 25
   sampel POSITIF dan 25 sampel NEGATIF diprediksi dengan benar (recall 100%).
   Apabila pengujian dibatasi pada 50 sampel berpolaritas tersebut, akurasi
   model mencapai **100%**.

2. **Kegagalan terkonsentrasi pada kelas NETRAL** (recall hanya 4%). Sebanyak 16
   sampel NETRAL diklasifikasikan sebagai POSITIF dan 8 sebagai NEGATIF. Hal ini
   disebabkan karakteristik sampel NETRAL yang bersifat *mixed-sentiment*
   (mengandung sisi positif dan negatif sekaligus, mis. *"Lauknya enak tapi
   sayurnya kurang matang"*), sementara model cenderung menangkap kata
   berpolaritas terkuat. Keterbatasan ini merupakan karakteristik umum model
   klasifikasi sentimen yang dilatih dominan untuk membedakan polaritas
   positif–negatif.

3. **Relevansi terhadap tujuan operasional sistem tetap tinggi.** Tujuan utama
   analisis sentimen pada sistem ini adalah mendeteksi keluhan agar dapat
   ditindaklanjuti tim dapur. Pada tugas deteksi keluhan (kelas NEGATIF), model
   mencapai **recall 100%** dengan presisi 76% — artinya tidak ada keluhan yang
   terlewat, meskipun terdapat sebagian *false alarm* dari teks netral. Dengan
   demikian, fungsi *closed-loop feedback* sistem tetap berjalan efektif.

---

## 4. Keterbatasan dan Rekomendasi Pengembangan

**Keterbatasan.** Akurasi tiga kelas dibatasi oleh lemahnya pengenalan kelas
NETRAL pada teks campuran. Ukuran dataset uji (75 sampel) juga relatif kecil
sehingga metrik berpotensi kurang stabil.

**Rekomendasi pengembangan.**

1. *Fine-tuning* model dengan korpus umpan balik MBG berlabel untuk memperkuat
   kelas NETRAL.
2. Penerapan *post-processing* berbasis ambang kepercayaan (skor rendah →
   NETRAL) untuk memulihkan sebagian sampel netral.
3. Perluasan dataset uji hingga ≥150 sampel dengan dua anotator dan pengukuran
   *inter-annotator agreement* (Cohen's Kappa) sebagai bukti reliabilitas
   pelabelan.

---

## 5. Cara Reproduksi

```bash
cd backend
# Pastikan HUGGINGFACE_API_TOKEN tersedia di .env
npm run eval:sentimen
```

Skrip akan memanggil model untuk setiap sampel pada `scripts/sentimen-gold-set.ts`,
mencetak ringkasan metrik ke terminal, lalu menulis `evaluation_pairs.csv`
(pasangan teks → label manual vs prediksi) dan `evaluation_result.json` (hasil
terstruktur) ke folder `backend/`.
