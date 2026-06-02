/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SEED UAT — Sistem Evaluasi MBG
 * ════════════════════════════════════════════════════════════════════════════
 *  Dijalankan manual sebelum SETIAP sesi UAT:
 *      npm run seed:uat          (dari root)
 *      atau:  npx ts-node prisma/seed-uat.ts   (dari folder backend)
 *
 *  TIDAK memodifikasi prisma/seed.ts. File ini bersifat aditif & terisolasi:
 *  hanya menyentuh entitas ber-tag "UAT Demo" dan 3 akun *.uat@demo.test.
 *  Data showcase (seed.ts) maupun data akun lain TIDAK disentuh.
 *
 *  Prasyarat: base data sudah ada (mis. sudah pernah `npm run db:seed`),
 *  walau seed-uat membuat entitasnya sendiri sehingga tetap jalan di DB kosong.
 *
 *  Urutan:
 *    1. UPSERT entitas UAT (Dapur, Sekolah, Kelas) + 3 akun + profil.
 *    2. RESET sesi: hapus evaluasi & distribusi HARI INI milik entitas UAT
 *       (slate bersih agar alur live dapur→guru→siswa bisa diulang tiap sesi).
 *    3. HISTORIS (idempotent): bila belum ada, buat menu + distribusi SELESAI
 *       + feedback historis bervariasi sentimen agar dashboard terisi.
 *    4. Ringkasan.
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

// ── Konstanta UAT ─────────────────────────────────────────────────────────────
const UAT_PASSWORD = 'UATDemo2025';
const DAPUR_NAMA = 'SPPG UAT Demo';
const SEKOLAH_NAMA = 'SMA UAT Demo';
const KELAS_NAMA = 'XII UAT 1';
const SISWA_EMAIL = 'siswa.uat@demo.test';
const DAPUR_EMAIL = 'dapur.uat@demo.test';
const GURU_EMAIL = 'guru.uat@demo.test';

const uid = () => randomUUID();

/** Tanggal kalender (UTC midnight) n hari lalu — selaras kolom @db.Date. */
function dateDaysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}
const TODAY = dateDaysAgo(0);

// ── Feedback historis (2 positif, 2 negatif, 1 netral) ───────────────────────
type Hist = { dayAgo: number; rating: number; status: StatusKonsumsi; feedback: string; sentimen: SentimenLabel };
const HISTORIS: Hist[] = [
  { dayAgo: 1, rating: 5, status: StatusKonsumsi.KONSUMSI, feedback: 'Makanannya enak dan porsinya pas, saya suka banget.', sentimen: SentimenLabel.POSITIF },
  { dayAgo: 2, rating: 2, status: StatusKonsumsi.KONSUMSI, feedback: 'Sayurnya kurang matang dan porsinya kecil, jadi kurang kenyang.', sentimen: SentimenLabel.NEGATIF },
  { dayAgo: 3, rating: 3, status: StatusKonsumsi.KONSUMSI, feedback: 'Makanan hari ini biasa saja, tapi tetap habis.', sentimen: SentimenLabel.NETRAL },
  { dayAgo: 4, rating: 2, status: StatusKonsumsi.KONSUMSI, feedback: 'Nasinya keras dan datangnya telat, jadi sudah dingin.', sentimen: SentimenLabel.NEGATIF },
  { dayAgo: 5, rating: 5, status: StatusKonsumsi.KONSUMSI, feedback: 'Ayam gorengnya gurih dan nasinya pulen, mantap!', sentimen: SentimenLabel.POSITIF },
];

function sentimenSkorFor(label: SentimenLabel): number {
  if (label === SentimenLabel.POSITIF) return +(0.78 + Math.random() * 0.2).toFixed(2);
  if (label === SentimenLabel.NETRAL) return +(0.42 + Math.random() * 0.18).toFixed(2);
  return +(0.05 + Math.random() * 0.2).toFixed(2);
}
function rawLabelFor(label: SentimenLabel): string {
  if (label === SentimenLabel.POSITIF) return 'positive';
  if (label === SentimenLabel.NEGATIF) return 'negative';
  return 'neutral';
}

// ════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('🌱 Seed UAT — menyiapkan entitas & akun demo ...');
  const hash = await bcrypt.hash(UAT_PASSWORD, 10);

  // ── 1. ENTITAS UAT ──────────────────────────────────────────────────────────
  const dapur = await prisma.dapur.upsert({
    where: { nama: DAPUR_NAMA },
    update: {},
    create: {
      id: uid(), nama: DAPUR_NAMA, alamat: 'Jl. Demo UAT No. 1, Bandung',
      provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: 'Coblong',
    },
  });
  const sekolah = await prisma.sekolah.upsert({
    where: { nama: SEKOLAH_NAMA },
    update: { dapurId: dapur.id },
    create: {
      id: uid(), nama: SEKOLAH_NAMA, alamat: 'Jl. Demo UAT No. 2, Bandung',
      provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: 'Coblong',
      dapurId: dapur.id,
    },
  });
  // Kelas tidak punya unique pada nama → guard manual.
  let kelas = await prisma.kelas.findFirst({ where: { sekolahId: sekolah.id, nama: KELAS_NAMA } });
  if (!kelas) {
    kelas = await prisma.kelas.create({ data: { id: uid(), sekolahId: sekolah.id, nama: KELAS_NAMA } });
  }

  // ── Akun + profil (upsert by email / userId) ─────────────────────────────────
  async function upsertUser(email: string, name: string, role: Role) {
    return prisma.user.upsert({
      where: { email },
      update: { name, role, password: hash, isActive: true },
      create: { id: uid(), email, name, role, password: hash },
    });
  }

  const siswa = await upsertUser(SISWA_EMAIL, 'Siswa UAT Demo', Role.PENERIMA_MANFAAT);
  await prisma.penerimaManfaatProfile.upsert({
    where: { userId: siswa.id },
    update: { sekolahId: sekolah.id, kelasId: kelas.id },
    create: { id: uid(), userId: siswa.id, nisn: 'UAT0000001', sekolahId: sekolah.id, kelasId: kelas.id },
  });

  const dapurUser = await upsertUser(DAPUR_EMAIL, 'Dapur UAT Demo', Role.TIM_DAPUR);
  await prisma.timDapurProfile.upsert({
    where: { userId: dapurUser.id },
    update: { dapurId: dapur.id },
    create: { id: uid(), userId: dapurUser.id, dapurId: dapur.id },
  });

  const guruUser = await upsertUser(GURU_EMAIL, 'Guru UAT Demo', Role.GURU);
  await prisma.guruProfile.upsert({
    where: { userId: guruUser.id },
    update: { sekolahId: sekolah.id },
    create: { id: uid(), userId: guruUser.id, sekolahId: sekolah.id },
  });
  console.log('  ✓ Entitas UAT + 3 akun siap.');

  // ── 2. RESET SESI HARI INI (scoped ke entitas UAT) ───────────────────────────
  await prisma.$transaction(async (tx) => {
    // Evaluasi hari ini milik siswa UAT (PenilaianKomponen ikut terhapus via cascade).
    await tx.evaluasiHarian.deleteMany({
      where: { penerimaManfaatId: siswa.id, tanggal: TODAY },
    });
    // Distribusi hari ini untuk sekolah UAT (mencakup DRAFT buatan dapur.uat &
    // konfirmasi/catatan guru.uat) → slate bersih untuk alur live.
    await tx.distribusi.deleteMany({
      where: { sekolahId: sekolah.id, tanggal: TODAY },
    });
  });
  console.log('  🧹 Data sesi HARI INI (sekolah UAT) direset.');

  // ── 3. DATA HISTORIS (idempotent) ─────────────────────────────────────────────
  const sudahAdaHistoris = await prisma.distribusi.count({
    where: { sekolahId: sekolah.id, tanggal: { lt: TODAY } },
  });

  if (sudahAdaHistoris === 0) {
    // 3 komponen master (unik per [dapurId, nama]).
    const komNama = ['Nasi Putih', 'Ayam Goreng', 'Tumis Sayur'];
    const komMaster: Record<string, string> = {};
    for (const nm of komNama) {
      const km = await prisma.komponenMaster.upsert({
        where: { dapurId_nama: { dapurId: dapur.id, nama: nm } },
        update: {},
        create: { id: uid(), dapurId: dapur.id, nama: nm },
      });
      komMaster[nm] = km.id;
    }

    // 3 menu, masing-masing 3 komponen.
    const menuDefs = [
      { nama: 'Nasi Ayam Goreng + Tumis Sayur', energi: 520, protein: 28 },
      { nama: 'Nasi Ayam + Sayur Bening', energi: 480, protein: 26 },
      { nama: 'Nasi Goreng Ayam + Lalapan', energi: 500, protein: 27 },
    ];
    const menus: { id: string; komponen: { id: string }[] }[] = [];
    for (const def of menuDefs) {
      const menu = await prisma.menuMaster.create({
        data: {
          id: uid(), dapurId: dapur.id, nama: def.nama,
          deskripsi: 'Menu demo UAT.', energiKkal: def.energi, proteinGram: def.protein,
        },
      });
      const komponen: { id: string }[] = [];
      for (const nm of komNama) {
        const mk = await prisma.menuKomponen.create({
          data: { id: uid(), menuId: menu.id, komponenMasterId: komMaster[nm], namaSnapshot: nm },
        });
        komponen.push({ id: mk.id });
      }
      menus.push({ id: menu.id, komponen });
    }

    // 5 hari distribusi SELESAI + jadwal + evaluasi/feedback historis.
    for (let i = 0; i < HISTORIS.length; i++) {
      const h = HISTORIS[i];
      const tanggal = dateDaysAgo(h.dayAgo);
      const menu = menus[i % menus.length];

      await prisma.menuHarian.upsert({
        where: { tanggal_menuId: { tanggal, menuId: menu.id } },
        update: {},
        create: { id: uid(), tanggal, menuId: menu.id },
      });

      const dist = await prisma.distribusi.create({
        data: {
          id: uid(), tanggal, sekolahId: sekolah.id, dapurId: dapur.id, menuId: menu.id,
          jumlahPorsi: 30, status: StatusDistribusi.SELESAI,
          createdById: dapurUser.id, confirmedById: guruUser.id,
          catatanDapur: 'Dikirim lengkap dan tepat waktu.',
          catatanGuru: 'Makanan diterima dalam kondisi baik.',
        },
      });

      const sentimen = h.sentimen;
      await prisma.evaluasiHarian.create({
        data: {
          id: uid(), tanggal, penerimaManfaatId: siswa.id, distribusiId: dist.id,
          statusKonsumsi: h.status, ratingKeseluruhan: h.rating, feedback: h.feedback,
          sentimen, sentimenSkor: sentimenSkorFor(sentimen), sentimenLabel: rawLabelFor(sentimen),
          sentimenAnalyzedAt: new Date(), kategori: categorize(h.feedback),
          penilaianKomponen: {
            create: menu.komponen.map((k) => ({
              id: uid(), komponenId: k.id,
              skorKeterhabisan: h.status === StatusKonsumsi.TIDAK_KONSUMSI ? 1 : Math.max(1, Math.min(5, h.rating)),
            })),
          },
        },
      });
    }
    console.log('  📚 Data historis dibuat (3 menu, 5 distribusi SELESAI, 5 feedback).');
  } else {
    console.log('  ⏭️  Data historis sudah ada → dilewati.');
  }

  // ── 4. RINGKASAN ──────────────────────────────────────────────────────────────
  const now = new Date().toLocaleString('id-ID');
  console.log('\n============================================');
  console.log(`UAT DATA READY — ${now}`);
  console.log('============================================');
  console.log('✓ Data sesi hari ini direset');
  console.log('✓ Akun UAT siap:');
  console.log(`  - ${SISWA_EMAIL}  → PENERIMA_MANFAAT`);
  console.log(`  - ${DAPUR_EMAIL}  → TIM_DAPUR`);
  console.log(`  - ${GURU_EMAIL}   → GURU`);
  console.log(`  Password: ${UAT_PASSWORD}`);
  console.log(`✓ Entitas: ${DAPUR_NAMA} / ${SEKOLAH_NAMA} / ${KELAS_NAMA}`);
  console.log('✓ Data historis tersedia');
  console.log('============================================');
  console.log('Langkah selanjutnya: jalankan npm run tunnel:uat');
  console.log('============================================');
}

main()
  .catch((e) => {
    console.error('❌ Seed UAT gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
