# Sistem MBG — Design System (Sumber Kebenaran Tunggal)

> Status: **APPROVED (2026-06-06)** — kontrak final FASE 0.
> Keputusan: (1) success/warning = **Opsi A** (palet status terpusat, bukan token brand);
> (2) hapus 4 file UI duplikat + buat `FormField`/`LoadingSkeleton` saat dibutuhkan di FASE 2;
> (3) **tanpa breadcrumb** di `PageHeader`.
> Dokumen ini mengekstrak token & pola yang **sudah ada** di kode, menetapkan
> aturan final, dan menandai yang berantakan/duplikat.
>
> Stack: Next.js 15 (App Router), React 19, Tailwind CSS v4 (`@theme` di
> `app/globals.css`, **tanpa** `tailwind.config.js`), TypeScript, Lucide React.

---

## 0. Prinsip

- **Token dulu, utility mentah belakangan.** Warna & radius lewat token semantik.
  Dilarang hex hardcoded di komponen/halaman (saat ini sudah bersih — pertahankan).
- **Pakai komponen `components/ui/` & `components/layout/`** — jangan styling
  ulang button/card/badge/tabel/form secara manual di halaman.
- **Mobile-first.** Wajib aman di lebar < 400px (tabel scroll, tidak overflow).
- **Setiap layar data punya 4 state:** loading, empty, error, normal. Form punya
  disabled saat submit.
- **Istilah UI baku:** "Penerima Manfaat" (bukan siswa/user), "Tim Dapur" (bukan
  operator dapur).

---

## 1. Token Warna (semantik)

Sumber: `app/globals.css` → `:root` + `@theme`. Semua dipakai via class Tailwind
(`bg-primary`, `text-muted-foreground`, dst). **Jangan tulis hex di komponen.**

| Token (class)              | Hex       | Pemakaian |
|----------------------------|-----------|-----------|
| `background`               | `#f8fafc` | latar halaman |
| `foreground`               | `#0f172a` | teks utama |
| `card` / `card-foreground` | `#ffffff` / `#0f172a` | permukaan kartu |
| `primary` / `primary-foreground` | `#059669` (emerald) / `#ffffff` | aksi utama, brand |
| `secondary` / `secondary-foreground` | `#f1f5f9` / `#1e293b` | aksi sekunder, chip netral |
| `muted` / `muted-foreground` | `#f1f5f9` / `#64748b` | latar lembut, teks tersier/caption |
| `accent` / `accent-foreground` | `#f59e0b` (amber) / `#ffffff` | highlight/warning brand |
| `destructive` / `destructive-foreground` | `#ef4444` / `#ffffff` | hapus, error |
| `border` / `input`         | `#e2e8f0` | garis, border field |
| `ring`                     | `#059669` | focus ring |

### Aturan token status (FINAL — Opsi A)
- **Tidak ada token brand `success`/`warning`.** Warna **status/kategori**
  (success=green, warning=amber/orange, info=blue; positif/netral/negatif;
  draft/dikirim/diterima/…) memakai palet Tailwind sebagai **sistem status
  multi-hue yang sah** — karena memang butuh banyak hue berbeda.
- **Syarat wajib:** warna status didefinisikan **sekali** di file config komponen
  (`Badge.tsx`, `StatusBadge.tsx`, `SentimentBadge.tsx`, `Toast.tsx`) — **dilarang**
  ditulis ad-hoc (`bg-green-100` dst) langsung di halaman.
- Warna **brand** tetap wajib token (tabel di atas).

---

## 2. Skala Spacing (basis 4px)

Tailwind default (`1`=4px, `2`=8px, `3`=12px, `4`=16px, `5`=20px, `6`=24px,
`8`=32px). Aturan baku:

| Konteks | Nilai | Class |
|---------|-------|-------|
| Page padding (shell) | 16px mobile / 24px desktop | `p-4 md:p-6` (sudah di shell) |
| Lebar maksimum konten | 1152px | `max-w-6xl mx-auto` (sudah di shell) |
| Gap antar-section dalam halaman | 24px | `space-y-6` |
| Gap dalam grid kartu | 16px (mobile) → 24px | `gap-4 md:gap-6` |
| Padding kartu (default) | 24px | `p-6` (CardHeader/Content) |
| Padding kartu (kompak: StatCard) | 20px | `p-5` |
| Gap field dalam form | 16px | `space-y-4` |
| Gap label↔input dalam 1 field | 8px | `space-y-2` |
| Margin bawah PageHeader | 24px | `mb-6` (sudah di PageHeader) |

### ⚠️ Inkonsistensi padding kartu
Saat ini: `Card` & `CardContent` = `p-6`, `StatCard` = `p-5`, `StateCard` = `p-8`,
`ConfirmDialog` = `p-5`/`p-4`. **Aturan final:** kartu konten = `p-6`; kartu
statistik kompak = `p-5`; empty/error state besar = `p-8` (sengaja lapang). Ini
disahkan sebagai 3 tier resmi, bukan dianggap bug — asalkan tidak ada nilai lain
yang muncul ad-hoc di halaman.

---

## 3. Radius

`@theme` meng-**override** utility radius Tailwind via `--radius: 0.75rem`:

| Class | Nilai efektif | Pemakaian |
|-------|---------------|-----------|
| `rounded-sm` | 8px  | jarang |
| `rounded-md` | 10px | **button, input, select, textarea** |
| `rounded-lg` | 12px | alert, tab pill container, badge group |
| `rounded-xl` | 16px | **card** (default) |
| `rounded-2xl`| 16px | dialog besar (ConfirmDialog) |
| `rounded-full`| pill | badge, status, avatar/icon bulat |

**Aturan:** kontrol input & tombol = `rounded-md`; kartu = `rounded-xl`; chip/badge
= `rounded-full`. Jangan campur radius lain pada elemen sejenis.

---

## 4. Tipografi

Font: `--font-sans` (Geist Sans), `--font-mono` (Geist Mono). Warna teks selalu
token (`text-foreground` / `text-muted-foreground` / `text-primary` / `text-destructive`).

| Peran | Class | Catatan |
|-------|-------|---------|
| App title (shell) | `text-lg font-bold text-primary` | brand kiri-atas |
| H1 / Judul halaman | `text-2xl font-bold tracking-tight` | lewat `PageHeader` |
| H2 / Judul section | `text-lg font-semibold` | judul di dalam kartu besar |
| H3 / Card title | `font-semibold leading-none tracking-tight` | `CardTitle` |
| Body | `text-sm` | default mayoritas UI |
| Body kuat | `text-sm font-medium` / `font-semibold` | label, nilai inline |
| Caption / helper | `text-xs text-muted-foreground` | helper text, meta |
| Label form | `text-sm font-medium` | `Label` dari FormComponents |
| Stat value | `text-3xl font-bold` | `StatCard` |
| Stat label | `text-xs font-medium uppercase tracking-wider text-muted-foreground` | `StatCard` |
| Micro (badge kecil) | `text-[10px]` / `text-[11px]` | hanya di SentimentBadge |

**Aturan:** jangan tulis ukuran font sebagai nilai arbitrer baru (`text-[13px]` dst)
di halaman; pakai skala di atas. `text-[10px]/[11px]` hanya untuk badge sentimen.

---

## 5. Layout Shell (standar halaman dashboard)

Sumber: `components/layout/DashboardShell.tsx`. **Jangan dibungkus ulang.**

- Header sticky `h-14`, `bg-white border-b shadow-sm`.
- Sidebar desktop `w-64`, sticky, hidden < md.
- Mobile: drawer kiri + bottom-nav `h-16` (maks 5 item pertama).
- Main: `p-4 md:p-6`, konten dibungkus `max-w-6xl mx-auto w-full`.
- Body: `pb-16 md:pb-0` (ruang untuk bottom-nav).

**Struktur isi halaman yang dianjurkan:**
```tsx
<>
  <PageHeader title="…" description="…" action={<Button …/>} />
  <div className="space-y-6">
    {/* sections / cards */}
  </div>
</>
```
Halaman **tidak** perlu menambah padding luar atau max-width lagi (sudah dari shell).

---

## 6. Spesifikasi Komponen Bersama

Semua di `components/ui/` & `components/layout/`. Kolom "Status" = kondisi sekarang.

| Komponen | API ringkas | Status |
|----------|-------------|--------|
| **Button** | `variant: default\|destructive\|outline\|secondary\|ghost\|link`, `size: default\|sm\|lg\|icon` | ✅ lengkap |
| **Card** + Header/Title/Description/Content/Footer | `p-6`, `rounded-xl` | ✅ |
| **Badge** | `variant: default\|secondary\|destructive\|outline\|success\|warning` | ⚠️ `success/warning` pakai `green-100`/`orange-100` mentah (lihat §1) |
| **StatusBadge** | `status` (DRAFT/DIKIRIM/DITERIMA/BERMASALAH/SELESAI), config terpusat multi-hue | ✅ pola benar (config di satu file) |
| **SentimentBadge** | `sentimen` (POSITIF/NETRAL/NEGATIF), `skor`, `size` | ✅ |
| **Input** | native input, `h-9 rounded-md`, focus ring primary | ✅ |
| **Select** | `options`, `placeholder`, `error`, `wrapperClassName`; selaras Input | ✅ |
| **Textarea / Label / Alert / RadioGroup** | diekspor dari **`FormComponents.tsx`** | ✅ (lihat duplikat di §7) |
| **DataTable** | `columns`, `data`, `keyExtractor`, sort, pagination (10/hal), `groupBy`, `emptyMessage`, inline edit | ✅ |
| **Tabs** | `items`, `value`, `onValueChange`, `variant: pill\|underline` | ✅ |
| **ConfirmDialog** | dialog konfirmasi (pengganti `confirm()`), `destructive`, `loading`, ESC/backdrop close | ✅ |
| **Toast / Toaster** | API global `toast.success/error/warning/info`; `<Toaster/>` mount sekali di layout | ✅ |
| **ImageLightbox** | preview gambar fullscreen, ESC/backdrop close | ✅ |
| **StatCard** | `icon`, `label`, `value`, `accentClass`, `note`, `extra`, `href` | ✅ |
| **PageHeader** (layout) | `title`, `description?`, `action?` | ✅ tanpa breadcrumb (final — pakai tombol "Kembali" di halaman detail) |
| **StateCard** (layout) | `icon`, `title`, `description`, `action?` — dipakai untuk empty **dan** error | ⚠️ ganda peran (lihat §8) |

### Spesifikasi FormField (label+input+helper+error) — **BELUM ADA**
Saat ini halaman merakit manual: `<div className="space-y-2"><Label/><Input/>…`.
**Usulan:** buat `FormField` sekali di `ui/` (FASE 2, hanya bila disetujui) dengan
kontrak: `label`, `htmlFor`, `required`, `error`, `helper`, `children`. Sampai itu
dibuat, pola manual baku = `space-y-2` + `Label` (htmlFor) + kontrol + helper/error
`text-xs` (`text-muted-foreground` / `text-destructive`).

---

## 7. Duplikat & Dead Code (perlu dibereskan)

| Item | Masalah | Rekomendasi |
|------|---------|-------------|
| `ui/alert.tsx`, `ui/label.tsx`, `ui/textarea.tsx`, `ui/radio-group.tsx` | **Tidak diimpor di mana pun** (diverifikasi: 0 rujukan, tak ada barrel, semua pakai `FormComponents`). Versi kanonik identik ada di `FormComponents.tsx`. | ✅ **DISETUJUI** hapus 4 file di FASE 2 — kanonik = `FormComponents.tsx`. Tanpa perubahan perilaku; build/typecheck setelahnya. |
| Token radius `--radius-sm/md/lg/xl` | Didefinisikan; berfungsi meng-override utility (lihat §3). | OK, biarkan — tapi dokumentasikan (sudah). |

---

## 8. State Standar (loading / empty / error / disabled)

- **Loading halaman penuh:** `min-h-screen flex items-center justify-center` +
  `<Loader2 className="animate-spin text-primary" />` (pola di `(dashboard)/layout.tsx`).
- **Loading dalam konten:** skeleton/spinner di area kartu, jangan layout-shift.
  > ⚠️ Belum ada komponen `LoadingSkeleton` bersama — kandidat dibuat di FASE 2.
- **Empty:** `StateCard` dengan ikon + judul + deskripsi + (opsional) action.
- **Error:** saat ini juga pakai `StateCard`; halaman tertentu pakai blok ad-hoc
  (lihat layout error: tombol `px-6 py-2 bg-primary text-white` manual).
  **Aturan final:** error pakai `StateCard` (ikon warning) atau `Alert variant=destructive`;
  tombol di dalamnya **harus** `Button`, bukan `<button>` manual, dan warna teks
  `text-primary-foreground` bukan `text-white`.
- **Disabled saat submit:** `Button disabled={loading}` + label "Memproses…".

---

## 9. Aksesibilitas (baku minimum)

- Setiap input punya `<Label htmlFor>` yang terhubung (login saat ini pakai
  `<label>` tanpa `htmlFor` → perbaiki di FASE 1/2).
- Focus ring sudah ada di Button/Input/Select (`focus-visible:ring`). Jangan
  hilangkan.
- Ikon dekoratif `aria-hidden`; tombol ikon punya `aria-label` (sudah di banyak tempat).
- Gambar `<img>` wajib `alt` bermakna.
- Kontras: teks tersier pakai `muted-foreground` (#64748b di atas putih ≈ 4.6:1, OK
  untuk teks normal). Jangan turunkan ke abu lebih terang untuk teks penting.

---

## 10. Checklist audit per halaman (dipakai di FASE 1)

```
[ ] Shell & page padding standar (tanpa padding/max-width ganda)
[ ] Spacing antar-section & dalam card sesuai §2 (tak ada nilai ad-hoc)
[ ] Komponen pakai ui/ (tak ada button/card/badge one-off)
[ ] Tipografi & warna pakai token (tak ada hex / font size arbitrer)
[ ] Responsif < 400px (tak overflow, tabel scrollable)
[ ] State lengkap: loading / empty / error / disabled
[ ] Form: label terhubung, validasi & pesan error jelas, helper text
[ ] A11y: focus, kontras, alt/aria, label↔input
[ ] Istilah baku: "Penerima Manfaat", "Tim Dapur"
```

---

## 11. Ringkasan kondisi token saat ini

**Sudah konsisten ✅**
- Warna brand sepenuhnya via token; **nol hex hardcoded** di halaman.
- Radius input vs card konsisten (`rounded-md` vs `rounded-xl`).
- Status & sentimen punya config terpusat (satu sumber warna/label).
- Shell, PageHeader, StatCard, DataTable, Toast, ConfirmDialog sudah dipakai luas.

**Berantakan / perlu keputusan ⚠️**
1. 4 file UI duplikat tak terpakai (`alert/label/textarea/radio-group`) → hapus.
2. `Badge` `success/warning` pakai palet mentah, bukan token (§1).
3. Belum ada `FormField`, `LoadingSkeleton`, `Modal` generik (hanya ConfirmDialog).
4. `PageHeader` tanpa breadcrumb (spec menyebut breadcrumb — opsional).
5. Login & layout error pakai `<label>`/`<button>` manual + `text-white` →
   harus pakai komponen + token.
6. Tiga tier padding kartu (`p-5/p-6/p-8`) — disahkan sebagai aturan, bukan bug.

---

### Keputusan FASE 0 (FINAL)
1. **Token success/warning:** **Opsi A** — status multi-hue via palet terpusat. ✅
2. **Hapus 4 file duplikat** + buat `FormField`/`LoadingSkeleton` saat dibutuhkan
   di FASE 2 (sekali bikin, dipakai ulang). ✅
3. **Breadcrumb:** tidak dipakai; halaman detail cukup judul + tombol "Kembali". ✅

Lanjut **FASE 1** (audit, belum ubah kode) mulai dari `/login` → role Admin → Tim
Dapur → Guru → Penerima Manfaat → Laporan.
