# Dokumentasi Teknis — Sistem MBG Monitoring

> Diekstrak **apa adanya** dari kode (backend NestJS 11 + Prisma + PostgreSQL,
> frontend Next.js + React + Tailwind). Tidak ada fitur yang ditambahkan.
> Hal yang tidak ditemukan di kode ditandai **"tidak ada / belum diimplementasikan"**.
>
> ⚠️ Catatan akurasi penting: prompt menyebut "IndoBERT", tetapi **kode memakai
> model `w11wo/indonesian-roberta-base-sentiment-classifier`** (arsitektur
> RoBERTa, bukan BERT/IndoBERT) via HuggingFace Inference API. Lihat Bagian 4.

---

## 1. Skema Database Final

Sumber: `backend/prisma/schema.prisma` (datasource: PostgreSQL, generator:
prisma-client-js, engineType `library`).

### 1.1 Isi `schema.prisma` lengkap (apa adanya)

```prisma
generator client {
  provider   = "prisma-client-js"
  engineType = "library"
}

datasource db {
  provider = "postgresql"
}

model User {
  id                     String                  @id @default(cuid())
  email                  String                  @unique
  password               String
  name                   String
  role                   Role
  isActive               Boolean                 @default(true)
  createdAt              DateTime                @default(now())
  updatedAt              DateTime                @updatedAt
  distribusiDikonfirmasi Distribusi[]            @relation("ConfirmedDistribusi")
  distribusiDibuat       Distribusi[]            @relation("CreatedDistribusi")
  evaluasiHarian         EvaluasiHarian[]        @relation("EvaluasiUser")
  feedbackResolved       EvaluasiHarian[]        @relation("FeedbackResolver")
  guruProfile            GuruProfile?
  penerimaManfaatProfile PenerimaManfaatProfile?
  timDapurProfile        TimDapurProfile?
  observasiGuru          ObservasiGuru[]         @relation("ObservasiGuru")

  @@map("users")
}

model Dapur {
  id               String            @id @default(cuid())
  nama             String            @unique
  alamat           String?
  kontak           String?
  provinsi         String?
  kabupatenKota    String?
  kecamatan        String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  distribusi       Distribusi[]
  menuMaster       MenuMaster[]
  komponenMaster   KomponenMaster[]
  sekolah          Sekolah[]
  timDapurProfiles TimDapurProfile[]

  @@map("dapur")
}

model Sekolah {
  id                      String                   @id @default(cuid())
  nama                    String                   @unique
  alamat                  String?
  provinsi                String?
  kabupatenKota           String?
  kecamatan               String?
  dapurId                 String?
  createdAt               DateTime                 @default(now())
  updatedAt               DateTime                 @updatedAt
  distribusi              Distribusi[]
  guruProfiles            GuruProfile[]
  kelas                   Kelas[]
  penerimaManfaatProfiles PenerimaManfaatProfile[]
  dapur                   Dapur?                   @relation(fields: [dapurId], references: [id])
  observasiGuru           ObservasiGuru[]

  @@map("sekolah")
}

model Kelas {
  id                      String                   @id @default(cuid())
  nama                    String
  sekolahId               String
  createdAt               DateTime                 @default(now())
  updatedAt               DateTime                 @updatedAt
  sekolah                 Sekolah                  @relation(fields: [sekolahId], references: [id])
  penerimaManfaatProfiles PenerimaManfaatProfile[]

  @@map("kelas")
}

model TimDapurProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  dapurId   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  dapur     Dapur?   @relation(fields: [dapurId], references: [id])
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("tim_dapur_profiles")
}

model GuruProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  sekolahId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  sekolah   Sekolah? @relation(fields: [sekolahId], references: [id])
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("guru_profiles")
}

model PenerimaManfaatProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  nisn      String?  @unique
  sekolahId String?
  kelasId   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  kelas     Kelas?   @relation(fields: [kelasId], references: [id])
  sekolah   Sekolah? @relation(fields: [sekolahId], references: [id])
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("penerima_manfaat_profiles")
}

model KomponenMaster {
  id        String         @id @default(cuid())
  dapurId   String
  nama      String
  deskripsi String?
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
  dapur     Dapur          @relation(fields: [dapurId], references: [id])
  menuItems MenuKomponen[]

  @@unique([dapurId, nama])
  @@map("komponen_master")
}

model MenuMaster {
  id              String         @id @default(cuid())
  nama            String
  deskripsi       String?
  fotoUrl         String?
  energiKkal      Float?
  proteinGram     Float?
  lemakGram       Float?
  karbohidratGram Float?
  seratGram       Float?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  dapurId         String?
  distribusi      Distribusi[]
  jadwal          MenuHarian[]
  komponen        MenuKomponen[]
  dapur           Dapur?         @relation(fields: [dapurId], references: [id])

  @@map("menu_master")
}

model MenuKomponen {
  id               String              @id @default(cuid())
  menuId           String
  komponenMasterId String?
  namaSnapshot     String              @default("")
  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt
  menu             MenuMaster          @relation(fields: [menuId], references: [id], onDelete: Cascade)
  komponenMaster   KomponenMaster?     @relation(fields: [komponenMasterId], references: [id])
  penilaian        PenilaianKomponen[]

  @@map("menu_komponen")
}

model MenuHarian {
  id        String     @id @default(cuid())
  tanggal   DateTime   @db.Date
  menuId    String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  menu      MenuMaster @relation(fields: [menuId], references: [id], onDelete: Cascade)

  @@unique([tanggal, menuId])
  @@map("menu_harian")
}

model Distribusi {
  id             String           @id @default(cuid())
  tanggal        DateTime         @db.Date
  sekolahId      String
  dapurId        String
  jumlahPorsi    Int
  status         StatusDistribusi @default(DRAFT)
  catatanDapur   String?
  catatanGuru    String?
  createdById    String
  confirmedById  String?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  menuId         String?
  userConfirmed  User?            @relation("ConfirmedDistribusi", fields: [confirmedById], references: [id])
  userCreated    User             @relation("CreatedDistribusi", fields: [createdById], references: [id])
  dapur          Dapur            @relation(fields: [dapurId], references: [id])
  menu           MenuMaster?      @relation(fields: [menuId], references: [id])
  sekolah        Sekolah          @relation(fields: [sekolahId], references: [id])
  evaluasiHarian EvaluasiHarian[]
  observasiGuru  ObservasiGuru[]

  @@unique([sekolahId, tanggal])
  @@map("distribusi")
}

model EvaluasiHarian {
  id                   String              @id @default(cuid())
  tanggal              DateTime            @db.Date
  penerimaManfaatId    String
  distribusiId         String?
  statusKonsumsi       StatusKonsumsi
  ratingKeseluruhan    Int?
  feedback             String?
  fotoUrl              String?
  sentimen             SentimenLabel?
  sentimenSkor         Float?
  sentimenLabel        String?
  sentimenAnalyzedAt   DateTime?
  feedbackResolved     Boolean             @default(false)
  feedbackResolution   String?
  feedbackResolvedAt   DateTime?
  kategori             String[]            @default([])
  feedbackResolvedById String?
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt
  distribusi           Distribusi?         @relation(fields: [distribusiId], references: [id])
  penerimaManfaat      User                @relation("EvaluasiUser", fields: [penerimaManfaatId], references: [id])
  feedbackResolvedBy   User?               @relation("FeedbackResolver", fields: [feedbackResolvedById], references: [id])
  penilaianKomponen    PenilaianKomponen[]

  @@unique([tanggal, penerimaManfaatId])
  @@map("evaluasi_harian")
}

model PenilaianKomponen {
  id               String         @id @default(cuid())
  evaluasiId       String
  komponenId       String
  skorKeterhabisan Int
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  evaluasi         EvaluasiHarian @relation(fields: [evaluasiId], references: [id], onDelete: Cascade)
  komponen         MenuKomponen   @relation(fields: [komponenId], references: [id])

  @@unique([evaluasiId, komponenId])
  @@map("penilaian_komponen")
}

model ObservasiGuru {
  id           String      @id @default(cuid())
  guruId       String
  sekolahId    String
  distribusiId String?
  tanggal      DateTime    @db.Date
  isi          String
  kategori     String[]    @default([])
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  guru         User        @relation("ObservasiGuru", fields: [guruId], references: [id])
  sekolah      Sekolah     @relation(fields: [sekolahId], references: [id])
  distribusi   Distribusi? @relation(fields: [distribusiId], references: [id])

  @@index([sekolahId, tanggal])
  @@index([guruId])
  @@map("observasi_guru")
}

enum Role {
  ADMIN
  TIM_DAPUR
  GURU
  PENERIMA_MANFAAT
}

enum StatusDistribusi {
  DRAFT
  DIKIRIM
  DITERIMA
  BERMASALAH
  SELESAI
}

enum StatusKonsumsi {
  KONSUMSI
  TIDAK_KONSUMSI
}

enum SentimenLabel {
  POSITIF
  NETRAL
  NEGATIF
}
```

### 1.2 Ringkasan per model

| Model | Peran | Field penting (tipe) | Relasi |
|---|---|---|---|
| **User** (`users`) | Akun semua peran | `id` cuid, `email` unik, `password` (hash bcrypt), `name`, `role` (enum Role), `isActive` bool | 1–1 ke `GuruProfile`/`PenerimaManfaatProfile`/`TimDapurProfile`; 1–N distribusi (dibuat & dikonfirmasi), evaluasi, feedback resolver, observasi |
| **Dapur** (`dapur`) | Dapur/SPPG penyedia | `nama` unik, alamat/kontak/wilayah opsional | 1–N Distribusi, MenuMaster, KomponenMaster, Sekolah, TimDapurProfile |
| **Sekolah** (`sekolah`) | Sekolah penerima | `nama` unik, wilayah opsional, `dapurId` opsional | N–1 Dapur; 1–N Kelas, GuruProfile, PenerimaManfaatProfile, Distribusi, ObservasiGuru |
| **Kelas** (`kelas`) | Kelas dalam sekolah | `nama`, `sekolahId` | N–1 Sekolah; 1–N PenerimaManfaatProfile |
| **TimDapurProfile** | Pemetaan user TIM_DAPUR → Dapur | `userId` unik, `dapurId` opsional | 1–1 User (cascade delete), N–1 Dapur |
| **GuruProfile** | Pemetaan user GURU → Sekolah | `userId` unik, `sekolahId` opsional | 1–1 User (cascade), N–1 Sekolah |
| **PenerimaManfaatProfile** | Pemetaan siswa → Sekolah & Kelas | `userId` unik, `nisn` unik opsional, `sekolahId`, `kelasId` | 1–1 User (cascade), N–1 Sekolah & Kelas |
| **KomponenMaster** | Master komponen menu milik dapur | `nama`, `deskripsi`, `dapurId`; unik `[dapurId, nama]` | N–1 Dapur; 1–N MenuKomponen |
| **MenuMaster** | Master menu + info gizi | `nama`, `fotoUrl`, `energiKkal`/`proteinGram`/`lemakGram`/`karbohidratGram`/`seratGram` (Float?), `dapurId?` | N–1 Dapur; 1–N MenuKomponen, MenuHarian, Distribusi |
| **MenuKomponen** | Komponen pada satu menu | `menuId`, `komponenMasterId?`, `namaSnapshot` (default "") | N–1 MenuMaster (cascade) & KomponenMaster; 1–N PenilaianKomponen |
| **MenuHarian** | Jadwal menu per tanggal | `tanggal` `@db.Date`, `menuId`; unik `[tanggal, menuId]` | N–1 MenuMaster (cascade) |
| **Distribusi** | Pengiriman porsi ke sekolah/hari | `tanggal` Date, `sekolahId`, `dapurId`, `jumlahPorsi` Int, `status` (enum), `catatanDapur?`, `catatanGuru?`, `createdById`, `confirmedById?`, `menuId?`; **unik `[sekolahId, tanggal]`** | N–1 Sekolah, Dapur, MenuMaster, User(created/confirmed); 1–N EvaluasiHarian, ObservasiGuru |
| **EvaluasiHarian** | Evaluasi/presensi konsumsi siswa | `tanggal` Date, `penerimaManfaatId`, `distribusiId?`, `statusKonsumsi` (enum), `ratingKeseluruhan` Int?, `feedback?`, `fotoUrl?`, `sentimen?`, `sentimenSkor?` Float, `sentimenLabel?` String, `sentimenAnalyzedAt?`, `feedbackResolved` bool, `feedbackResolution?`, `feedbackResolvedAt?`, `feedbackResolvedById?`, `kategori` String[]; **unik `[tanggal, penerimaManfaatId]`** | N–1 Distribusi, User (penerima & resolver); 1–N PenilaianKomponen |
| **PenilaianKomponen** | Skor keterhabisan per komponen | `evaluasiId`, `komponenId`, `skorKeterhabisan` Int; unik `[evaluasiId, komponenId]` | N–1 EvaluasiHarian (cascade) & MenuKomponen |
| **ObservasiGuru** (`observasi_guru`) | Catatan/observasi guru | `guruId`, `sekolahId`, `distribusiId?`, `tanggal` Date, `isi` String, `kategori` String[]; index `[sekolahId,tanggal]`, `[guruId]` | N–1 User, Sekolah, Distribusi |

> Catatan: **feedback/komentar siswa BUKAN tabel terpisah** — disimpan sebagai
> kolom `feedback` (+ `sentimen`, `kategori`) di `EvaluasiHarian`.

### 1.3 Enum (lengkap)

- **Role**: `ADMIN`, `TIM_DAPUR`, `GURU`, `PENERIMA_MANFAAT`
- **StatusDistribusi**: `DRAFT`, `DIKIRIM`, `DITERIMA`, `BERMASALAH`, `SELESAI`
- **StatusKonsumsi**: `KONSUMSI`, `TIDAK_KONSUMSI`
- **SentimenLabel**: `POSITIF`, `NETRAL`, `NEGATIF`
- Field `sentimenLabel` (String biasa, bukan enum) menyimpan **label mentah model**
  (`positive`/`neutral`/`negative`).

---

## 2. Daftar Endpoint API

Prefix global: tidak ada (root). Interceptor global membungkus semua respons jadi
`{ success: true, data }` (`common/interceptors/response.interceptor.ts`).
ThrottlerGuard global aktif (`APP_GUARD`, default 120 req/60 dtk).

Legenda proteksi: **JWT** = `JwtAuthGuard`; **Role** = `RolesGuard` + `@Roles(...)`.
Jika `RolesGuard` aktif tetapi route tanpa `@Roles`, semua peran terautentikasi diizinkan.

### Auth — `/auth` (`auth.controller.ts`)
| Method + Path | Proteksi | Peran | Fungsi |
|---|---|---|---|
| POST `/auth/login` | Publik + `LoginThrottlerGuard` (`@Throttle 5/60s`, tracker per-email) | semua | Login, kembalikan `accessToken` + data user |
| GET `/auth/me` | JWT | semua terautentikasi | Data user yang sedang login |
| GET `/auth/fix-dapur` | JWT + Role | ADMIN | Utilitas one-off: buat `TimDapurProfile` untuk user TIM_DAPUR yang belum dipetakan |

### Admin Users — `/admin-users` (class: JWT + Role + `@Roles(ADMIN)`)
| Method + Path | Peran | Fungsi |
|---|---|---|
| POST `/admin-users` | ADMIN | Buat user |
| POST `/admin-users/batch` | ADMIN | Buat banyak user |
| GET `/admin-users` | ADMIN | List user |
| GET `/admin-users/:id` | ADMIN | Detail user |
| PATCH `/admin-users/:id` | ADMIN | Update user |
| PATCH `/admin-users/:id/nonaktifkan` | ADMIN | Nonaktifkan user |
| POST `/admin-users/:id/mapping-guru` | ADMIN | Petakan guru ke sekolah |
| POST `/admin-users/:id/mapping-pm` | ADMIN | Petakan penerima manfaat ke sekolah/kelas |
| POST `/admin-users/fix-dapur-mapping` | ADMIN | Utilitas perbaikan mapping dapur |

### Dapur — `/dapur` (class: JWT + Role + `@Roles(ADMIN)`)
POST `/dapur`, POST `/dapur/batch`, GET `/dapur`, GET `/dapur/:id`, PATCH `/dapur/:id`, DELETE `/dapur/:id` — **semua ADMIN** (CRUD dapur).

### Sekolah — `/sekolah` (class: JWT + Role; peran per-route)
| Method + Path | Peran |
|---|---|
| POST `/sekolah` · POST `/sekolah/batch` | ADMIN |
| GET `/sekolah` · GET `/sekolah/:id` | ADMIN, TIM_DAPUR, GURU |
| PATCH `/sekolah/:id` · DELETE `/sekolah/:id` | ADMIN |

### Kelas — `/kelas` (class: JWT + Role)
| Method + Path | Peran |
|---|---|
| POST `/kelas` · POST `/kelas/batch` | ADMIN |
| GET `/kelas` (opsional `?sekolahId`) · GET `/kelas/:id` | ADMIN, GURU |
| PATCH `/kelas/:id` · DELETE `/kelas/:id` | ADMIN |

### Menu — `/menu` (class: JWT + Role)
| Method + Path | Peran | Fungsi |
|---|---|---|
| GET `/menu/komponen-master` | TIM_DAPUR, ADMIN | List komponen master dapur |
| POST `/menu/komponen-master` | TIM_DAPUR | Buat komponen master |
| PUT `/menu/komponen-master/:id` | TIM_DAPUR | Update komponen master |
| DELETE `/menu/komponen-master/:id` | TIM_DAPUR | Hapus komponen master |
| POST `/menu` | TIM_DAPUR, ADMIN | Buat menu master |
| GET `/menu` | semua terautentikasi (tanpa `@Roles`) | List menu (di-scope per peran di service) |
| GET `/menu/:id` | semua terautentikasi | Detail menu |
| PUT `/menu/:id` | TIM_DAPUR, ADMIN | Update menu |
| DELETE `/menu/:id` | TIM_DAPUR, ADMIN | Hapus menu |
| POST `/menu/jadwal` | TIM_DAPUR, ADMIN | Set menu aktif untuk tanggal |
| GET `/menu/jadwal/list` (opsional `?tanggal`) | semua terautentikasi | List jadwal menu harian |

### Distribusi — `/distribusi` (class: JWT + Role)
| Method + Path | Peran | Fungsi |
|---|---|---|
| POST `/distribusi` | TIM_DAPUR, ADMIN | Buat 1 distribusi |
| POST `/distribusi/batch` | TIM_DAPUR, ADMIN | Buat banyak (1 transaksi) |
| GET `/distribusi` (`?dapurId&tanggal`) | TIM_DAPUR, ADMIN | List (TIM_DAPUR di-scope ke dapurnya) |
| GET `/distribusi/sekolah-saya` (`?tanggal`) | GURU | List distribusi sekolah guru |
| GET `/distribusi/:id` | semua terautentikasi | Detail distribusi |
| PATCH `/distribusi/:id/status` | TIM_DAPUR, ADMIN | Ubah status (sisi dapur) |
| PATCH `/distribusi/:id/konfirmasi` | GURU | Konfirmasi penerimaan (sisi guru) |

### Evaluasi — `/evaluasi` (class: JWT + Role)
| Method + Path | Peran | Fungsi |
|---|---|---|
| GET `/evaluasi/today` (`?date`) | PENERIMA_MANFAAT | Menu/distribusi hari ini untuk siswa |
| POST `/evaluasi` | PENERIMA_MANFAAT | Submit evaluasi harian |
| GET `/evaluasi/riwayat` | PENERIMA_MANFAAT | Riwayat evaluasi siswa |

### Sentimen — `/sentimen` (class: JWT + Role)
| Method + Path | Peran | Fungsi |
|---|---|---|
| POST `/sentimen/trigger` | ADMIN | Jalankan analisis sentimen manual untuk feedback pending |
| POST `/sentimen/recategorize` | ADMIN | Backfill kategorisasi feedback lama |

### Feedback — `/feedback` (class: JWT + Role)
| Method + Path | Peran | Fungsi |
|---|---|---|
| GET `/feedback` (filter: page, search, tanggalAwal/Akhir, sentimen, sekolahId, resolved, kategori) | TIM_DAPUR, GURU | List feedback paginated |
| GET `/feedback/sekolah` | TIM_DAPUR, GURU | Daftar sekolah untuk dropdown filter |
| POST `/feedback/:id/resolve` | TIM_DAPUR | Tandai feedback selesai ditindaklanjuti |
| GET `/feedback/last-refresh` | TIM_DAPUR, ADMIN | Waktu analisis sentimen terakhir |

### Dashboard — `/dashboard` (class: JWT + Role)
| Method + Path | Peran |
|---|---|
| GET `/dashboard/admin` | ADMIN |
| GET `/dashboard/dapur` (`?tanggalAwal&tanggalAkhir`) | TIM_DAPUR |
| GET `/dashboard/guru` | GURU |
| GET `/dashboard/guru/monitoring` | GURU |
| GET `/dashboard/guru/kelas` | GURU |
| GET `/dashboard/guru/presensi` (`?tanggal&search&kelasId`) | GURU |
| GET `/dashboard/pm` | PENERIMA_MANFAAT |

### Laporan — `/laporan` (class: JWT + Role; semua route `@Roles(ADMIN, TIM_DAPUR, GURU)`)
| Method + Path | Output |
|---|---|
| GET `/laporan/distribusi/data` | JSON paginated |
| GET `/laporan/evaluasi/data` | JSON paginated |
| GET `/laporan/komponen/data` | JSON paginated |
| GET `/laporan/feedback/data` | JSON paginated |
| GET `/laporan/distribusi` | **CSV** (download) |
| GET `/laporan/evaluasi` | **CSV** |
| GET `/laporan/komponen` | **CSV** |
| GET `/laporan/feedback` | **CSV** |

### Observasi Guru — `/observasi` (class: JWT + Role)
| Method + Path | Peran | Fungsi |
|---|---|---|
| POST `/observasi` | GURU | Kirim observasi |
| GET `/observasi` (`?distribusiId&tanggal&sekolahId`) | GURU, TIM_DAPUR, ADMIN | List observasi (scoped per peran) |
| DELETE `/observasi/:id` | GURU | Hapus observasi milik sendiri |

### Upload — `/upload` (`upload.controller.ts`)
| Method + Path | Proteksi | Fungsi |
|---|---|---|
| POST `/upload` (multipart `file`) | **TIDAK ADA guard** (publik) | Upload 1 file gambar ke storage lokal |

> ⚠️ Endpoint upload **tidak dilindungi JwtGuard/RoleGuard** di kode saat ini.

### Health — `/health` (`health.controller.ts`)
| Method + Path | Proteksi | Fungsi |
|---|---|---|
| GET `/health` | Publik | Status server |

> Modul **Kategori** (`kategori/`) hanya berisi service `categorize()` (rule-based
> keyword tagger) — **tidak ada controller/endpoint**, dipakai internal oleh
> evaluasi & sentimen.

---

## 3. Mekanisme Autentikasi & Otorisasi

### 3.1 Pembuatan JWT (backend)
- `auth.module.ts`: `JwtModule` dengan `secret = JWT_SECRET`, `expiresIn = JWT_EXPIRES_IN` (default `'7d'`).
- `auth.service.ts → login()`: cari user by email → cek `isActive` → `bcrypt.compare` (library **bcryptjs**) → buat token `jwtService.sign(payload)`.
- **Payload token**: `{ sub: user.id, email: user.email, role: user.role }` (lihat `JwtPayload` di `jwt.strategy.ts`).
- Respons login: `{ accessToken, user: { id, email, name, role } }`.

### 3.2 Validasi JWT (backend)
- `jwt.strategy.ts` (passport-jwt): token diambil dari header `Authorization: Bearer`, `ignoreExpiration: false`, `secretOrKey = JWT_SECRET`.
- `validate(payload)`: ambil user by `payload.sub`; jika tidak ada atau `!isActive` → `UnauthorizedException`; return user tanpa password (di-inject ke `req.user`).
- `JwtAuthGuard` = `AuthGuard('jwt')`.

### 3.3 Otorisasi per peran (`RolesGuard`)
- `@Roles(...roles)` menyimpan metadata `ROLES_KEY` (`roles.decorator.ts`).
- `role.guard.ts`: baca required roles via `Reflector.getAllAndOverride` (handler + class). Jika tidak ada role yang ditetapkan → **izinkan**. Jika ada → cek `requiredRoles.includes(user.role)`; jika tidak cocok → `ForbiddenException`.

### 3.4 Throttling login
- `LoginThrottlerGuard` (extends `ThrottlerGuard`): tracker memakai **email** (`login-email:<email>`), fallback IP. Route login `@Throttle 5/60_000`.

### 3.5 Proteksi route di frontend (`frontend/middleware.ts`, library **jose**)
- `publicRoutes = ['/login', '/api/auth/login']`.
- Token dibaca dari cookie **`auth_token`** (httpOnly, di-set oleh route handler `app/api/auth/login/route.ts`).
- Verifikasi: `jwtVerify(token, secret)` dengan `secret = JWT_SECRET` frontend (fallback string default sama dengan backend).
- Jika di route publik **dan** sudah punya token valid → redirect ke dashboard sesuai `payload.role` (`ADMIN`→`/admin`, `TIM_DAPUR`→`/dapur`, `GURU`→`/guru`, `PENERIMA_MANFAAT`→`/penerima-manfaat`).
- Jika route privat **tanpa** token → redirect `/login`.
- Pembatasan per peran berbasis prefix path: `/admin`→ADMIN, `/dapur`→TIM_DAPUR, `/guru`→GURU, `/penerima-manfaat`→PENERIMA_MANFAAT; mismatch → redirect `/unauthorized`. Role valid → set header `x-user-role`, `x-user-id`.
- Token invalid → redirect `/login` + hapus cookie.
- `matcher` mengecualikan `_next/static`, `_next/image`, `favicon.ico`, dan file gambar.

### 3.6 Arsitektur pemanggilan API frontend (relevan untuk auth)
- Komponen klien memanggil **route handler same-origin** (`/api/auth/login`, `/api/proxy/[...path]`), bukan backend langsung.
- `app/api/auth/login/route.ts`: fetch `${NEXT_PUBLIC_BACKEND_URL}/auth/login` di sisi server, lalu set cookie httpOnly `auth_token` (`secure` hanya saat `NODE_ENV=production`, `sameSite: 'lax'`, `maxAge` 7 hari).
- `app/api/proxy/[...path]/route.ts`: meneruskan request ke backend, melampirkan `Authorization: Bearer <auth_token>` dari cookie.
- Ada juga route handler `app/api/auth/logout/route.ts` (mengelola cookie sesi).

---

## 4. Modul Sentiment Analysis (detail)

Sumber utama: `backend/src/sentimen/sentimen.service.ts` (+ controller & module).

### 4.1 Model yang dipakai (apa adanya)
- **Checkpoint persis**: `w11wo/indonesian-roberta-base-sentiment-classifier`.
- **Sumber**: HuggingFace **Inference API** (hosted), endpoint:
  `https://router.huggingface.co/hf-inference/models/w11wo/indonesian-roberta-base-sentiment-classifier`.
- **Arsitektur**: RoBERTa (Indonesian RoBERTa base) — **bukan BERT/IndoBERT**. Istilah "IndoBERT" di judul TA tidak sesuai dengan model di kode.
- **Fine-tune?**: **Tidak ada kode fine-tuning di repo ini.** Model dipakai **as-is** lewat hosted inference (model publik tersebut memang sudah versi terlatih untuk klasifikasi sentimen, tetapi proyek ini tidak melatih/menyetelnya — hanya memanggil).
- **Lokal/Python?**: **Tidak ada proses Python / service lokal.** Tidak ada model lokal. Pemanggilan murni REST dari backend.

### 4.2 Kelas output & pemetaan
- Model mengembalikan **3 kelas native**: `positive`, `neutral`, `negative` (struktur respons `HuggingFaceResult[][]`).
- Service memilih label dengan **skor tertinggi (argmax)** dari hasil, lalu memetakan via `mapLabel()`:
  - `'positive'` → `POSITIF`
  - `'negative'` → `NEGATIF`
  - selain itu (termasuk `'neutral'`) → `NETRAL`
- **NETRAL bersifat native** dari model (label `neutral`), **bukan** hasil threshold/aturan tambahan. Tidak ada threshold skor untuk menentukan netral.
- Yang disimpan ke `EvaluasiHarian`: `sentimen` (enum hasil map), `sentimenSkor` (skor float label teratas), `sentimenLabel` (label mentah string), `sentimenAnalyzedAt` (timestamp).

### 4.3 Preprocessing teks
- **Tidak ada preprocessing.** Teks `feedback` dikirim apa adanya sebagai `{ inputs: text }`. Tidak ada lowercasing/normalisasi/stopword/stemming sebelum dikirim ke model.

### 4.4 Cara backend memanggil & menjalankan
- **Bahasa & library**: TypeScript (NestJS). HTTP via **`fetch` native** Node + `AbortSignal.timeout` (tanpa axios). Penjadwalan via `@nestjs/schedule` (`@Cron`).
- Header: `Authorization: Bearer <HUGGINGFACE_API_TOKEN>` (dari env), `Content-Type: application/json`.
- **Timeout** 8000 ms; **retry** 1× untuk kegagalan transient. Status yang di-retry: `429, 502, 503, 504` (dan timeout/network error). Maks 2 attempt; gagal → `null`.
- **Trigger**:
  1. **Cron tiap jam** (`@Cron(CronExpression.EVERY_HOUR)` → `processPendingFeedback()`): cari `EvaluasiHarian` dengan `feedback != null AND sentimen == null`, proses satu per satu (jeda 150 ms antar item), update hasil.
  2. **Manual** (`POST /sentimen/trigger`, ADMIN → `triggerManual()`): logika sama, kembalikan `{ processed, skipped }`.
- Kategorisasi feedback (RASA/PORSI/KUALITAS/KEBERSIHAN/DISTRIBUSI/LAINNYA) **terpisah** dari sentimen: fungsi rule-based `categorize()` di `kategori/kategori.service.ts` (pencocokan kata kunci), dipanggil saat evaluasi dibuat dan bisa di-backfill via `POST /sentimen/recategorize`.

---

## 5. Alur Bisnis Utama (state & trigger)

### 5.1 State machine Distribusi (`distribusi.service.ts`)
Sumber kebenaran: konstanta `TRANSITIONS` + helper `isValidTransition()` / `assertTransition()` (transisi `from === to` ditolak).

**Transisi sah oleh TIM_DAPUR** (endpoint `PATCH /distribusi/:id/status`):
| Dari | Ke yang diizinkan |
|---|---|
| DRAFT | DIKIRIM, BERMASALAH |
| DIKIRIM | — (kosong) |
| DITERIMA | SELESAI |
| BERMASALAH | SELESAI |
| SELESAI | — |

**Transisi sah oleh GURU** (endpoint `PATCH /distribusi/:id/konfirmasi`, set `confirmedById`, `catatanGuru`):
| Dari | Ke yang diizinkan |
|---|---|
| DRAFT | — |
| DIKIRIM | DITERIMA, BERMASALAH |
| DITERIMA | DIKIRIM, BERMASALAH |
| BERMASALAH | DITERIMA |
| SELESAI | — |

**Pemicu happy-path**: `DRAFT →(TIM_DAPUR)→ DIKIRIM →(GURU)→ DITERIMA →(TIM_DAPUR)→ SELESAI`.
`BERMASALAH` dapat dicapai dari DRAFT (TIM_DAPUR), atau dari DIKIRIM/DITERIMA (GURU); dari BERMASALAH bisa ke SELESAI (TIM_DAPUR) atau kembali ke DITERIMA (GURU).
Catatan: **tidak ada** jalur linear paksa `DITERIMA→BERMASALAH→SELESAI` tunggal; transisi mengikuti tabel di atas per aktor.
Ownership: TIM_DAPUR hanya boleh ubah distribusi dapurnya (ADMIN bypass via endpoint status); GURU hanya boleh konfirmasi distribusi sekolahnya. Status awal saat create default `DRAFT`. Unik `[sekolahId, tanggal]` mencegah duplikat (error diterjemahkan ramah).

### 5.2 Alur evaluasi harian siswa (`evaluasi.service.ts`, `create-evaluasi.dto.ts`)
**Field yang diisi**: `tanggal` (YYYY-MM-DD), `distribusiId?`, `statusKonsumsi` (KONSUMSI/TIDAK_KONSUMSI), `ratingKeseluruhan?` (1–5), `penilaianKomponen[]?` (`{ komponenId, skorKeterhabisan 1–5 }`), `feedback?`, `fotoUrl?`.

**Urutan validasi di `createEvaluasi()`**:
1. **Batas waktu 7 hari**: jika `(sekarang - tanggal) > 7 hari` → ditolak.
2. **Status distribusi** (jika `distribusiId` ada): distribusi harus `DITERIMA`, `SELESAI`, atau `BERMASALAH`; selain itu ditolak ("belum dikonfirmasi guru").
3. **Anti-duplikat**: unik `[tanggal, penerimaManfaatId]` — jika sudah ada → ditolak.
4. **Aturan wajib foto/feedback (trigger persis di kode)**:
   ```
   if (statusKonsumsi === 'TIDAK_KONSUMSI'
       || (ratingKeseluruhan && ratingKeseluruhan <= 2)
       || (penilaianKomponen?.some(k => k.skorKeterhabisan <= 2))) {
     if (!feedback && !fotoUrl) → tolak ("Feedback atau Foto wajib...")
   }
   ```
   Artinya bila **tidak konsumsi**, atau **rating ≤ 2**, atau **ada komponen dengan skor ≤ 2**, maka **minimal salah satu** dari `feedback`/`fotoUrl` wajib diisi.
5. **Kategorisasi otomatis**: `kategori = categorize(feedback)`.
6. Buat record + `penilaianKomponen` (nested create).

### 5.3 Closed-loop feedback resolution (`feedback.service.ts`)
- Endpoint **`POST /feedback/:id/resolve`** — **hanya TIM_DAPUR** (decorator `@Roles(TIM_DAPUR)`).
- `resolveFeedback(userId, feedbackId, resolution)`: verifikasi feedback milik dapur user (`distribusi.dapurId`); **guru ditolak eksplisit** ("Guru tidak dapat menanggapi feedback").
- Update: `feedbackResolved = true`, `feedbackResolution = <teks>`, `feedbackResolvedAt = now`, `feedbackResolvedById = userId`.
- Status resolusi ini ditampilkan kembali di presensi guru & list feedback.

### 5.4 Agregasi dashboard per peran (`dashboard.service.ts`)
- **ADMIN** (`getAdminStats`): count `totalUser` (aktif), `totalDapur`, `totalSekolah`, `totalKelas`; jumlah mapping (sekolah→dapur, guru→sekolah, PM→sekolah); breakdown user per role (`groupBy role`).
- **TIM_DAPUR** (`getDapurStats`, filter tanggal opsional, di-scope ke dapur user): `totalDistribusi`, `totalEvaluasi`, rata-rata `ratingKeseluruhan` (`_avg`), distribusi per status (`groupBy status`), status hari ini (selalu hari ini), 5 komponen dengan rata `skorKeterhabisan` terendah (`groupBy komponenId` + `_avg asc`), distribusi sentimen (`groupBy sentimen`), agregasi `kategoriKeluhan` (unnest array kategori dari feedback NEGATIF di sisi aplikasi), 5 feedback terbaru.
- **GURU** (`getGuruStats`): sekolah, distribusi hari ini (+menu+komponen), `totalPM`, `sudahIsi`/`belumIsi` hari ini, 5 feedback terbaru, presensi terbaru. Plus `getGuruMonitoring` (daftar PM sudah/belum isi), `getGuruKelas`, `getGuruPresensi` (status konsumsi + feedback per siswa per tanggal/kelas; `adaMBG=false` bila tak ada distribusi).
- **PENERIMA_MANFAAT** (`getPMStats`): `sudahIsiHariIni`, ringkas evaluasi hari ini, `riwayat7Hari` (7 record terakhir).
- Semua perhitungan memakai Prisma `count/aggregate/groupBy/findMany`; normalisasi tanggal ke UTC midnight.

### 5.5 Format & isi ekspor CSV laporan (`laporan.service.ts`)
- Helper `toCsv(headers, rows)`: pemisah koma, escaping tanda kutip ganda (`"` → `""`) bila ada koma/kutip/newline; baris dipisah `\n`.
- Controller menambahkan **BOM UTF-8** (`'﻿' + csv`), header `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="laporan-<jenis>.csv"`.
- Data di-scope per peran (TIM_DAPUR→dapurnya, GURU→sekolahnya, ADMIN→semua). Ekspor mengambil **semua baris** (tanpa pagination).
- **Header kolom per laporan**:
  - **Distribusi**: `ID, Tanggal, Dapur, Sekolah, Menu, Jumlah Porsi, Status, Catatan Dapur, Catatan Guru, Dibuat Oleh`
  - **Evaluasi**: `ID, Tanggal, Penerima Manfaat, Email, Sekolah, Menu, Status Konsumsi, Rating Keseluruhan, Feedback, Foto URL`
  - **Komponen**: `ID, Tanggal, Penerima Manfaat, Sekolah, Komponen Menu, Skor Keterhabisan`
  - **Feedback**: `ID, Tanggal, Penerima Manfaat, Sekolah, Rating, Sentimen, Skor Sentimen, Feedback, Foto URL` (sentimen ditampilkan "Positif/Negatif/Netral", skor `toFixed(3)`)

---

## 6. Konfirmasi Fitur — ADA / TIDAK

| Fitur | Status | Lokasi / Catatan |
|---|---|---|
| Notifikasi/alert **real-time** (push/websocket/SSE) | **TIDAK ADA** | Tidak ada gateway/websocket/`EventSource` di backend maupun frontend. Yang ada hanya komponen UI **Toast** (`frontend/components/ui/Toast.tsx`) untuk pesan in-app klien — bukan notifikasi real-time. |
| **Verifikasi/koreksi presensi oleh guru** | **TIDAK ADA** | Evaluasi/presensi hanya dibuat oleh PENERIMA_MANFAAT (`POST /evaluasi`). Tidak ada endpoint guru untuk mengubah/mengoreksi evaluasi siswa. Guru hanya **melihat** presensi (`/dashboard/guru/presensi`, `/dashboard/guru/monitoring`), mengonfirmasi distribusi, dan membuat observasi. |
| **Anomaly detection** | **TIDAK ADA** | Tidak ada kode/heuristik deteksi anomali. |
| **Rekomendasi menu** | **TIDAK ADA** | Tidak ada logika rekomendasi. |
| **Pagination** endpoint list | **ADA** | `feedback.service.ts` (`pageSize 10`); `laporan.service.ts` endpoint `*/data` (`pageSize 10`, kembalikan `{ data, total, page, pageSize, totalPages }`). Endpoint list lain (dapur, sekolah, menu, distribusi, dll) **tidak** paginated. |
| **Upload foto** — lokal / S3 / Supabase | **LOKAL (aktif)** | `upload.module.ts` memakai **multer `diskStorage` → folder `./uploads`** (filter MIME jpg/png/webp/heic/heif, maks 8 MB, 1 file). `upload.service.ts` mengembalikan URL `${BACKEND_URL}/uploads/<file>`. **Supabase**: paket `@supabase/supabase-js` ada di `package.json` dan variabel `SUPABASE_*` ada di `.env`, **tetapi tidak ada `createClient`/pemakaian Supabase di kode** → tidak aktif. Frontend `lib/image-url.ts` (`resolveImgUrl`) memproksikan `/uploads/...` lewat `/api/proxy`. |

---

## 7. Struktur Direktori Aktual (kecuali `node_modules`)

### 7.1 Backend (`backend/`)
```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── seed-uat.ts
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── admin-users/ (controller, service, module, dto/)
│   ├── auth/
│   │   ├── auth.controller.ts / auth.service.ts / auth.module.ts
│   │   ├── decorators/ (roles.decorator.ts)
│   │   ├── dto/ (login.dto.ts)
│   │   ├── guards/ (jwt.guard.ts, role.guard.ts, login-throttler.guard.ts)
│   │   └── strategies/ (jwt.strategy.ts)
│   ├── common/interceptors/ (response.interceptor.ts)
│   ├── dapur/ (controller, service, module, dto/)
│   ├── dashboard/ (controller, service, module)
│   ├── distribusi/ (controller, service, module, dto/)
│   ├── evaluasi/ (controller, service, module, dto/)
│   ├── feedback/ (controller, service, module)
│   ├── health/ (health.controller.ts)
│   ├── kategori/ (kategori.service.ts, module)  ← tanpa controller
│   ├── kelas/ (controller, service, module, dto/)
│   ├── laporan/ (controller, service, module)
│   ├── menu/ (controller, service, module, dto/)
│   ├── observasi/ (controller, service, module, dto/)
│   ├── prisma/ (prisma.service.ts, prisma.module.ts)
│   ├── sekolah/ (controller, service, module, dto/)
│   ├── sentimen/ (controller, service, module)
│   └── upload/ (controller, service, module)
└── test/ (app.e2e-spec.ts, jest-e2e.json)
```
File uji unit yang ada (`*.spec.ts`): `auth.service.spec.ts`, `roles.guard.spec.ts`,
`evaluasi.controller.spec.ts` & `evaluasi.service.spec.ts`, `distribusi.service.spec.ts`,
`kategori.service.spec.ts`, `upload.controller.spec.ts`.

### 7.2 Frontend (`frontend/`)
```
frontend/
├── middleware.ts
├── next.config.ts
├── app/
│   ├── layout.tsx / page.tsx
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── admin/ (page.tsx, dapur/, kelas/, sekolah/, users/)
│   │   ├── dapur/ (page, distribusi/, feedback/, jadwal/, menu/ [+ menu/[id]])
│   │   ├── guru/ (page, distribusi/ [+ [id]], feedback/, presensi/)
│   │   ├── penerima-manfaat/ (page, evaluasi/, riwayat/)
│   │   └── laporan/page.tsx
│   ├── api/
│   │   ├── auth/login/route.ts
│   │   ├── auth/logout/route.ts
│   │   └── proxy/[...path]/route.ts
│   └── unauthorized/page.tsx
├── components/
│   ├── layout/ (DashboardShell, PageHeader, StateCard)
│   └── ui/ (Badge, Button, Card, ConfirmDialog, DataTable, FormComponents,
│            ImageLightbox, Input, Select, SentimentBadge, StatCard,
│            StatusBadge, Tabs, Toast)
└── lib/ (api-client.ts, image-url.ts)
```

---

### Lampiran — Catatan kejujuran/ketidaksesuaian
1. **"IndoBERT" vs kode**: model nyata = `w11wo/indonesian-roberta-base-sentiment-classifier` (RoBERTa) via HF Inference API; bukan IndoBERT, bukan model lokal, tanpa fine-tuning di repo.
2. **Sentimen 3 kelas native** (positive/neutral/negative); NETRAL bukan hasil threshold.
3. **Endpoint `/upload` tanpa guard** (publik) pada kode saat ini.
4. **Supabase tidak aktif** di kode (hanya dependency + env); penyimpanan foto = lokal `./uploads`.
5. **`api-client.ts`** (`fetchApi`) berisi stub yang mengembalikan `{}` — pemanggilan nyata memakai route handler `/api/proxy` & `/api/auth/login`.
```
