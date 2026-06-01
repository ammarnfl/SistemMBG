/**
 * sentimen-gold-set.ts
 * --------------------------------------------------------------------------
 * DATASET UJI BERLABEL MANUAL (GOLD STANDARD) untuk evaluasi akurasi model
 * analisis sentimen (w11wo/indonesian-roberta-base-sentiment-classifier).
 *
 * METODOLOGI (untuk dibahas di Bab Pengujian):
 *   - Setiap `text` adalah contoh feedback realistis siswa SMA terhadap
 *     layanan MBG (data SIMULASI, sesuai batasan proposal).
 *   - `label` ditetapkan secara MANUAL dengan MEMBACA TEKS — bukan diturunkan
 *     dari rating angka. Inilah yang menjadikannya gold standard: label adalah
 *     penilaian manusia atas makna teks, sehingga sah dibandingkan dengan
 *     prediksi model yang juga berbasis teks.
 *   - Kelas: POSITIF (pujian/kepuasan), NEGATIF (keluhan/kekecewaan),
 *     NETRAL (campuran, datar, atau faktual tanpa kecondongan jelas).
 *
 * CARA MEMPERKUAT (opsional, untuk nilai akademik lebih tinggi):
 *   1. Tambah jumlah sampel hingga 150+ agar metrik lebih stabil.
 *   2. Minta 1–2 anotator kedua melabeli ulang, lalu hitung Cohen's Kappa
 *      sebagai bukti reliabilitas antar-anotator (inter-annotator agreement).
 *   3. Jaga keseimbangan jumlah antar kelas agar macro-average representatif.
 *
 * CATATAN: Kelas NETRAL sengaja diisi contoh "campuran" (ada sisi plus & minus
 * sekaligus) karena itulah kasus tersulit. Misklasifikasi pada baris ini wajar
 * dan justru menarik untuk dibahas pada analisis hasil.
 * --------------------------------------------------------------------------
 */

export const LABELS = ['POSITIF', 'NETRAL', 'NEGATIF'] as const;
export type GoldLabel = (typeof LABELS)[number];

export interface GoldItem {
  text: string;
  label: GoldLabel;
  /** Alasan singkat untuk kasus batas (borderline), opsional. */
  note?: string;
}

export const GOLD_SET: GoldItem[] = [
  // ===================== POSITIF =====================
  { text: 'Enak banget makanannya hari ini, ayamnya bumbunya meresap sampai dalam', label: 'POSITIF' },
  { text: 'Nasinya pulen, sayur bayamnya seger, aku suka banget', label: 'POSITIF' },
  { text: 'Rendangnya mantap, sampai nambah nasi dua kali', label: 'POSITIF' },
  { text: 'Porsinya pas dan rasanya enak, makasih tim dapur', label: 'POSITIF' },
  { text: 'Menunya makin variatif tiap minggu, salut deh', label: 'POSITIF' },
  { text: 'Pisangnya manis, seneng ada buah segarnya', label: 'POSITIF' },
  { text: 'Telur balado matengnya pas, bumbunya nendang', label: 'POSITIF' },
  { text: 'Alhamdulillah kenyang dan enak, semoga besok begini lagi', label: 'POSITIF' },
  { text: 'Sup ayamnya hangat dan gurih, ini menu favoritku', label: 'POSITIF' },
  { text: 'Tempe orek garing manisnya pas, juara', label: 'POSITIF' },
  { text: 'Semua dimakan habis, nggak ada yang nyisa di ompreng', label: 'POSITIF' },
  { text: 'Ikannya fresh nggak amis, gorengnya kering enak', label: 'POSITIF' },
  { text: 'Puas banget hari ini, rasanya pas di lidah', label: 'POSITIF' },
  { text: 'Konsisten enak dari kemarin-kemarin, pertahankan ya', label: 'POSITIF' },
  { text: 'Sayur sopnya seger, kuahnya bening enak', label: 'POSITIF' },
  { text: 'Dagingnya empuk gampang dikunyah, mantap', label: 'POSITIF' },
  { text: 'Bersih, rapi, dan rasanya enak, terima kasih banyak', label: 'POSITIF' },
  { text: 'Hari ini paling enak sih menurutku, lauknya lengkap', label: 'POSITIF' },
  { text: 'Bumbu semurnya medok, nasi anget, perfect', label: 'POSITIF' },
  { text: 'Seneng banget menunya sehat tapi tetap enak', label: 'POSITIF' },
  { text: 'Ayam gorengnya kriuk, sambelnya pas, top markotop', label: 'POSITIF' },
  { text: 'Makanannya masih hangat pas dibagiin, enak', label: 'POSITIF' },
  { text: 'Gizinya kerasa lengkap, ada protein sayur sama buah', label: 'POSITIF' },
  { text: 'Enak dan mengenyangkan, cocok buat sebelum belajar', label: 'POSITIF' },
  { text: 'Mantul, porsinya cukup dan rasanya bikin nagih', label: 'POSITIF' },

  // ===================== NEGATIF =====================
  { text: 'Nasinya keras kayak belum matang, susah ditelan', label: 'NEGATIF' },
  { text: 'Makanannya udah dingin pas sampai, jadi nggak enak', label: 'NEGATIF' },
  { text: 'Porsinya sedikit banget, sama sekali nggak kenyang', label: 'NEGATIF' },
  { text: 'Sayurnya hambar, kayak nggak dikasih bumbu sama sekali', label: 'NEGATIF' },
  { text: 'Ayamnya bau, kayaknya udah nggak fresh, takut basi', label: 'NEGATIF' },
  { text: 'Datangnya telat banget, jam istirahat keburu habis', label: 'NEGATIF' },
  { text: 'Sambalnya kepedesan parah sampai nggak bisa dimakan', label: 'NEGATIF' },
  { text: 'Lauknya cuma tahu doang, kurang bergizi', label: 'NEGATIF' },
  { text: 'Bau makanannya aneh, aku nggak berani makan', label: 'NEGATIF' },
  { text: 'Kuahnya basi, baunya asem, langsung aku buang', label: 'NEGATIF' },
  { text: 'Asin banget nggak ketulungan, kebanyakan garam', label: 'NEGATIF' },
  { text: 'Nasinya bau apek kayak beras lama', label: 'NEGATIF' },
  { text: 'Dingin dan lembek, rasanya kayak makanan sisa', label: 'NEGATIF' },
  { text: 'Nggak aku habisin karena bener-bener nggak enak', label: 'NEGATIF' },
  { text: 'Porsinya beda-beda, punyaku paling sedikit, nggak adil', label: 'NEGATIF' },
  { text: 'Tahunya udah basi, ada rasa asem-asemnya', label: 'NEGATIF' },
  { text: 'Sayur kangkungnya masih kotor, ada pasirnya', label: 'NEGATIF' },
  { text: 'Makanannya tumpah karena wadahnya bocor', label: 'NEGATIF' },
  { text: 'Telurnya amis banget, kayak belum mateng dalemnya', label: 'NEGATIF' },
  { text: 'Rasanya hambar semua, lauk sama sayur nggak ada rasa', label: 'NEGATIF' },
  { text: 'Kebanyakan minyak, bikin enek pas dimakan', label: 'NEGATIF' },
  { text: 'Daging ayamnya alot, susah dikunyah', label: 'NEGATIF' },
  { text: 'Nasinya basi, baru sesuap langsung aku tinggal', label: 'NEGATIF' },
  { text: 'Kecewa, hari ini menunya paling parah dari biasanya', label: 'NEGATIF' },
  { text: 'Porsi kecil, dingin, dan nggak ada rasanya, parah', label: 'NEGATIF' },

  // ===================== NETRAL =====================
  { text: 'Biasa aja sih, nggak enak tapi nggak jelek juga', label: 'NETRAL' },
  { text: 'Lumayan, tapi nasinya kebanyakan buat aku', label: 'NETRAL' },
  { text: 'Standar lah kayak hari-hari biasanya', label: 'NETRAL' },
  { text: 'Rasanya oke, cuma porsinya agak kebanyakan', label: 'NETRAL', note: 'Pujian ringan + keluhan ringan = campuran' },
  { text: 'Lauknya enak tapi sayurnya kurang matang', label: 'NETRAL', note: 'Plus & minus seimbang' },
  { text: 'Cukup mengenyangkan walaupun rasanya standar', label: 'NETRAL' },
  { text: 'Menunya sama kayak minggu lalu, gitu-gitu aja', label: 'NETRAL' },
  { text: 'Nasinya pas, lauknya biasa, nggak ada yang spesial', label: 'NETRAL' },
  { text: 'Ya cukup buat ganjel perut, nggak istimewa', label: 'NETRAL' },
  { text: 'Setengah enak setengah engga, tergantung lauknya', label: 'NETRAL' },
  { text: 'Porsinya pas tapi kurang variasi menunya', label: 'NETRAL' },
  { text: 'Lumayan lah daripada nggak makan siang', label: 'NETRAL' },
  { text: 'Rasanya oke, cuma kurang sayuran aja', label: 'NETRAL' },
  { text: 'Hari ini menunya nasi ayam sama sup, seperti biasa', label: 'NETRAL', note: 'Faktual tanpa kecondongan' },
  { text: 'Nggak terlalu enak tapi masih bisa dimakan kok', label: 'NETRAL', note: 'Negatif ringan yang dilunakkan' },
  { text: 'Cukup oke, mungkin lain kali tambah buah ya', label: 'NETRAL' },
  { text: 'Biasa aja, tapi tadi dibaginya agak telat dikit', label: 'NETRAL' },
  { text: 'Lauknya enak, sayurnya kurang, jadi seimbang aja', label: 'NETRAL' },
  { text: 'Nasi sama tempe, porsinya standar, ya gitu deh', label: 'NETRAL' },
  { text: 'Rasanya netral, nggak ada yang menonjol', label: 'NETRAL' },
  { text: 'Mungkin enak buat sebagian orang, buat aku biasa', label: 'NETRAL' },
  { text: 'Lumayan ngenyangin walau agak hambar dikit', label: 'NETRAL', note: 'Plus & minus ringan' },
  { text: 'Menunya cukup, nggak bikin kecewa tapi nggak wow', label: 'NETRAL' },
  { text: 'Hari ini agak beda dari biasa tapi tetap standar rasanya', label: 'NETRAL' },
  { text: 'Oke lah, masih wajar buat makan siang gratis', label: 'NETRAL' },
];
