# TUGAS: Implementasi F.14 — Kategorisasi Keluhan Otomatis (Topic Categorization)

> Dokumen ini adalah brief tugas yang lengkap & self-contained. Kerjakan sesuai
> spesifikasi. Bagian **ATURAN MIGRASI DATABASE** bersifat kritikal — baca penuh
> sebelum menyentuh database.

---

## 0. FILE YANG HARUS DIBACA DULU

Backend:
- `backend/prisma/schema.prisma` — model `EvaluasiHarian` (tempat feedback disimpan)
- `backend/src/evaluasi/evaluasi.service.ts` — method `createEvaluasi`
- `backend/src/feedback/feedback.service.ts` — `listFeedback` + interface `FeedbackListOpts`
- `backend/src/sentimen/sentimen.service.ts` — pola enrichment feedback yang sudah ada
- `backend/src/dashboard/dashboard.service.ts` — agregasi statistik + pola scoping per-dapur
- `backend/src/distribusi/distribusi.controller.ts` — pola guard `JwtAuthGuard` + `@Roles`
- `backend/src/distribusi/distribusi.service.spec.ts` — pola unit test
- `backend/prisma/migrations/` — format & timestamp migrasi
- `prisma.config.ts` — konfigurasi Prisma (memakai `@prisma/adapter-pg`)

Frontend:
- `frontend/app/(dashboard)/dapur/feedback/page.tsx`
- `frontend/app/(dashboard)/guru/feedback/page.tsx`
- Halaman dashboard dapur (komponen yang menampilkan statistik feedback/sentimen)
- `frontend/components/ui/` — komponen UI yang tersedia

---

## 1. KONTEKS SISTEM

"Sistem Evaluasi Layanan MBG" — aplikasi web berbasis role.

- **Backend**: NestJS 11 + Prisma 7 (`@prisma/client` ^7.7.0) + PostgreSQL (Supabase)
- **Frontend**: Next.js 15 (App Router) + React 19 + Tailwind v4 + TypeScript
- Response API dibungkus interceptor menjadi `{ data: ... }`. Frontend memanggil
  lewat `/api/proxy/...` lalu meng-unwrap `json.data`.

Umpan balik siswa disimpan di model `EvaluasiHarian`. Field relevan yang **sudah ada**:
`feedback String?`, `sentimen SentimenLabel?` (POSITIF/NETRAL/NEGATIF),
`sentimenSkor`, `feedbackResolved`, dll. Saat ini sistem **hanya** punya analisis
sentimen (3 kelas) — **belum** ada kategorisasi topik.

---

## 2. TUJUAN (F.14)

Sistem harus mengkategorikan **isi** feedback secara otomatis ke dalam topik
keluhan (mis. rasa, porsi, kualitas, kebersihan, distribusi), sehingga tim dapur
dapat melihat **kategori keluhan utama** di dashboard dan memfilter feedback per
kategori.

---

## 3. PENDEKATAN YANG SUDAH DIPUTUSKAN (JANGAN DIUBAH)

Gunakan **rule-based keyword tagger** — fungsi murni pencocokan kata kunci.

- BUKAN ML/training, BUKAN panggilan API eksternal. Alasan: deterministik, cepat,
  explainable, mudah di-test, sesuai altitude prototipe Tugas Akhir.
- Bersifat **multi-label**: satu feedback boleh masuk lebih dari satu kategori.
- Kategorisasi bersifat **topikal** dan dijalankan untuk semua feedback bertext.
  "Dashboard keluhan" memfilter agregasi hanya pada `sentimen = NEGATIF`.

---

## 4. SPESIFIKASI TEKNIS

### 4.1 Schema (`backend/prisma/schema.prisma`)

Tambahkan field scalar-list pada model `EvaluasiHarian`:

```prisma
  kategori  String[]  @default([])
```

Lalu jalankan `npx prisma generate` untuk memperbarui tipe client.

### 4.2 Service kategorisasi (modul baru `backend/src/kategori/`)

Buat `kategori.service.ts` berisi fungsi murni + dictionary kata kunci. Gunakan
ini sebagai titik awal (boleh diperkaya; normalisasi teks ke lowercase dulu):

```ts
export const KATEGORI_LIST = [
  'RASA', 'PORSI', 'KUALITAS', 'KEBERSIHAN', 'DISTRIBUSI', 'LAINNYA',
] as const;

export const KATEGORI_KEYWORDS: Record<string, string[]> = {
  RASA:       ['hambar','tawar','asin','pedas','manis','pahit','bumbu','rasa','gurih','kecut','asem','asam','enak'],
  PORSI:      ['porsi','sedikit','dikit','kurang','banyak','kecil','kenyang','nambah'],
  KUALITAS:   ['basi','bau','dingin','keras','lembek','mentah','amis','apek','busuk','alot','belum matang','kurang matang','fresh','segar'],
  KEBERSIHAN: ['kotor','pasir','rambut','bocor','wadah','jorok','najis'],
  DISTRIBUSI: ['telat','terlambat','lama','jam istirahat','belum datang','belum sampai','distribusi'],
};

// categorize(text: string | null): string[]
//   - text null/kosong            -> []
//   - cocok >=1 keyword           -> array kategori unik yang cocok
//   - text ada tapi tak ada cocok -> ['LAINNYA']
```

### 4.3 Integrasi saat pembuatan evaluasi

Di `backend/src/evaluasi/evaluasi.service.ts` method `createEvaluasi`: jika
`dto.feedback` ada, panggil `categorize()` dan simpan hasilnya ke field `kategori`
saat `prisma.evaluasiHarian.create(...)`. Kategorisasi sinkron (tanpa API), jadi
langsung terisi ketika record dibuat.

### 4.4 Backfill data lama

Sediakan endpoint admin `POST /sentimen/recategorize` (atau script di
`backend/scripts/`) yang menelusuri semua `EvaluasiHarian` dengan `feedback != null`
dan `kategori` kosong, lalu mengisi `kategori`. Lindungi dengan `JwtAuthGuard` +
`@Roles('ADMIN')` (lihat pola di `distribusi.controller.ts`).

### 4.5 Filter di daftar feedback

Di `backend/src/feedback/feedback.service.ts`: tambahkan opsi `kategori?: string`
ke `FeedbackListOpts` dan terapkan ke klausa `where` dengan
`{ kategori: { has: kategoriValue } }`. Tambahkan query param terkait di controller.

### 4.6 Dashboard "Kategori Keluhan Utama"

Di `backend/src/dashboard/dashboard.service.ts`: tambahkan agregasi jumlah feedback
per kategori, **dibatasi** pada `sentimen = 'NEGATIF'`, di-scope ke dapur user
(ikuti pola scoping yang sudah ada). Kembalikan array `{ kategori, jumlah }`
terurut menurun.

### 4.7 Frontend

Baca dulu file frontend di bagian 0. Lalu tambahkan:

- Chip/badge kategori pada tiap kartu feedback (render array `kategori`).
- Dropdown filter "Kategori" pada halaman feedback dapur (kirim sebagai query param).
- Widget "Kategori Keluhan Utama" di dashboard dapur (dari endpoint 4.6).

Gunakan komponen UI yang sudah ada di `frontend/components/ui/`.

---

## 5. ATURAN MIGRASI DATABASE (KRITIKAL)

Database adalah **Supabase production berisi data nyata**.

- **DILARANG** menjalankan `prisma migrate dev` terhadap Supabase. Shadow database
  tidak didukung pooler Supabase dan dapat memicu saran `migrate reset`.
- **JANGAN PERNAH** menjalankan `prisma migrate reset` (menghapus seluruh data).

Cara yang BENAR menambah kolom `kategori`:

1. Edit `schema.prisma` (tambah field) lalu `npx prisma generate`.
2. Buat folder migrasi manual dengan timestamp **lebih baru** dari migrasi terakhir
   (`20260531100000_distribusi_unique_sekolah_tanggal`), contoh
   `backend/prisma/migrations/20260601120000_evaluasi_kategori/migration.sql`:

   ```sql
   ALTER TABLE "evaluasi_harian" ADD COLUMN "kategori" TEXT[] NOT NULL DEFAULT '{}';
   ```

3. Terapkan dengan `npx prisma migrate deploy` (**bukan** `migrate dev`).
4. Verifikasi `npx prisma migrate status` → harus "Database schema is up to date!".

Catatan Prisma 7:
- `npx prisma db execute --stdin` (tanpa `--schema`).
- Cek drift: `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`.
- `DATABASE_URL` sudah ada di `.env`.

---

## 6. VERIFIKASI & TESTING (WAJIB)

- `npx tsc --noEmit` harus bersih.
- Buat `backend/src/kategori/kategori.service.spec.ts`: uji tiap kategori, kasus
  multi-label, kasus `LAINNYA`, dan text kosong → `[]`. Pola: lihat
  `backend/src/distribusi/distribusi.service.spec.ts`.
- `npm test` — pastikan tidak ada regresi baru.
  - Catatan: `evaluasi.service.spec.ts` **sudah** gagal sebelum tugas ini
    (mock Prisma kurang lengkap) — itu pre-existing. Namun jika kamu menyentuh
    `evaluasi.service.ts`, perbaiki mock-nya agar lulus.
- Smoke test manual: feedback "nasinya basi dan porsinya sedikit" → `kategori`
  harus `['KUALITAS','PORSI']`.

---

## 7. BATASAN (SCOPE)

- JANGAN tambah fitur di luar F.14 (no ML, no clustering, no API eksternal).
- Jaga konsistensi gaya kode & bahasa Indonesia pada komentar/pesan.
- Modular & testable. JANGAN ubah logika sentimen yang sudah ada.

---

## 8. DEFINITION OF DONE

1. Kolom `kategori` ada di DB (via `migrate deploy`) & `migrate status` bersih.
2. Evaluasi baru ber-feedback otomatis terisi `kategori`.
3. Endpoint/script backfill berjalan untuk data lama.
4. Filter kategori berfungsi di daftar feedback dapur.
5. Widget "Kategori Keluhan Utama" tampil di dashboard dapur.
6. Chip kategori tampil di kartu feedback (dapur & guru).
7. `tsc` bersih, unit test `kategori.service` lulus, tidak ada regresi baru.
