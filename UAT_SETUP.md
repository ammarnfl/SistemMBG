# UAT Setup Guide

Panduan menyiapkan sesi UAT: data dummy + akses publik via Cloudflare Tunnel.
Semua perintah `npm run ...` dijalankan dari **root** repo (`D:\Sistem MBG`),
kecuali disebut lain. Shell: **PowerShell** (Windows native).

## Cara kerja (penting dipahami)

Frontend memanggil backend **dari sisi server** (Next.js route `/api/proxy/*`
dan `/api/auth/login` berjalan di PC ini, lalu fetch ke `localhost:3001`).
Browser/HP responden **tidak pernah memanggil backend langsung**. Maka:

- `NEXT_PUBLIC_BACKEND_URL` **tetap `http://localhost:3001`** — JANGAN diarahkan
  ke URL tunnel (itu membuat login gagal: pernah jadi sumber bug).
- **CORS tidak relevan** (tak ada panggilan lintas-origin dari browser).
- Backend di-tunnel **hanya** agar **foto yang diunggah** (`${BACKEND_URL}/uploads/...`)
  bisa tampil di perangkat responden. `npm run env:uat` mengeset `BACKEND_URL`
  backend ke URL tunnel untuk itu.

## Prasyarat (sekali saja)

1. **cloudflared** terpasang:
   ```powershell
   winget install --id Cloudflare.cloudflared
   ```
   Cek: `cloudflared --version`. (Kalau baru install, buka terminal baru.)
2. Backend (`:3001`) & frontend (`:3000`) bisa jalan normal di lokal.
3. **`frontend/next.config.ts` sudah memuat** (sudah diterapkan):
   ```ts
   allowedDevOrigins: ["*.trycloudflare.com"]
   ```
   Tanpa ini, Next.js dev memblokir aset dev/HMR dari hostname tunnel (muncul
   peringatan "add it to allowedDevOrigins"). Wildcard `*` mencocokkan URL tunnel
   yang acak sehingga **tidak perlu diubah tiap sesi**. Berlaku setelah frontend
   di-(re)start.

---

## Urutan perintah sebelum setiap sesi

### 1. Siapkan data UAT
```powershell
npm run seed:uat
```
Membuat/menyegarkan entitas `UAT Demo` + 3 akun, mereset data sesi hari ini,
memastikan data historis ada. Idempotent & hanya menyentuh entitas UAT.

### 2. Pastikan backend & frontend jalan
```powershell
cd backend  ; npm run start:dev
cd frontend ; npm run dev
```

### 3. Start tunnel (terminal baru, biarkan berjalan)
```powershell
npm run tunnel:uat
```
Tunggu dua URL `*.trycloudflare.com` (FRONTEND & BACKEND) muncul.

### 4. Inject URL backend (untuk foto upload)
Di terminal lain:
```powershell
npm run env:uat
```
Mengeset `BACKEND_URL` di `backend/.env` = URL backend-tunnel. **Frontend tidak
diubah.** Backup `backend/.env.bak` dibuat otomatis.

### 5. Restart BACKEND saja
```powershell
cd backend ; npm run start:dev
```
Frontend **tidak perlu** di-restart (env-nya tidak berubah).

### 6. Test dari HP (matikan WiFi, pakai data seluler)
Buka URL **FRONTEND** dari langkah 3. Login:
`siswa.uat@demo.test` / `UATDemo2025`. Berhasil → sesi siap.

### 7. Share URL FRONTEND ke responden

> Catatan: jika sesi UAT modular dan **tidak melibatkan upload/lihat foto sama
> sekali**, langkah 3–5 cukup men-tunnel frontend saja; tapi alur default di atas
> aman untuk semua kasus.

---

## Setelah sesi selesai
```powershell
npm run env:restore
```
Lalu **Ctrl+C** di terminal tunnel, dan restart backend untuk kembali ke `localhost`.

---

## Kredensial akun UAT

| Role      | Email                | Password    |
|-----------|----------------------|-------------|
| Siswa     | siswa.uat@demo.test  | UATDemo2025 |
| Tim Dapur | dapur.uat@demo.test  | UATDemo2025 |
| Guru      | guru.uat@demo.test   | UATDemo2025 |

Entitas demo: **SPPG UAT Demo** · **SMA UAT Demo** · **XII UAT 1**.

---

## Catatan teknis

- Quick tunnel `trycloudflare.com` memberi URL **acak setiap kali** → ulangi
  langkah 4–5 tiap memulai tunnel baru.
- Data UAT terisolasi dari data showcase (`seed.ts`).
- Jangan jalankan `npm run db:seed` / `db:reset` saat sesi (mereset SELURUH DB).
- Foto seed lama memakai URL placeholder (storage.mbg.go.id) yang memang tidak
  termuat; foto **baru** yang diunggah saat sesi akan memakai URL backend-tunnel
  dan tampil normal.
- File `.uat-tunnel-urls` dan `*.env*.bak` sementara & sudah diabaikan git.
```
