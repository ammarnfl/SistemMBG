/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SEED DATA — Sistem Evaluasi Layanan MBG (Makan Bergizi Gratis)
 * ════════════════════════════════════════════════════════════════════════════
 *  Jalankan dengan:  npx prisma db seed   (atau: npm run db:seed)
 *
 *  Struktur:
 *   1. RESET  — deleteMany() seluruh tabel (urutan terbalik dependency),
 *               KECUALI akun Admin yang dipertahankan & dinormalkan ke
 *               admin@gmail.com.
 *   2. ADMIN  — upsert akun admin (password "Password123!").
 *   3. INSERT — seluruh data baru sesuai urutan dependency.
 *
 *  Catatan id: semua id memakai UUID v4 (crypto.randomUUID()). Idempotensi
 *  dijamin lewat natural key (email / nama / unique constraint) + reset di awal.
 *  File ini adalah generator penuh & otoritatif; seed.sql adalah padanannya
 *  pada skala representatif.
 * ════════════════════════════════════════════════════════════════════════════
 */
import 'dotenv/config';
import { randomUUID } from 'crypto';
import {
  PrismaClient,
  Role,
  StatusDistribusi,
  StatusKonsumsi,
  SentimenLabel,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { categorize } from '../src/kategori/kategori.service';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:root@127.0.0.1:5432/mbg_db?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['warn', 'error'] });

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Password123!';
const USER_PASSWORD = 'mbg12345';

// ─── Helper umum ─────────────────────────────────────────────────────────────
const uid = () => randomUUID();
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Tanggal kalender (UTC midnight) n hari yang lalu — kolom @db.Date. */
function dateDaysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}
// Window 7 hari ke belakang (index 0 = paling lama, index 6 = hari ini).
const DATES: Date[] = [6, 5, 4, 3, 2, 1, 0].map(dateDaysAgo);

const usedNisn = new Set<string>();
function genNisn(): string {
  let nisn = '';
  do {
    nisn = Array.from({ length: 10 }, () => randInt(0, 9)).join('');
  } while (usedNisn.has(nisn));
  usedNisn.add(nisn);
  return nisn;
}

// ─── Pool teks feedback (gaya siswa SMA) ─────────────────────────────────────
// Feedback diperkaya agar menghasilkan variasi kategori topik keluhan
// (RASA, PORSI, KUALITAS, KEBERSIHAN, DISTRIBUSI, LAINNYA).
const FB_POSITIF = [
  'Makanannya enak banget hari ini, sayurnya seger!',
  'Ayam gorengnya gurih, suka banget sama menunya.',
  'Porsinya pas dan bikin kenyang, makasih ya.',
  'Enak sih, nasinya pulen lauknya juga mantap. Habis bersih!',
  'Suka banget menu hari ini, sampai nambah pengen.',
  'Sotonya hangat dan seger, paling enak minggu ini.',
];
const FB_NETRAL = [
  'Makanannya lumayan, tapi sayurnya agak kurang bumbu.',
  'Hari ini biasa aja sih, tapi tetep habis kok.',
  'Nasinya udah oke, lauknya bisa lebih berasa lagi.',
  'Standar lah, nggak istimewa tapi cukup mengenyangkan.',
  'Lumayan, cuma porsinya agak kurang buat aku.',
];
const FB_NEGATIF = [
  // RASA
  'Sayurnya terlalu matang dan hampir nggak ada rasanya, hambar banget.',
  'Kurang suka, bumbunya kemanisan buat aku dan rasanya aneh.',
  // PORSI
  'Porsinya dikit dan rasanya hambar, jadi cuma dimakan sedikit.',
  'Porsi nasinya sedikit banget, belum kenyang udah habis.',
  // KUALITAS
  'Lauknya hari ini kurang enak, agak amis jadi susah dimakan.',
  'Nasinya keras dan udah dingin pas sampai, jadi nggak habis.',
  'Makanannya basi kayaknya, baunya agak aneh dan lembek.',
  // KEBERSIHAN
  'Ada rambut di makanan aku, jadi nggak jadi makan deh.',
  'Wadah makanannya kotor, jadi males makan jadinya.',
  // DISTRIBUSI
  'Makanan datangnya telat banget, udah lewat jam istirahat.',
  'Distribusi terlambat lagi, makanannya udah dingin pas sampai.',
];
const FB_TIDAK_KONSUMSI = [
  'Lagi nggak enak badan jadi nggak sempat makan, maaf.',
  'Aku alergi sama lauknya jadi nggak aku makan.',
  'Telat masuk kelas, makanannya keburu dingin jadi nggak dimakan.',
];

const FOTO_BASE = 'https://storage.mbg.go.id/validasi';
const genFoto = () => `${FOTO_BASE}/${uid()}.jpg`;

function sentimenSkorFor(label: SentimenLabel): number {
  if (label === SentimenLabel.POSITIF) return +(0.78 + Math.random() * 0.2).toFixed(2);
  if (label === SentimenLabel.NETRAL) return +(0.42 + Math.random() * 0.18).toFixed(2);
  return +(0.05 + Math.random() * 0.2).toFixed(2);
}

// Raw label persis seperti output model HuggingFace (w11wo/indonesian-roberta-
// base-sentiment-classifier) yang dipetakan oleh SentimenService.mapLabel().
function rawLabelFor(label: SentimenLabel): string {
  if (label === SentimenLabel.POSITIF) return 'positive';
  if (label === SentimenLabel.NEGATIF) return 'negative';
  return 'neutral';
}

// Bobot rating realistis: ~60% (4-5), ~25% (3), ~15% (1-2)
function weightedRating(): number {
  const r = Math.random();
  if (r < 0.6) return Math.random() < 0.5 ? 4 : 5;
  if (r < 0.85) return 3;
  return Math.random() < 0.5 ? 1 : 2;
}

function sentimenFromRating(rating: number | null): SentimenLabel {
  if (rating === null) return SentimenLabel.NETRAL;
  if (rating >= 4) return SentimenLabel.POSITIF;
  if (rating === 3) return SentimenLabel.NETRAL;
  return SentimenLabel.NEGATIF;
}

// ════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('🌱 Seeding sistem evaluasi MBG ...');
  const hashUser = await bcrypt.hash(USER_PASSWORD, 10);
  const hashAdmin = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // ── 1. RESET (urutan terbalik dependency) ──────────────────────────────────
  await prisma.penilaianKomponen.deleteMany();
  await prisma.evaluasiHarian.deleteMany();
  await prisma.distribusi.deleteMany();
  await prisma.menuHarian.deleteMany();
  await prisma.menuKomponen.deleteMany();
  await prisma.menuMaster.deleteMany();
  await prisma.komponenMaster.deleteMany();
  await prisma.penerimaManfaatProfile.deleteMany();
  await prisma.guruProfile.deleteMany();
  await prisma.timDapurProfile.deleteMany();
  await prisma.kelas.deleteMany();
  await prisma.sekolah.deleteMany();
  await prisma.dapur.deleteMany();

  // Pertahankan akun Admin: rename admin lama → admin@gmail.com (jika ada),
  // buang admin lain & seluruh user non-admin.
  const existingAdmin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (existingAdmin && existingAdmin.email !== ADMIN_EMAIL) {
    await prisma.user.deleteMany({ where: { email: ADMIN_EMAIL } });
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { email: ADMIN_EMAIL },
    });
  }
  await prisma.user.deleteMany({ where: { role: { not: Role.ADMIN } } });
  await prisma.user.deleteMany({
    where: { role: Role.ADMIN, email: { not: ADMIN_EMAIL } },
  });
  console.log('  🧹 Reset selesai (akun admin dipertahankan).');

  // ── 2. ADMIN (upsert) ───────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: hashAdmin, name: 'Administrator MBG', role: Role.ADMIN, isActive: true },
    create: {
      id: uid(),
      email: ADMIN_EMAIL,
      password: hashAdmin,
      name: 'Administrator MBG',
      role: Role.ADMIN,
    },
  });
  console.log(`  👑 Admin: ${admin.email}`);

  // ── Helper pembuat user ─────────────────────────────────────────────────────
  async function makeUser(email: string, name: string, role: Role) {
    return prisma.user.upsert({
      where: { email },
      update: { name, role, password: hashUser, isActive: true },
      create: { id: uid(), email, name, role, password: hashUser },
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  3. DAPUR (10) + Tim Dapur — operasional: Lebak Gede, Lebak Siliwangi, Dago
  // ════════════════════════════════════════════════════════════════════════
  const dapurDefs = [
    {
      key: 'lebaksiliwangi', nama: 'SPPG Lebak Siliwangi',
      alamat: 'Jl. Sumur Bandung No.6, Lebak Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat',
      provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: 'Coblong',
      email: 'lebaksiliwangi.dapur@gmail.com', timNama: 'Asep Mulyana',
    },
    {
      key: 'lebakgede', nama: 'SPPG Lebak Gede', // ◄ SHOWCASE
      alamat: 'Jl. Dipatiukur No. 93A, Lebak Gede, Kecamatan Coblong, Kota Bandung, Jawa Barat',
      provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: 'Coblong',
      email: 'lebakgede.dapur@gmail.com', timNama: 'Yuni Hartati',
    },
    {
      key: 'dago', nama: 'SPPG Dago',
      alamat: 'Jl. Ir H. Juanda No. 438 A, Kel. Dago, Kec. Coblong, Kota Bandung, Jawa Barat',
      provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: 'Coblong',
      email: 'dago.dapur@gmail.com', timNama: 'Dedi Supriadi',
    },
    {
      key: 'andirgaruda', nama: 'SPPG Andir Garuda',
      alamat: 'Jl. Rajawali III No. 7 RT 03 RW 02, Garuda, Kecamatan Andir, Kota Bandung, Jawa Barat',
      provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: 'Andir',
      email: 'andirgaruda.dapur@gmail.com', timNama: 'Ratna Komala',
    },
    {
      key: 'arcamanik', nama: 'SPPG Arcamanik Sukamiskin',
      alamat: 'Jl. Cisaranten Kulon No. 91, Sukamiskin, Kec. Arcamanik, Kota Bandung, Jawa Barat',
      provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: 'Arcamanik',
      email: 'arcamanik.dapur@gmail.com', timNama: 'Hendi Rustandi',
    },
    {
      key: 'sukajadi', nama: 'SPPG Sukajadi Cipedes',
      alamat: 'Jl. Lembah Sukaresmi III No 22 RT 02 RW 10, Kel. Cipedes, Kecamatan Sukajadi, Kota Bandung, Jawa Barat',
      provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: 'Sukajadi',
      email: 'sukajadi.dapur@gmail.com', timNama: 'Lilis Maryani',
    },
    {
      key: 'lebakgede2', nama: 'SPPG Lebak Gede 2',
      alamat: 'Jl. Dipati Ukur No.5, Lebakgede, Kecamatan Coblong, Kota Bandung, Jawa Barat',
      provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: 'Coblong',
      email: 'lebakgede2.dapur@gmail.com', timNama: 'Rudi Hermawan',
    },
    {
      key: 'pesanggrahan', nama: 'SPPG Pesanggrahan Petukangan Utara 1',
      alamat: 'Jl. Kostrad Pusri Raya A7 RT.08 RW.08, Petukangan Utara, Kec. Pesanggrahan, Kota Adm. Jakarta Selatan, DKI Jakarta',
      provinsi: 'DKI Jakarta', kabupatenKota: 'Kota Adm. Jakarta Selatan', kecamatan: 'Pesanggrahan',
      email: 'pesanggrahan.dapur@gmail.com', timNama: 'Sari Wahyuni',
    },
    {
      key: 'kebayoranlama', nama: 'SPPG Kebayoran Lama Grogol Utara',
      alamat: 'Jl. Kemandoran VII No.1, RT.5/RW.3, Grogol Utara, Kec. Kebayoran Lama, Kota Adm. Jakarta Selatan, DKI Jakarta',
      provinsi: 'DKI Jakarta', kabupatenKota: 'Kota Adm. Jakarta Selatan', kecamatan: 'Kebayoran Lama',
      email: 'kebayoranlama.dapur@gmail.com', timNama: 'Joko Susilo',
    },
    {
      key: 'tanahabang', nama: 'SPPG Tanah Abang Petamburan',
      alamat: 'Jl. K.S. Tubun No 15-17, RT 002/RW 001, Petamburan, Tanah Abang, Jakarta Pusat, DKI Jakarta',
      provinsi: 'DKI Jakarta', kabupatenKota: 'Kota Adm. Jakarta Pusat', kecamatan: 'Tanah Abang',
      email: 'tanahabang.dapur@gmail.com', timNama: 'Endang Sukaesih',
    },
  ];

  const dapurMap: Record<string, { id: string }> = {};
  for (const d of dapurDefs) {
    const dapur = await prisma.dapur.upsert({
      where: { nama: d.nama },
      update: {
        alamat: d.alamat, provinsi: d.provinsi,
        kabupatenKota: d.kabupatenKota, kecamatan: d.kecamatan,
      },
      create: {
        id: uid(), nama: d.nama, alamat: d.alamat, provinsi: d.provinsi,
        kabupatenKota: d.kabupatenKota, kecamatan: d.kecamatan,
      },
    });
    dapurMap[d.key] = { id: dapur.id };
    const timUser = await makeUser(d.email, d.timNama, Role.TIM_DAPUR);
    await prisma.timDapurProfile.create({
      data: { id: uid(), userId: timUser.id, dapurId: dapur.id },
    });
  }
  console.log(`  🍳 ${dapurDefs.length} dapur + tim dapur dibuat.`);

  // ════════════════════════════════════════════════════════════════════════
  //  4. SEKOLAH (6) + mapping (Sekolah.dapurId) + Guru
  // ════════════════════════════════════════════════════════════════════════
  const sekolahDefs = [
    {
      key: 's1', nama: 'SMA Negeri 1 Bandung', dapurKey: 'lebakgede', // ◄ SHOWCASE
      alamat: 'Jl. Ir. H. Djuanda No. 93, Lebak Siliwangi, Coblong, Kota Bandung, Jawa Barat',
      provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: 'Coblong',
      email: 'sman1bandung.guru@gmail.com', guruNama: 'Ibu Dra. Hj. Siti Aminah, M.Pd.',
    },
    {
      key: 's2', nama: 'SMA Negeri 2 Bandung', dapurKey: 'lebaksiliwangi',
      alamat: 'Jl. Cihampelas No. 173, Cipaganti, Coblong, Kota Bandung, Jawa Barat',
      provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: 'Coblong',
      email: 'sman2bandung.guru@gmail.com', guruNama: 'Bapak Drs. Endang Suherman',
    },
    {
      key: 's3', nama: 'SMA Negeri 3 Bandung', dapurKey: 'lebaksiliwangi',
      alamat: 'Jl. Belitung No. 8, Merdeka, Sumur Bandung, Kota Bandung, Jawa Barat',
      provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: 'Sumur Bandung',
      email: 'sman3bandung.guru@gmail.com', guruNama: 'Ibu Tati Suryani, S.Pd.',
    },
    {
      key: 's5', nama: 'SMA Negeri 5 Bandung', dapurKey: 'dago',
      alamat: 'Jl. Belitung No. 9, Merdeka, Sumur Bandung, Kota Bandung, Jawa Barat',
      provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: 'Sumur Bandung',
      email: 'sman5bandung.guru@gmail.com', guruNama: 'Bapak Agus Setiawan, S.Pd.',
    },
    {
      key: 's6', nama: 'SMA Negeri 6 Bandung', dapurKey: 'dago',
      alamat: 'Jl. Pasirkaliki No. 51, Arjuna, Cicendo, Kota Bandung, Jawa Barat',
      provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: 'Cicendo',
      email: 'sman6bandung.guru@gmail.com', guruNama: 'Ibu Nining Kurnia, M.Pd.',
    },
    {
      key: 's19', nama: 'SMA Negeri 19 Bandung', dapurKey: 'lebakgede',
      alamat: 'Jl. Dago Pojok, Dago, Coblong, Kota Bandung, Jawa Barat',
      provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: 'Coblong',
      email: 'sman19bandung.guru@gmail.com', guruNama: 'Bapak Dudi Supriatna, S.Pd.',
    },
  ];

  const sekolahMap: Record<string, { id: string; guruId: string }> = {};
  for (const s of sekolahDefs) {
    const sekolah = await prisma.sekolah.upsert({
      where: { nama: s.nama },
      update: {
        alamat: s.alamat, provinsi: s.provinsi, kabupatenKota: s.kabupatenKota,
        kecamatan: s.kecamatan, dapurId: dapurMap[s.dapurKey].id,
      },
      create: {
        id: uid(), nama: s.nama, alamat: s.alamat, provinsi: s.provinsi,
        kabupatenKota: s.kabupatenKota, kecamatan: s.kecamatan,
        dapurId: dapurMap[s.dapurKey].id,
      },
    });
    const guru = await makeUser(s.email, s.guruNama, Role.GURU);
    await prisma.guruProfile.create({
      data: { id: uid(), userId: guru.id, sekolahId: sekolah.id },
    });
    sekolahMap[s.key] = { id: sekolah.id, guruId: guru.id };
  }
  console.log(`  🏫 ${sekolahDefs.length} sekolah + mapping + guru dibuat.`);

  // ════════════════════════════════════════════════════════════════════════
  //  5. KELAS
  // ════════════════════════════════════════════════════════════════════════
  async function makeKelas(sekolahId: string, nama: string) {
    return prisma.kelas.create({ data: { id: uid(), sekolahId, nama } });
  }
  // SMA 1: 1 kelas showcase + 11 reguler (reguler = data master, tanpa siswa)
  const kelasShowcase = await makeKelas(sekolahMap.s1.id, 'XII IPA 1');
  const s1Reguler = [
    'X IPA 1', 'X IPA 2', 'X IPS 1', 'X IPS 2', 'XI IPA 1', 'XI IPA 2',
    'XI IPS 1', 'XI IPS 2', 'XII IPA 2', 'XII IPA 3', 'XII IPS 1',
  ];
  for (const nm of s1Reguler) await makeKelas(sekolahMap.s1.id, nm);

  // SMA 19: 12 kelas reguler
  const s19KelasNames = [
    'X IPA 1', 'X IPA 2', 'X IPA 3', 'X IPS 1', 'X IPS 2', 'X IPS 3',
    'XI IPA 1', 'XI IPA 2', 'XI IPS 1', 'XI IPS 2', 'XII IPA 1', 'XII IPS 1',
  ];
  const s19Kelas: { id: string }[] = [];
  for (const nm of s19KelasNames) s19Kelas.push(await makeKelas(sekolahMap.s19.id, nm));

  // SMA 2/3/5/6: 2 kelas masing-masing
  async function twoKelas(sekolahId: string) {
    return [
      await makeKelas(sekolahId, 'XII IPA 1'),
      await makeKelas(sekolahId, 'XII IPS 1'),
    ];
  }
  const s2Kelas = await twoKelas(sekolahMap.s2.id);
  const s3Kelas = await twoKelas(sekolahMap.s3.id);
  const s5Kelas = await twoKelas(sekolahMap.s5.id);
  const s6Kelas = await twoKelas(sekolahMap.s6.id);
  console.log('  🪑 Kelas dibuat (showcase + reguler).');

  // ════════════════════════════════════════════════════════════════════════
  //  6. PENERIMA MANFAAT
  // ════════════════════════════════════════════════════════════════════════
  type PM = { id: string; email: string; name: string };
  async function makePM(name: string, email: string, sekolahId: string, kelasId: string): Promise<PM> {
    const user = await makeUser(email, name, Role.PENERIMA_MANFAAT);
    await prisma.penerimaManfaatProfile.create({
      data: { id: uid(), userId: user.id, nisn: genNisn(), sekolahId, kelasId },
    });
    return { id: user.id, email, name };
  }
  const slug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');

  // ── SHOWCASE: Kelas XII IPA 1 (20 siswa) ──────────────────────────────────
  // Indeks 0 = PM-A (normal/positif), 1 = PM-B (pernah rating rendah),
  // 2 = PM-C (pernah tidak mengonsumsi).
  const showcaseNames = [
    'Ahmad Rizky Pratama',   // PM-A
    'Siti Nurhaliza',        // PM-B
    'Bagus Setiawan',        // PM-C
    'Dewi Lestari', 'Rangga Saputra', 'Putri Maharani', 'Yoga Permana',
    'Nadia Salsabila', 'Fajar Nugroho', 'Intan Permata', 'Dimas Aditya',
    'Rina Wulandari', 'Adi Kurniawan', 'Mega Utami', 'Galih Ramadhan',
    'Tika Anggraini', 'Reza Fauzi', 'Lia Anjani', 'Bayu Saputra', 'Wulan Sari',
  ];
  const showcasePM: PM[] = [];
  for (const nm of showcaseNames) {
    showcasePM.push(
      await makePM(nm, `${slug(nm)}@gmail.com`, sekolahMap.s1.id, kelasShowcase.id),
    );
  }
  const PM_A = showcasePM[0], PM_B = showcasePM[1], PM_C = showcasePM[2];

  // ── NON-SHOWCASE: SMA 19 (12 siswa tersebar di beberapa kelas) ────────────
  const s19Names = [
    'Hendra Gunawan', 'Anisa Rahmawati', 'Doni Firmansyah', 'Sri Wahyuni',
    'Eko Prasetyo', 'Maya Sari', 'Rizal Maulana', 'Fitri Handayani',
    'Agus Salim', 'Dina Marlina', 'Iwan Setiawan', 'Nurul Aini',
  ];
  const s19PM: PM[] = [];
  for (let i = 0; i < s19Names.length; i++) {
    const kelas = s19Kelas[i % 4]; // tersebar di 4 kelas pertama
    s19PM.push(await makePM(s19Names[i], `${slug(s19Names[i])}@gmail.com`, sekolahMap.s19.id, kelas.id));
  }

  // ── NON-SHOWCASE: SMA 2/3/5/6 ─────────────────────────────────────────────
  async function manyPM(names: string[], sekolahId: string, kelas: { id: string }[]) {
    const out: PM[] = [];
    for (let i = 0; i < names.length; i++) {
      out.push(await makePM(names[i], `${slug(names[i])}@gmail.com`, sekolahId, kelas[i % kelas.length].id));
    }
    return out;
  }
  const s2PM = await manyPM(['Andika Pranata', 'Citra Kirana', 'Bambang Wijaya', 'Sari Indah'], sekolahMap.s2.id, s2Kelas);
  const s3PM = await manyPM(['Teguh Santoso', 'Ratna Dewi', 'Hadi Susanto', 'Lilis Suryani'], sekolahMap.s3.id, s3Kelas);
  const s5PM = await manyPM(['Arif Budiman', 'Tuti Alawiyah', 'Slamet Riyadi'], sekolahMap.s5.id, s5Kelas);
  const s6PM = await manyPM(['Asep Sunandar', 'Euis Komariah', 'Dadang Suherman'], sekolahMap.s6.id, s6Kelas);
  console.log(`  🎓 Penerima manfaat dibuat (showcase 20 + non-showcase ${s19PM.length + s2PM.length + s3PM.length + s5PM.length + s6PM.length}).`);

  // ════════════════════════════════════════════════════════════════════════
  //  7. MENU + KOMPONEN per dapur operasional
  // ════════════════════════════════════════════════════════════════════════
  type MenuDef = {
    nama: string; deskripsi: string;
    nutri: { energiKkal: number; proteinGram: number; lemakGram: number; karbohidratGram: number; seratGram: number };
    komponen: string[];
  };
  type BuiltMenu = { id: string; nama: string; komponen: { id: string; nama: string }[] };

  async function buildMenus(dapurId: string, defs: MenuDef[]): Promise<BuiltMenu[]> {
    // KomponenMaster unik per [dapurId, nama]
    const komMaster: Record<string, string> = {};
    const allKomNames = Array.from(new Set(defs.flatMap((d) => d.komponen)));
    for (const nm of allKomNames) {
      const km = await prisma.komponenMaster.upsert({
        where: { dapurId_nama: { dapurId, nama: nm } },
        update: {},
        create: { id: uid(), dapurId, nama: nm },
      });
      komMaster[nm] = km.id;
    }
    const built: BuiltMenu[] = [];
    for (const def of defs) {
      const menu = await prisma.menuMaster.create({
        data: {
          id: uid(), dapurId, nama: def.nama, deskripsi: def.deskripsi,
          energiKkal: def.nutri.energiKkal, proteinGram: def.nutri.proteinGram,
          lemakGram: def.nutri.lemakGram, karbohidratGram: def.nutri.karbohidratGram,
          seratGram: def.nutri.seratGram,
        },
      });
      const komponen: { id: string; nama: string }[] = [];
      for (const nm of def.komponen) {
        const mk = await prisma.menuKomponen.create({
          data: { id: uid(), menuId: menu.id, komponenMasterId: komMaster[nm], namaSnapshot: nm },
        });
        komponen.push({ id: mk.id, nama: nm });
      }
      built.push({ id: menu.id, nama: def.nama, komponen });
    }
    return built;
  }

  // ── SHOWCASE: Menu SPPG Lebak Gede (4 menu dirotasi 7 hari) ────────────────
  const lebakGedeMenus = await buildMenus(dapurMap.lebakgede.id, [
    {
      nama: 'Nasi Ayam Goreng Lalapan',
      deskripsi: 'Nasi putih, ayam goreng, lalapan & sambal, dan susu UHT coklat.',
      nutri: { energiKkal: 520, proteinGram: 29, lemakGram: 16, karbohidratGram: 66, seratGram: 5 },
      komponen: ['Nasi Putih', 'Ayam Goreng', 'Lalapan & Sambal', 'Susu UHT Coklat'],
    },
    {
      nama: 'Nasi Ikan Bakar Kecap',
      deskripsi: 'Nasi putih, ikan bakar kecap, cah kangkung, dan buah pisang.',
      nutri: { energiKkal: 470, proteinGram: 31, lemakGram: 11, karbohidratGram: 60, seratGram: 6 },
      komponen: ['Nasi Putih', 'Ikan Bakar Kecap', 'Cah Kangkung', 'Buah Pisang'],
    },
    {
      nama: 'Nasi Telur Balado',
      deskripsi: 'Nasi putih, telur balado, tumis buncis wortel, dan air mineral.',
      nutri: { energiKkal: 450, proteinGram: 22, lemakGram: 14, karbohidratGram: 62, seratGram: 5 },
      komponen: ['Nasi Putih', 'Telur Balado', 'Tumis Buncis Wortel', 'Air Mineral'],
    },
    {
      nama: 'Soto Ayam Komplit',
      deskripsi: 'Nasi putih, soto ayam, tempe goreng, dan buah jeruk.',
      nutri: { energiKkal: 480, proteinGram: 26, lemakGram: 13, karbohidratGram: 64, seratGram: 6 },
      komponen: ['Nasi Putih', 'Soto Ayam', 'Tempe Goreng', 'Buah Jeruk'],
    },
  ]);
  const showcaseRotation = [0, 1, 2, 3, 0, 1, 2]; // index menu per hari (DATES[0..6])

  // ── NON-SHOWCASE: menu sederhana untuk Lebak Siliwangi & Dago ──────────────
  const siliwangiMenus = await buildMenus(dapurMap.lebaksiliwangi.id, [
    {
      nama: 'Nasi Ayam Teriyaki',
      deskripsi: 'Nasi putih, ayam teriyaki, dan cah brokoli wortel.',
      nutri: { energiKkal: 490, proteinGram: 28, lemakGram: 13, karbohidratGram: 64, seratGram: 4 },
      komponen: ['Nasi Putih', 'Ayam Teriyaki', 'Cah Brokoli Wortel'],
    },
    {
      nama: 'Nasi Rendang Daging',
      deskripsi: 'Nasi putih, rendang daging, dan sayur nangka.',
      nutri: { energiKkal: 540, proteinGram: 30, lemakGram: 20, karbohidratGram: 60, seratGram: 5 },
      komponen: ['Nasi Putih', 'Rendang Daging', 'Sayur Nangka'],
    },
  ]);
  const dagoMenus = await buildMenus(dapurMap.dago.id, [
    {
      nama: 'Nasi Capcay Bakso',
      deskripsi: 'Nasi putih, capcay sayur, dan bakso sapi.',
      nutri: { energiKkal: 460, proteinGram: 24, lemakGram: 12, karbohidratGram: 62, seratGram: 6 },
      komponen: ['Nasi Putih', 'Capcay Sayur', 'Bakso Sapi'],
    },
    {
      nama: 'Nasi Pepes Ikan',
      deskripsi: 'Nasi putih, pepes ikan, dan lalapan.',
      nutri: { energiKkal: 440, proteinGram: 27, lemakGram: 10, karbohidratGram: 58, seratGram: 5 },
      komponen: ['Nasi Putih', 'Pepes Ikan', 'Lalapan'],
    },
  ]);
  console.log('  🍽️  Menu & komponen dibuat (Lebak Gede, Lebak Siliwangi, Dago).');

  // ── MENU HARIAN (showcase: jadwal 7 hari) ──────────────────────────────────
  for (let i = 0; i < DATES.length; i++) {
    const menu = lebakGedeMenus[showcaseRotation[i]];
    await prisma.menuHarian.upsert({
      where: { tanggal_menuId: { tanggal: DATES[i], menuId: menu.id } },
      update: {},
      create: { id: uid(), tanggal: DATES[i], menuId: menu.id },
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  8. DISTRIBUSI
  // ════════════════════════════════════════════════════════════════════════
  async function makeDistribusi(args: {
    tanggal: Date; sekolahId: string; dapurId: string; menuId: string;
    jumlahPorsi: number; status: StatusDistribusi; createdById: string;
    confirmedById?: string; catatanDapur?: string; catatanGuru?: string;
  }) {
    return prisma.distribusi.create({
      data: {
        id: uid(), tanggal: args.tanggal, sekolahId: args.sekolahId, dapurId: args.dapurId,
        menuId: args.menuId, jumlahPorsi: args.jumlahPorsi, status: args.status,
        createdById: args.createdById, confirmedById: args.confirmedById ?? null,
        catatanDapur: args.catatanDapur ?? null, catatanGuru: args.catatanGuru ?? null,
      },
    });
  }

  const timLebakGede = (await prisma.user.findUniqueOrThrow({ where: { email: 'lebakgede.dapur@gmail.com' } })).id;
  const timSiliwangi = (await prisma.user.findUniqueOrThrow({ where: { email: 'lebaksiliwangi.dapur@gmail.com' } })).id;
  const timDago = (await prisma.user.findUniqueOrThrow({ where: { email: 'dago.dapur@gmail.com' } })).id;

  // ── SHOWCASE: Lebak Gede → SMA 1 (7 hari, semua terkonfirmasi/SELESAI) ──────
  const showcaseDist: string[] = [];
  for (let i = 0; i < DATES.length; i++) {
    const menu = lebakGedeMenus[showcaseRotation[i]];
    const isToday = i === DATES.length - 1;
    const d = await makeDistribusi({
      tanggal: DATES[i], sekolahId: sekolahMap.s1.id, dapurId: dapurMap.lebakgede.id,
      menuId: menu.id, jumlahPorsi: 20,
      status: isToday ? StatusDistribusi.DITERIMA : StatusDistribusi.SELESAI,
      createdById: timLebakGede, confirmedById: sekolahMap.s1.guruId,
      catatanDapur: 'Dikirim lengkap dan tepat waktu.',
      catatanGuru: 'Makanan diterima dalam kondisi baik.',
    });
    showcaseDist.push(d.id);
  }

  // ── NON-SHOWCASE: Lebak Gede → SMA 19 (4 hari, tidak semua lengkap) ─────────
  const s19Dist: { id: string; tanggal: Date; menu: BuiltMenu }[] = [];
  const s19Days = [DATES[3], DATES[4], DATES[5], DATES[6]];
  for (let i = 0; i < s19Days.length; i++) {
    const menu = lebakGedeMenus[i % lebakGedeMenus.length];
    const last = i === s19Days.length - 1;
    const d = await makeDistribusi({
      tanggal: s19Days[i], sekolahId: sekolahMap.s19.id, dapurId: dapurMap.lebakgede.id,
      menuId: menu.id, jumlahPorsi: 60,
      status: last ? StatusDistribusi.DIKIRIM : StatusDistribusi.SELESAI, // hari terakhir belum dikonfirmasi
      createdById: timLebakGede,
      confirmedById: last ? undefined : sekolahMap.s19.guruId,
      catatanDapur: 'Pengiriman rutin.',
      catatanGuru: last ? undefined : 'Diterima, beberapa porsi terlambat.',
    });
    s19Dist.push({ id: d.id, tanggal: s19Days[i], menu });
  }

  // ── NON-SHOWCASE: Lebak Siliwangi → SMA 2 & 3 (3-4 hari, 1-2 pending) ───────
  const siliwangiTargets = [
    { sekolah: sekolahMap.s2, pm: s2PM, days: [DATES[3], DATES[4], DATES[5], DATES[6]] },
    { sekolah: sekolahMap.s3, pm: s3PM, days: [DATES[4], DATES[5], DATES[6]] },
  ];
  const siliwangiDist: { id: string; tanggal: Date; menu: BuiltMenu; pm: PM[]; sekolah: { id: string; guruId: string } }[] = [];
  for (const t of siliwangiTargets) {
    for (let i = 0; i < t.days.length; i++) {
      const menu = siliwangiMenus[i % siliwangiMenus.length];
      const last = i === t.days.length - 1;
      const d = await makeDistribusi({
        tanggal: t.days[i], sekolahId: t.sekolah.id, dapurId: dapurMap.lebaksiliwangi.id,
        menuId: menu.id, jumlahPorsi: 10,
        status: last ? StatusDistribusi.DIKIRIM : StatusDistribusi.DITERIMA,
        createdById: timSiliwangi,
        confirmedById: last ? undefined : t.sekolah.guruId,
        catatanDapur: 'Dikirim sesuai jadwal.',
        catatanGuru: last ? undefined : 'Diterima lengkap.',
      });
      siliwangiDist.push({ id: d.id, tanggal: t.days[i], menu, pm: t.pm, sekolah: t.sekolah });
    }
  }

  // ── NON-SHOWCASE: Dago → SMA 5 & 6 (3 hari, ada pending DRAFT) ──────────────
  const dagoTargets = [
    { sekolah: sekolahMap.s5, pm: s5PM },
    { sekolah: sekolahMap.s6, pm: s6PM },
  ];
  const dagoDays = [DATES[4], DATES[5], DATES[6]];
  const dagoDist: { id: string; tanggal: Date; menu: BuiltMenu; pm: PM[]; sekolah: { id: string; guruId: string } }[] = [];
  for (const t of dagoTargets) {
    for (let i = 0; i < dagoDays.length; i++) {
      const menu = dagoMenus[i % dagoMenus.length];
      const last = i === dagoDays.length - 1;
      const d = await makeDistribusi({
        tanggal: dagoDays[i], sekolahId: t.sekolah.id, dapurId: dapurMap.dago.id,
        menuId: menu.id, jumlahPorsi: 10,
        status: last ? StatusDistribusi.DRAFT : StatusDistribusi.DITERIMA, // hari terakhir masih draft
        createdById: timDago,
        confirmedById: last ? undefined : t.sekolah.guruId,
        catatanDapur: last ? 'Menu hari ini masih disusun.' : 'Dikirim sesuai jadwal.',
        catatanGuru: last ? undefined : 'Diterima dengan baik.',
      });
      dagoDist.push({ id: d.id, tanggal: dagoDays[i], menu, pm: t.pm, sekolah: t.sekolah });
    }
  }
  console.log('  🚚 Distribusi dibuat (showcase + non-showcase, termasuk pending).');

  // ════════════════════════════════════════════════════════════════════════
  //  9. EVALUASI HARIAN (presensi + rating + komponen + feedback + sentimen)
  // ════════════════════════════════════════════════════════════════════════
  type EvalArgs = {
    pmId: string; tanggal: Date; distribusiId: string; menu: BuiltMenu;
    statusKonsumsi: StatusKonsumsi; rating: number | null;
    feedback?: string | null; foto?: string | null; sentimen?: SentimenLabel | null;
    resolvedById?: string | null;
    /**
     * HYBRID: jika true, sentimen diisi sintetis (data NON-showcase) agar
     * dashboard tidak kosong. Jika false/undefined (data SHOWCASE), sentimen
     * DIBIARKAN NULL supaya job HuggingFace (SentimenService) yang menilainya —
     * cron memfilter `feedback != null AND sentimen == null`.
     */
    synthSentimen?: boolean;
  };

  async function makeEvaluasi(a: EvalArgs) {
    // Skor keterhabisan komponen: berkorelasi dengan rating; tidak konsumsi → rendah.
    const komponenSkor = a.menu.komponen.map((k) => {
      let s: number;
      if (a.statusKonsumsi === StatusKonsumsi.TIDAK_KONSUMSI || a.rating === null) s = randInt(1, 2);
      else s = clamp(a.rating + randInt(-1, 1), 1, 5);
      return { id: uid(), komponenId: k.id, skorKeterhabisan: s };
    });

    const hasFeedback = !!a.feedback;
    // HYBRID: sentimen hanya diisi sintetis untuk data NON-showcase
    // (synthSentimen=true). Untuk showcase dibiarkan NULL agar dianalisis oleh
    // model HuggingFace asli melalui SentimenService.
    let sentimen: SentimenLabel | null = null;
    let sentimenSkor: number | null = null;
    let sentimenLabel: string | null = null;
    let sentimenAnalyzedAt: Date | null = null;
    if (hasFeedback && a.synthSentimen) {
      sentimen = a.sentimen ?? sentimenFromRating(a.rating);
      sentimenSkor = sentimenSkorFor(sentimen);
      sentimenLabel = rawLabelFor(sentimen); // 'positive' | 'neutral' | 'negative'
      sentimenAnalyzedAt = new Date();
    }

    // Kategorisasi otomatis dari teks feedback (rule-based keyword tagger)
    const kategori = categorize(a.feedback ?? null);

    const resolved = !!a.resolvedById;
    await prisma.evaluasiHarian.create({
      data: {
        id: uid(), tanggal: a.tanggal, penerimaManfaatId: a.pmId, distribusiId: a.distribusiId,
        statusKonsumsi: a.statusKonsumsi, ratingKeseluruhan: a.rating,
        feedback: a.feedback ?? null, fotoUrl: a.foto ?? null,
        sentimen, sentimenSkor, sentimenLabel, sentimenAnalyzedAt,
        kategori,
        feedbackResolved: resolved,
        feedbackResolution: resolved ? 'Sudah ditindaklanjuti tim dapur, kualitas menu akan diperbaiki.' : null,
        feedbackResolvedAt: resolved ? new Date() : null,
        feedbackResolvedById: a.resolvedById ?? null,
        penilaianKomponen: {
          create: komponenSkor.map((k) => ({
            id: k.id, komponenId: k.komponenId, skorKeterhabisan: k.skorKeterhabisan,
          })),
        },
      },
    });
  }

  // Sel "wajib feedback" showcase yang dipaksa agar memenuhi distribusi sentimen
  // (≥2 NEGATIF & ≥2 NETRAL). Format: `${siswaIdx}-${hariIdx}`.
  const forcedNegatif = new Set(['1-2', '5-1', '9-4']); // termasuk PM-B (idx1) hari ke-2
  const forcedNetral = new Set(['6-0', '11-5']);
  const forcedPositifSample = new Set(['0-0', '3-3']); // PM-A & satu siswa lain

  for (let di = 0; di < DATES.length; di++) {
    const tanggal = DATES[di];
    const menu = lebakGedeMenus[showcaseRotation[di]];
    const distId = showcaseDist[di];

    for (let si = 0; si < showcasePM.length; si++) {
      const pm = showcasePM[si];
      const cellKey = `${si}-${di}`;
      let statusKonsumsi: StatusKonsumsi = StatusKonsumsi.KONSUMSI;
      let rating: number | null;
      let feedback: string | null = null;
      let foto: string | null = null;
      let sentimen: SentimenLabel | null = null;

      // ── Profil khusus ───────────────────────────────────────────────────
      if (si === 0) {
        rating = di % 2 === 0 ? 5 : 4; // PM-A: selalu positif
      } else if (si === 1 && di === 2) {
        rating = 2; // PM-B: hari rating rendah → wajib feedback + foto
      } else if (si === 2 && di === 3) {
        statusKonsumsi = StatusKonsumsi.TIDAK_KONSUMSI; // PM-C: tidak mengonsumsi
        rating = null;
      } else if (forcedNegatif.has(cellKey)) {
        rating = randInt(1, 2);
      } else if (forcedNetral.has(cellKey)) {
        rating = 3;
      } else {
        rating = weightedRating();
      }

      // ── Tentukan kewajiban feedback (rule MBG: rating≤2 / tidak konsumsi /
      //    sampling acak; komponen≤2 sudah implisit saat rating rendah) ──────
      const sampled =
        forcedPositifSample.has(cellKey) ||
        forcedNetral.has(cellKey) ||
        (rating !== null && rating >= 4 && Math.random() < 0.08) ||
        (rating === 3 && Math.random() < 0.25);

      const mustFeedback =
        statusKonsumsi === StatusKonsumsi.TIDAK_KONSUMSI ||
        (rating !== null && rating <= 2) ||
        sampled;

      if (mustFeedback) {
        if (statusKonsumsi === StatusKonsumsi.TIDAK_KONSUMSI) {
          sentimen = SentimenLabel.NETRAL;
          feedback = FB_TIDAK_KONSUMSI[si % FB_TIDAK_KONSUMSI.length];
        } else if (rating !== null && rating <= 2) {
          sentimen = SentimenLabel.NEGATIF;
          feedback = pick(FB_NEGATIF);
        } else if (rating === 3) {
          sentimen = SentimenLabel.NETRAL;
          feedback = pick(FB_NETRAL);
        } else {
          sentimen = SentimenLabel.POSITIF;
          feedback = pick(FB_POSITIF);
        }
        foto = genFoto(); // feedback wajib ⇒ foto validasi wajib
      }

      // SHOWCASE: sentimen sengaja TIDAK diisi (synthSentimen=false) agar
      // feedback ini dinilai oleh model HuggingFace asli via SentimenService.
      // (`sentimen` di atas hanya dipakai memilih teks feedback yang koheren.)
      await makeEvaluasi({
        pmId: pm.id, tanggal, distribusiId: distId, menu,
        statusKonsumsi, rating, feedback, foto,
      });
    }
  }
  console.log('  📋 Evaluasi showcase dibuat (20 siswa × 7 hari).');

  // ── NON-SHOWCASE: SMA 19 (sebagian mengisi, sebagian belum) ────────────────
  // Hanya distribusi yang sudah terkonfirmasi (bukan hari terakhir/DIKIRIM).
  for (const dist of s19Dist.filter((_, i) => i < s19Dist.length - 1)) {
    // ~70% siswa mengisi
    for (const pm of s19PM) {
      if (Math.random() < 0.3) continue; // sebagian belum mengisi
      const rating = weightedRating();
      let feedback: string | null = null;
      let foto: string | null = null;
      let sentimen: SentimenLabel | null = null;
      if (rating <= 2) {
        sentimen = SentimenLabel.NEGATIF; feedback = pick(FB_NEGATIF); foto = genFoto();
      } else if (rating >= 4 && Math.random() < 0.2) {
        sentimen = SentimenLabel.POSITIF; feedback = pick(FB_POSITIF); foto = genFoto();
      }
      await makeEvaluasi({
        pmId: pm.id, tanggal: dist.tanggal, distribusiId: dist.id, menu: dist.menu,
        statusKonsumsi: StatusKonsumsi.KONSUMSI, rating, feedback, foto, sentimen,
        synthSentimen: true, // NON-showcase: label sintetis agar dashboard tidak kosong
      });
    }
  }
  console.log('  📋 Evaluasi SMA 19 dibuat (sebagian, hari terakhir belum diisi).');

  // ── NON-SHOWCASE: Lebak Siliwangi → SMA 2 & 3 (dominan POSITIF, 1-2 NEGATIF) ─
  let resolvedDemoUsed = false;
  for (const dist of siliwangiDist.filter((d) => d.menu)) {
    // lewati distribusi pending (DIKIRIM hari terakhir) — belum bisa dievaluasi
    const distRow = await prisma.distribusi.findUnique({ where: { id: dist.id } });
    if (distRow?.status === StatusDistribusi.DIKIRIM) continue;
    for (const pm of dist.pm) {
      if (Math.random() < 0.25) continue;
      // dominan positif
      const rating = Math.random() < 0.75 ? (Math.random() < 0.5 ? 4 : 5) : (Math.random() < 0.6 ? 3 : 2);
      let feedback: string | null = null;
      let foto: string | null = null;
      let sentimen: SentimenLabel | null = null;
      let resolvedById: string | null = null;
      if (rating <= 2) {
        sentimen = SentimenLabel.NEGATIF; feedback = pick(FB_NEGATIF); foto = genFoto();
        if (!resolvedDemoUsed) { resolvedById = dist.sekolah.guruId; resolvedDemoUsed = true; }
      } else if (rating >= 4 && Math.random() < 0.35) {
        sentimen = SentimenLabel.POSITIF; feedback = pick(FB_POSITIF); foto = genFoto();
      }
      await makeEvaluasi({
        pmId: pm.id, tanggal: dist.tanggal, distribusiId: dist.id, menu: dist.menu,
        statusKonsumsi: StatusKonsumsi.KONSUMSI, rating, feedback, foto, sentimen, resolvedById,
        synthSentimen: true, // NON-showcase: label sintetis agar dashboard tidak kosong
      });
    }
  }
  console.log('  📋 Evaluasi SMA 2 & 3 dibuat (dominan positif, 1 feedback resolved).');

  // ── NON-SHOWCASE: Dago → SMA 5 & 6 (lebih sedikit, sentimen bebas) ─────────
  for (const dist of dagoDist) {
    const distRow = await prisma.distribusi.findUnique({ where: { id: dist.id } });
    if (distRow?.status === StatusDistribusi.DRAFT) continue; // draft belum dievaluasi
    for (const pm of dist.pm) {
      if (Math.random() < 0.4) continue; // presensi lebih sedikit
      const rating = weightedRating();
      let feedback: string | null = null;
      let foto: string | null = null;
      let sentimen: SentimenLabel | null = null;
      if (rating <= 2) {
        sentimen = SentimenLabel.NEGATIF; feedback = pick(FB_NEGATIF); foto = genFoto();
      } else if (rating === 3 && Math.random() < 0.4) {
        sentimen = SentimenLabel.NETRAL; feedback = pick(FB_NETRAL); foto = genFoto();
      }
      await makeEvaluasi({
        pmId: pm.id, tanggal: dist.tanggal, distribusiId: dist.id, menu: dist.menu,
        statusKonsumsi: StatusKonsumsi.KONSUMSI, rating, feedback, foto, sentimen,
        synthSentimen: true, // NON-showcase: label sintetis agar dashboard tidak kosong
      });
    }
  }
  console.log('  📋 Evaluasi SMA 5 & 6 dibuat (lebih sedikit).');

  // ════════════════════════════════════════════════════════════════════════
  console.log('\n🎉 Seed selesai!');
  console.log('   Akun kunci (password Tim Dapur/Guru/PM = "mbg12345"):');
  console.log(`   👑 ${ADMIN_EMAIL}                 | Password123! | ADMIN`);
  console.log('   🍳 lebakgede.dapur@gmail.com      | mbg12345 | TIM_DAPUR (SHOWCASE)');
  console.log('   🧑‍🏫 sman1bandung.guru@gmail.com    | mbg12345 | GURU (SHOWCASE)');
  console.log(`   🎓 ${PM_A.email} | mbg12345 | PM-A (selalu positif)`);
  console.log(`   🎓 ${PM_B.email}     | mbg12345 | PM-B (pernah rating rendah)`);
  console.log(`   🎓 ${PM_C.email}    | mbg12345 | PM-C (pernah tidak konsumsi)`);
  console.log('\n   ℹ️  Sentimen (HYBRID): feedback SHOWCASE sengaja sentimen=NULL →');
  console.log('      jalankan SentimenService (cron tiap jam / triggerManual) agar');
  console.log('      dinilai model HuggingFace. Feedback NON-showcase sudah berlabel.');
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
