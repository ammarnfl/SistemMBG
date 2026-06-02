# Lembar Skenario Uji UAT — Sistem MBG

> Isi kolom **Status** dengan ✅ (berhasil) / ❌ (gagal) / ⏭️ (lewati), dan tulis
> **Catatan** bila ada error, kejanggalan, atau saran. Satu lembar per penguji/role.

## Identitas Sesi

| Field | Isi |
|---|---|
| Tanggal / Jam | |
| Nama Penguji | |
| Role yang diuji | |
| Perangkat (HP/laptop, browser) | |
| Koneksi (WiFi / data seluler) | |
| URL Frontend (tunnel) | |

**Kredensial:** `siswa.uat@demo.test` · `dapur.uat@demo.test` · `guru.uat@demo.test` — password `UATDemo2025`

---

## 0. Umum / Autentikasi (semua role)

| No | Skenario / Langkah | Hasil Diharapkan | Status | Catatan |
|----|--------------------|------------------|:------:|---------|
| 0.1 | Buka URL frontend di perangkat | Halaman login tampil, tidak error | | |
| 0.2 | Login dengan email & password yang benar | Masuk ke dashboard sesuai role | | |
| 0.3 | Login dengan password salah | Muncul pesan "Email atau password salah" | | |
| 0.4 | Coba buka halaman role lain (mis. siswa buka `/admin`) | Ditolak / diarahkan ke halaman unauthorized | | |
| 0.5 | Logout | Kembali ke halaman login, sesi berakhir | | |
| 0.6 | Tampilan di layar HP (responsif) | Tata letak rapi, tombol mudah ditekan | | |

---

## 1. Role: SISWA (Penerima Manfaat)

| No | Skenario / Langkah | Hasil Diharapkan | Status | Catatan |
|----|--------------------|------------------|:------:|---------|
| 1.1 | Lihat dashboard | Menu hari ini & status evaluasi tampil | | |
| 1.2 | Lihat detail menu hari ini | Nama menu, komponen, info gizi tampil | | |
| 1.3 | Lihat foto menu | Foto termuat (tidak rusak) | | |
| 1.4 | Isi evaluasi — status **KONSUMSI** + rating | Tersimpan, status "sudah mengisi" | | |
| 1.5 | Beri feedback teks + **unggah foto** | Foto ter-upload & tampil setelah simpan | | |
| 1.6 | Isi penilaian per komponen (keterhabisan) | Skor per komponen tersimpan | | |
| 1.7 | Coba isi evaluasi **kedua kali** di hari sama | Ditolak / diberi tahu sudah mengisi | | |
| 1.8 | Isi evaluasi — status **TIDAK KONSUMSI** (hari lain) | Tersimpan tanpa wajib rating | | |
| 1.9 | Buka menu **Riwayat** | Daftar evaluasi 7 hari terakhir tampil | | |

---

## 2. Role: TIM DAPUR

| No | Skenario / Langkah | Hasil Diharapkan | Status | Catatan |
|----|--------------------|------------------|:------:|---------|
| 2.1 | Lihat dashboard dapur | Ringkasan distribusi/feedback tampil | | |
| 2.2 | Buat menu baru + isi info gizi | Menu tersimpan | | |
| 2.3 | **Unggah foto menu** | Foto ter-upload & tampil | | |
| 2.4 | Tambah / ubah komponen menu | Komponen tersimpan | | |
| 2.5 | Atur **jadwal menu harian** | Menu muncul di tanggal yang dipilih | | |
| 2.6 | **Buat distribusi** untuk hari ini | Tersimpan status `DRAFT` | | |
| 2.7 | Ubah status distribusi → `DIKIRIM` | Status berubah, terlihat oleh guru | | |
| 2.8 | Buka menu **Feedback** | Daftar feedback siswa tampil | | |
| 2.9 | Lihat **foto feedback** dari siswa | Foto termuat | | |
| 2.10 | Lihat **sentimen & kategori** feedback | Label sentimen & kategori tampil | | |
| 2.11 | **Tindak lanjuti (resolve)** sebuah feedback | Status feedback jadi "selesai ditindaklanjuti" | | |

---

## 3. Role: GURU

| No | Skenario / Langkah | Hasil Diharapkan | Status | Catatan |
|----|--------------------|------------------|:------:|---------|
| 3.1 | Lihat dashboard guru | Ringkasan distribusi/sekolah tampil | | |
| 3.2 | Lihat daftar distribusi masuk | Distribusi `DIKIRIM` dari dapur tampil | | |
| 3.3 | Lihat detail distribusi | Menu, jumlah porsi, catatan dapur tampil | | |
| 3.4 | **Konfirmasi penerimaan** → `DITERIMA` | Status berubah, tercatat sebagai dikonfirmasi | | |
| 3.5 | Tandai distribusi **BERMASALAH** + catatan | Status & catatan guru tersimpan | | |
| 3.6 | Buka **presensi / evaluasi** siswa | Data konsumsi siswa per kelas tampil | | |
| 3.7 | Buka **feedback** siswa | Daftar + foto + sentimen tampil | | |
| 3.8 | Buat **observasi** harian (jika ada) | Observasi tersimpan | | |

---

## 4. Role: ADMIN (opsional — jika diuji)

| No | Skenario / Langkah | Hasil Diharapkan | Status | Catatan |
|----|--------------------|------------------|:------:|---------|
| 4.1 | Lihat dashboard admin (agregat) | Angka konsisten dengan data | | |
| 4.2 | Kelola data Dapur / Sekolah / Kelas | Tambah/ubah tersimpan | | |
| 4.3 | Kelola user (buat/nonaktifkan) | Perubahan tersimpan | | |
| 4.4 | Buka & filter **Laporan** per periode | Data sesuai filter | | |

---

## 5. Penilaian Umum (diisi di akhir oleh penguji)

| Aspek | Skor (1–5) | Catatan |
|---|:--:|---|
| Kemudahan penggunaan | | |
| Kecepatan / responsivitas | | |
| Kejelasan tampilan & istilah | | |
| Kesesuaian dengan kebutuhan kerja | | |

**Temuan/bug paling mengganggu:**

**Saran perbaikan:**

**Kesimpulan penguji:** ☐ Diterima ☐ Diterima dengan catatan ☐ Perlu perbaikan

---

### Untuk fasilitator (rekap)

| Role | Total skenario | ✅ Berhasil | ❌ Gagal | ⏭️ Lewati |
|---|:--:|:--:|:--:|:--:|
| Siswa | 9 | | | |
| Tim Dapur | 11 | | | |
| Guru | 8 | | | |
| Admin | 4 | | | |
| Umum/Auth | 6 | | | |
