# Sistem Evaluasi Layanan MBG (Makan Bergizi Gratis)

Sistem web evaluasi layanan MBG yang mendukung 4 role pengguna: Admin, Tim Dapur, Guru, dan Penerima Manfaat.

## 🚀 Stack Teknologi

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 15 + TypeScript + App Router + Tailwind CSS |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT berbasis role |
| File Upload | Local Storage (siap diganti Supabase/S3) |
| Dokumentasi API | Swagger/OpenAPI |

## ⚙️ Setup Lokal

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14

### 1. Clone & Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Konfigurasi Environment

**Backend** — salin dan edit `.env`:
```bash
cp backend/.env.example backend/.env
```

Isi variabel utama:
```env
DATABASE_URL="postgresql://postgres:root@127.0.0.1:5432/mbg_db?schema=public"
JWT_SECRET="your-super-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=3001
```

**Frontend** — salin dan edit `.env.local`:
```bash
cp frontend/.env.example frontend/.env.local
```

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### 3. Migrasi Database

```bash
cd backend
npx prisma migrate dev
```

### 4. Seed Demo Data

```bash
cd backend
npm run db:seed
```

Setelah seed berhasil, akun berikut tersedia:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | Password123! | Admin |
| dapur@example.com | Password123! | Tim Dapur |
| guru@example.com | Password123! | Guru (SDN 01 Merdeka) |
| guru2@example.com | Password123! | Guru (SDN 02 Bahagia) |
| pm@example.com | Password123! | Penerima Manfaat |
| pm2@example.com | Password123! | Penerima Manfaat |
| pm3@example.com | Password123! | Penerima Manfaat |
| pm4@example.com | Password123! | Penerima Manfaat |

### 5. Jalankan Aplikasi

```bash
# Backend (port 3001)
cd backend
npm run start:dev

# Frontend (port 3000)
cd frontend
npm run dev
```

Buka: **http://localhost:3000**

Swagger API docs: **http://localhost:3001/api**

## 🗂️ Struktur Folder

```
Sistem MBG/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Demo seed
│   └── src/
│       ├── auth/                # JWT auth + guards
│       ├── admin-users/         # User CRUD (admin)
│       ├── dapur/               # Dapur CRUD
│       ├── sekolah/             # Sekolah CRUD
│       ├── kelas/               # Kelas CRUD
│       ├── menu/                # Menu master + jadwal
│       ├── distribusi/          # Distribusi management
│       ├── evaluasi/            # Evaluasi konsumsi
│       ├── upload/              # File upload abstraction
│       ├── dashboard/           # Dashboard stats per role
│       └── laporan/             # CSV export laporan
└── frontend/
    ├── app/
    │   ├── (auth)/login/        # Login page
    │   └── (dashboard)/
    │       ├── admin/           # Admin dashboard + master data
    │       ├── dapur/           # Tim Dapur dashboard + operasional
    │       ├── guru/            # Guru dashboard + konfirmasi
    │       ├── penerima-manfaat/ # PM dashboard + evaluasi
    │       └── laporan/         # Export CSV
    └── components/
        ├── layout/              # DashboardShell, PageHeader
        └── ui/                  # Card, Button, Badge, etc.
```

## 🔌 Endpoint Utama

### Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | /auth/login | Login, return JWT |
| GET | /auth/me | Info user login |

### Dashboard
| Method | Endpoint | Role |
|--------|----------|------|
| GET | /dashboard/admin | ADMIN |
| GET | /dashboard/dapur | TIM_DAPUR |
| GET | /dashboard/guru | GURU |
| GET | /dashboard/guru/monitoring | GURU |
| GET | /dashboard/pm | PENERIMA_MANFAAT |

### Laporan (CSV Export)
| Method | Endpoint | Role |
|--------|----------|------|
| GET | /laporan/distribusi | ADMIN, TIM_DAPUR |
| GET | /laporan/evaluasi | ADMIN, TIM_DAPUR, GURU |
| GET | /laporan/komponen | ADMIN, TIM_DAPUR |
| GET | /laporan/feedback | ADMIN, TIM_DAPUR, GURU |

Semua endpoint laporan menerima query param opsional: `tanggalAwal` dan `tanggalAkhir` (format: `YYYY-MM-DD`).

## 🧪 Menjalankan Test

```bash
cd backend
npm test                  # Semua unit test
npm run test:cov         # Dengan coverage report
npm run test:e2e         # E2E tests
```

Test yang tersedia:
- `auth.service.spec.ts` — Login flow, getMe, error cases
- `roles.guard.spec.ts` — Role access control
- `evaluasi.service.spec.ts` — Validasi tambahan, duplikasi, window 7 hari

## 🔄 Flow Sistem per Role

```
Admin
  → Buat user, dapur, sekolah, kelas
  → Mapping: sekolah → dapur, guru → sekolah, PM → sekolah/kelas

Tim Dapur
  → Buat menu master + komposisi
  → Set jadwal menu aktif
  → Buat distribusi ke sekolah

Guru
  → Terima notifikasi distribusi
  → Konfirmasi penerimaan + catatan kendala
  → Pantau siapa yang sudah/belum isi evaluasi

Penerima Manfaat
  → Lihat menu hari ini
  → Isi evaluasi: status konsumsi, rating, keterhabisan per komponen
  → Lihat riwayat evaluasi
```

## ⚠️ Known Limitations

1. **File upload** — Saat ini menggunakan local storage. Untuk production, ganti dengan Supabase Storage atau S3 melalui `UploadService`.
2. **Notifikasi real-time** — Tidak ada push notification. Guru perlu refresh halaman manual.
3. **Dashboard chart** — Dashboard belum menampilkan grafik/chart. Data numerik saja.
4. **Multi-dapur per sekolah** — Saat ini satu sekolah hanya bisa dipetakan ke satu dapur.
5. **Export PDF** — Laporan hanya tersedia dalam format CSV.
6. **Timezone** — Semua waktu menggunakan UTC. Tampilan frontend menggunakan `toLocaleDateString('id-ID')`.
7. **Pagination** — List data belum menggunakan pagination di semua endpoint.

## 🔒 Security Notes

- JWT token disimpan dalam HttpOnly cookie (tidak bisa diakses JavaScript).
- Setiap endpoint menggunakan JWT guard + role guard.
- File upload divalidasi tipe dan ukuran.
- Input teks di-sanitasi di level DTO dengan `class-validator`.

## 📝 Reset Database

Untuk reset total dan seed ulang:

```bash
cd backend
npm run db:reset
```

> ⚠️ Peringatan: `db:reset` akan menghapus semua data!
