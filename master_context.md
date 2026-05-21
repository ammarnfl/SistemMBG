# Master Context Document - Sistem Evaluasi Layanan MBG

## 1. Overview
Sistem web evaluasi layanan Makan Bergizi Gratis (MBG) yang mendukung 4 role pengguna: Admin, Tim Dapur, Guru, dan Penerima Manfaat. Sistem ini bertujuan untuk mengelola distribusi makanan, menu harian, serta mengevaluasi konsumsi makanan beserta sentimen dari penerima manfaat. Dokumen ini disiapkan sebagai konteks awal (Master Context) agar AI atau developer baru dapat dengan cepat memahami arsitektur dan fungsionalitas sistem.

## 2. Tech Stack
**Frontend:**
- Framework: Next.js 15 (App Router) + React 19
- Styling: Tailwind CSS v4, Lucide React untuk ikon
- Authentication: `jose` untuk penanganan token JWT di middleware
- Bahasa: TypeScript

**Backend:**
- Framework: NestJS 11
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JWT, Passport berbasis Role
- Upload: Local Storage (dengan rencana migrasi ke S3/Supabase)
- Bahasa: TypeScript

## 3. Database Schema (Prisma)
Sistem menggunakan PostgreSQL dengan skema relasional berikut:

- **Users & Profiles:** `User` sebagai entitas utama untuk autentikasi. Terdapat relasi *one-to-one* ke tabel profil khusus: `TimDapurProfile`, `GuruProfile`, `PenerimaManfaatProfile` berdasarkan rolenya.
- **Master Data:**
  - `Dapur`: Mengelola data dapur pusat/cabang.
  - `Sekolah`: Tempat distribusi makanan dilakukan.
  - `Kelas`: Bagian dari Sekolah (untuk pengelompokan siswa).
  - `KomponenMaster`: Bahan atau komponen pembentuk menu (misal: Nasi, Ayam Goreng).
  - `MenuMaster`: Menu makanan utama yang menggabungkan beberapa `KomponenMaster`. Termasuk informasi gizi (Energi, Protein, Lemak, Karbohidrat).
- **Operasional & Distribusi:**
  - `MenuKomponen`: Relasi komponen-komponen ke sebuah menu.
  - `MenuHarian`: Penjadwalan menu per hari.
  - `Distribusi`: Data distribusi dari Dapur ke Sekolah. Memiliki status `DRAFT`, `DIKIRIM`, `DITERIMA`, `BERMASALAH`, `SELESAI`.
- **Evaluasi & Feedback:**
  - `EvaluasiHarian`: Diisi oleh Penerima Manfaat terkait status konsumsi, rating, hasil analisis sentimen (Positif/Netral/Negatif), foto bukti, dan feedback tertulis. Terdapat pencatatan proses resolusi feedback oleh Dapur (`feedbackResolved`).
  - `PenilaianKomponen`: Detail penilaian skor keterhabisan makanan untuk setiap komponen menu.

*(Skema detail dapat dilihat di dalam `backend/prisma/schema.prisma`)*

## 4. Flow Sistem per Role

- **Admin**
  - Bertugas mengelola master data secara keseluruhan (User, Dapur, Sekolah, Kelas).
  - Melakukan *mapping* relasi: mendaftarkan Sekolah ke Dapur tertentu, memasukkan Guru ke Sekolah, mendaftarkan Penerima Manfaat (Siswa) ke Sekolah dan Kelas.
- **Tim Dapur**
  - Mengelola operasional pembuatan menu master, komponen, dan penjadwalan menu harian.
  - Mengirim distribusi makanan harian ke sekolah yang terhubung.
  - Memantau **Dashboard Dapur** yang menampilkan analitik tingkat konsumsi, status pengiriman hari ini, serta distribusi sentimen feedback siswa.
  - Memiliki kemampuan untuk menjawab dan menyelesaikan (Resolve) keluhan/feedback dari siswa.
- **Guru**
  - Menerima notifikasi/memantau distribusi makanan yang dikirim ke sekolahnya.
  - Melakukan **konfirmasi penerimaan** dan mencatat kendala (jika ada).
  - Memonitor status evaluasi siswa di sekolahnya: melihat daftar siswa yang belum mengisi, serta memantau daftar keluhan (Feedback List) yang dikirim siswa ke Dapur.
- **Penerima Manfaat (Siswa)**
  - Mengakses sistem untuk melihat menu makanan pada hari tersebut.
  - Mengisi form evaluasi (mencakup status konsumsi total/tidak, tingkat keterhabisan masing-masing komponen makanan, rating 1-5, foto makanan, dan teks keluhan/saran).
  - Melihat riwayat evaluasi sebelumnya dan mengecek apakah keluhan/feedback mereka telah ditanggapi (Resolved) oleh pihak Dapur.

## 5. Struktur Direktori dan Modul Utama

**Frontend (`frontend/`)**
- `app/`: Menggunakan App Router Next.js.
  - `(auth)/login/`: Halaman login utama.
  - `(dashboard)/`: Halaman-halaman terproteksi yang dipisahkan berdasarkan segmentasi role:
    - `admin/`: Manajemen pengguna dan master data.
    - `dapur/`: Operasional dapur, dashboard analitik, dan manajemen feedback.
    - `guru/`: Monitoring distribusi dan status siswa per sekolah.
    - `penerima-manfaat/`: Antarmuka pengisian evaluasi.
    - `laporan/`: Halaman unduh/export laporan.
- `components/`: Kumpulan komponen React UI.
  - `ui/`: Komponen UI atomic (Card, Button, Badge, Modal, Form Input) yang distyling dengan Tailwind.
  - `layout/`: Shell layout dashboard yang mengatur struktur navigasi dan *sidebar*.
- `lib/` atau `utils/`: Utilitas untuk panggilan API, manajemen session JWT, dan helper UI.

**Backend (`backend/`)**
- `prisma/`: Berisi `schema.prisma` dan *seed script* untuk memasukkan data awal demonstrasi.
- `src/`: Berisi modul-modul (Modules, Controllers, Services) NestJS:
  - `auth/`: Mengurus login, pembuatan JWT, dan implementasi Guards (RoleGuard, JwtGuard).
  - `admin-users/`, `dapur/`, `sekolah/`, `kelas/`: Modul CRUD untuk Master Data.
  - `menu/`: Modul penjadwalan dan pengelolaan komponen makanan.
  - `distribusi/`: *State machine* perpindahan status pengiriman makanan.
  - `evaluasi/`: Penerimaan data evaluasi harian dari siswa beserta unggahan foto.
  - `sentimen/`, `feedback/`: Layanan untuk menganalisis sentimen teks evaluasi (secara otomatis mengkategorikan ke Positif/Netral/Negatif) dan resolusi keluhan.
  - `dashboard/`: Agregasi data statistik untuk mempopulasikan metrik di dashboard tiap-tiap role.
  - `laporan/`: Fitur ekspor/unduh laporan dalam format CSV.
  - `upload/`: Layanan *abstraksi* manajemen file.

## 6. Integrasi dan Fungsionalitas Khusus
- **Analisis Sentimen**: Ketika *Penerima Manfaat* mengirim evaluasi beserta teks feedback, backend (`sentimen/`) akan memproses teks tersebut untuk menentukan sentimen (`POSITIF`, `NETRAL`, `NEGATIF`). Ini diakumulasi dan ditampilkan sebagai chart progres/rasio di Dashboard Dapur.
- **Resolusi Masalah**: Proses *Closed-loop feedback* memungkinkan Tim Dapur untuk menekan tombol "Solve" pada keluhan siswa, memberikan catatan penyelesaian, yang kemudian akan terlihat di akun siswa yang bersangkutan.
- **Laporan Lintas Role**: Admin dan Tim Dapur (serta Guru untuk data sekolahnya saja) dapat menarik laporan CSV (`/laporan/distribusi`, `/laporan/evaluasi`, dsb) dengan filter rentang tanggal.

## 7. Known Limitations / Rencana Pengembangan (TODO)
- **File Upload Storage**: Saat ini unggahan foto evaluasi masih disimpan menggunakan file system lokal (Local Storage). Untuk skala produksi (Production), modul `upload` perlu disambungkan ke layanan Object Storage seperti S3 atau Supabase Storage.
- **Notifikasi Real-time**: Belum ada dukungan WebSocket / Push Notification; sehingga data di dashboard (misal: perubahan status pengiriman) mengharuskan pengguna melakukan *refresh* halaman.
- **Relasi Pemetaan**: Relasi antara Sekolah dan Dapur masih bersifat statis (1 Sekolah dilayani 1 Dapur).
- **Export Laporan PDF**: Sementara laporan sistem menggunakan format raw CSV. Export laporan dalam bentuk PDF grafis dapat menjadi pengembangan lanjutan.
- **Pagination Endpoint**: Belum semua endpoint *list data* (seperti riwayat evaluasi dalam jumlah masif) mendukung sistem *pagination/cursor* yang efisien di backend.
