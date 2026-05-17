import 'dotenv/config';
import { PrismaClient, Role, StatusDistribusi, StatusKonsumsi } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:root@127.0.0.1:5432/mbg_db?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['warn', 'error'] });

const SEED_PASSWORD = 'Password123!';

async function main() {
  console.log('🌱 Starting demo seed...');

  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

  // ─── USERS ─────────────────────────────────────────────────────────────────
  const usersData = [
    { email: 'admin@example.com', name: 'Admin Sistem', role: Role.ADMIN },
    { email: 'dapur@example.com', name: 'Tim Dapur Utama', role: Role.TIM_DAPUR },
    { email: 'guru@example.com', name: 'Bu Sari (Guru SDN 01)', role: Role.GURU },
    { email: 'guru2@example.com', name: 'Pak Budi (Guru SDN 02)', role: Role.GURU },
    { email: 'pm@example.com', name: 'Andi Pratama', role: Role.PENERIMA_MANFAAT },
    { email: 'pm2@example.com', name: 'Budi Santoso', role: Role.PENERIMA_MANFAAT },
    { email: 'pm3@example.com', name: 'Citra Dewi', role: Role.PENERIMA_MANFAAT },
    { email: 'pm4@example.com', name: 'Dinda Rahayu', role: Role.PENERIMA_MANFAAT },
  ];

  const upsertedUsers: any[] = [];
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashedPassword, name: u.name },
      create: { ...u, password: hashedPassword },
    });
    upsertedUsers.push(user);
    console.log(`  ✅ User: ${user.email} [${user.role}]`);
  }

  const adminUser = upsertedUsers.find((u) => u.role === Role.ADMIN)!;
  const dapurUser = upsertedUsers.find((u) => u.role === Role.TIM_DAPUR)!;
  const guruUser1 = upsertedUsers.find((u) => u.email === 'guru@example.com')!;
  const guruUser2 = upsertedUsers.find((u) => u.email === 'guru2@example.com')!;
  const pm1 = upsertedUsers.find((u) => u.email === 'pm@example.com')!;
  const pm2 = upsertedUsers.find((u) => u.email === 'pm2@example.com')!;
  const pm3 = upsertedUsers.find((u) => u.email === 'pm3@example.com')!;
  const pm4 = upsertedUsers.find((u) => u.email === 'pm4@example.com')!;

  // ─── DAPUR ──────────────────────────────────────────────────────────────────
  let dapurPusat = await prisma.dapur.findFirst({ where: { nama: 'Dapur Umum Pusat MBG' } });
  if (!dapurPusat) {
    dapurPusat = await prisma.dapur.create({
      data: { nama: 'Dapur Umum Pusat MBG', alamat: 'Jl. Merdeka No. 1, Jakarta Pusat' },
    });
  }
  console.log(`  ✅ Dapur: ${dapurPusat.nama}`);

  // TimDapurProfile
  await prisma.timDapurProfile.upsert({
    where: { userId: dapurUser.id },
    update: { dapurId: dapurPusat.id },
    create: { userId: dapurUser.id, dapurId: dapurPusat.id },
  });

  // ─── SEKOLAH ────────────────────────────────────────────────────────────────
  let sekolah1 = await prisma.sekolah.findFirst({ where: { nama: 'SDN 01 Merdeka' } });
  if (!sekolah1) {
    sekolah1 = await prisma.sekolah.create({
      data: { nama: 'SDN 01 Merdeka', alamat: 'Jl. Merdeka No. 15', dapurId: dapurPusat.id },
    });
  }
  let sekolah2 = await prisma.sekolah.findFirst({ where: { nama: 'SDN 02 Bahagia' } });
  if (!sekolah2) {
    sekolah2 = await prisma.sekolah.create({
      data: { nama: 'SDN 02 Bahagia', alamat: 'Jl. Bahagia No. 8', dapurId: dapurPusat.id },
    });
  }
  console.log(`  ✅ Sekolah: ${sekolah1.nama}, ${sekolah2.nama}`);

  // ─── KELAS ──────────────────────────────────────────────────────────────────
  let kelas1A = await prisma.kelas.findFirst({ where: { nama: 'Kelas 1A', sekolahId: sekolah1.id } });
  if (!kelas1A) kelas1A = await prisma.kelas.create({ data: { nama: 'Kelas 1A', sekolahId: sekolah1.id } });

  let kelas1B = await prisma.kelas.findFirst({ where: { nama: 'Kelas 1B', sekolahId: sekolah1.id } });
  if (!kelas1B) kelas1B = await prisma.kelas.create({ data: { nama: 'Kelas 1B', sekolahId: sekolah1.id } });

  let kelas2A = await prisma.kelas.findFirst({ where: { nama: 'Kelas 2A', sekolahId: sekolah2.id } });
  if (!kelas2A) kelas2A = await prisma.kelas.create({ data: { nama: 'Kelas 2A', sekolahId: sekolah2.id } });

  // ─── GURU PROFILES ──────────────────────────────────────────────────────────
  await prisma.guruProfile.upsert({
    where: { userId: guruUser1.id },
    update: { sekolahId: sekolah1.id },
    create: { userId: guruUser1.id, sekolahId: sekolah1.id },
  });
  await prisma.guruProfile.upsert({
    where: { userId: guruUser2.id },
    update: { sekolahId: sekolah2.id },
    create: { userId: guruUser2.id, sekolahId: sekolah2.id },
  });

  // ─── PM PROFILES ────────────────────────────────────────────────────────────
  await prisma.penerimaManfaatProfile.upsert({
    where: { userId: pm1.id },
    update: { sekolahId: sekolah1.id, kelasId: kelas1A.id },
    create: { userId: pm1.id, sekolahId: sekolah1.id, kelasId: kelas1A.id },
  });
  await prisma.penerimaManfaatProfile.upsert({
    where: { userId: pm2.id },
    update: { sekolahId: sekolah1.id, kelasId: kelas1B.id },
    create: { userId: pm2.id, sekolahId: sekolah1.id, kelasId: kelas1B.id },
  });
  await prisma.penerimaManfaatProfile.upsert({
    where: { userId: pm3.id },
    update: { sekolahId: sekolah2.id, kelasId: kelas2A.id },
    create: { userId: pm3.id, sekolahId: sekolah2.id, kelasId: kelas2A.id },
  });
  await prisma.penerimaManfaatProfile.upsert({
    where: { userId: pm4.id },
    update: { sekolahId: sekolah2.id, kelasId: kelas2A.id },
    create: { userId: pm4.id, sekolahId: sekolah2.id, kelasId: kelas2A.id },
  });
  console.log('  ✅ Profiles assigned (guru + penerima manfaat)');

  // ─── MENU MASTER ────────────────────────────────────────────────────────────
  let menuNasiAyam = await prisma.menuMaster.findFirst({ where: { nama: 'Nasi Ayam Teriyaki' } });
  if (!menuNasiAyam) {
    menuNasiAyam = await prisma.menuMaster.create({
      data: {
        nama: 'Nasi Ayam Teriyaki',
        deskripsi: 'Nasi putih dengan ayam teriyaki dan sayur brokoli segar',
        dapurId: dapurPusat.id,
        energiKkal: 480,
        proteinGram: 28,
        lemakGram: 12,
        karbohidratGram: 68,
        seratGram: 4,
      },
    });
    // Create komponen master entries
    const km1 = await prisma.komponenMaster.upsert({
      where: { dapurId_nama: { dapurId: dapurPusat.id, nama: 'Nasi Putih' } },
      update: {},
      create: { dapurId: dapurPusat.id, nama: 'Nasi Putih', deskripsi: '150 gr nasi putih pulen' },
    });
    const km2 = await prisma.komponenMaster.upsert({
      where: { dapurId_nama: { dapurId: dapurPusat.id, nama: 'Ayam Teriyaki' } },
      update: {},
      create: { dapurId: dapurPusat.id, nama: 'Ayam Teriyaki', deskripsi: '100 gr ayam teriyaki' },
    });
    const km3 = await prisma.komponenMaster.upsert({
      where: { dapurId_nama: { dapurId: dapurPusat.id, nama: 'Cah Brokoli Wortel' } },
      update: {},
      create: { dapurId: dapurPusat.id, nama: 'Cah Brokoli Wortel', deskripsi: '50 gr sayur' },
    });
    const km4 = await prisma.komponenMaster.upsert({
      where: { dapurId_nama: { dapurId: dapurPusat.id, nama: 'Susu UHT Coklat' } },
      update: {},
      create: { dapurId: dapurPusat.id, nama: 'Susu UHT Coklat', deskripsi: '200 ml susu UHT' },
    });
    await prisma.menuKomponen.createMany({
      data: [
        { menuId: menuNasiAyam.id, komponenMasterId: km1.id, namaSnapshot: km1.nama },
        { menuId: menuNasiAyam.id, komponenMasterId: km2.id, namaSnapshot: km2.nama },
        { menuId: menuNasiAyam.id, komponenMasterId: km3.id, namaSnapshot: km3.nama },
        { menuId: menuNasiAyam.id, komponenMasterId: km4.id, namaSnapshot: km4.nama },
      ],
    });
  }

  let menuNasiIkan = await prisma.menuMaster.findFirst({ where: { nama: 'Nasi Ikan Bakar Sambal' } });
  if (!menuNasiIkan) {
    menuNasiIkan = await prisma.menuMaster.create({
      data: {
        nama: 'Nasi Ikan Bakar Sambal',
        deskripsi: 'Nasi putih dengan ikan bakar kecap, sambal tomat, dan lalapan',
        dapurId: dapurPusat.id,
        energiKkal: 420,
        proteinGram: 30,
        lemakGram: 10,
        karbohidratGram: 58,
        seratGram: 3,
      },
    });
    const km5 = await prisma.komponenMaster.upsert({
      where: { dapurId_nama: { dapurId: dapurPusat.id, nama: 'Ikan Bakar Kecap' } },
      update: {},
      create: { dapurId: dapurPusat.id, nama: 'Ikan Bakar Kecap', deskripsi: '120 gr ikan bakar' },
    });
    const km6 = await prisma.komponenMaster.upsert({
      where: { dapurId_nama: { dapurId: dapurPusat.id, nama: 'Lalapan & Sambal' } },
      update: {},
      create: { dapurId: dapurPusat.id, nama: 'Lalapan & Sambal', deskripsi: '30 gr lalapan dan sambal' },
    });
    const km7 = await prisma.komponenMaster.upsert({
      where: { dapurId_nama: { dapurId: dapurPusat.id, nama: 'Air Mineral' } },
      update: {},
      create: { dapurId: dapurPusat.id, nama: 'Air Mineral', deskripsi: '330 ml air mineral' },
    });
    // reuse km1 (Nasi Putih)
    const km1Reuse = await prisma.komponenMaster.findUnique({
      where: { dapurId_nama: { dapurId: dapurPusat.id, nama: 'Nasi Putih' } },
    });
    await prisma.menuKomponen.createMany({
      data: [
        { menuId: menuNasiIkan.id, komponenMasterId: km1Reuse!.id, namaSnapshot: 'Nasi Putih' },
        { menuId: menuNasiIkan.id, komponenMasterId: km5.id, namaSnapshot: km5.nama },
        { menuId: menuNasiIkan.id, komponenMasterId: km6.id, namaSnapshot: km6.nama },
        { menuId: menuNasiIkan.id, komponenMasterId: km7.id, namaSnapshot: km7.nama },
      ],
    });
  }
  console.log(`  ✅ Menu: ${menuNasiAyam.nama}, ${menuNasiIkan.nama}`);

  // ─── MENU HARIAN ─────────────────────────────────────────────────────────────
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dayBefore = new Date(today);
  dayBefore.setDate(today.getDate() - 2);

  // Assign menus to dates (upsert to avoid conflicts)
  await prisma.menuHarian.upsert({
    where: { tanggal_menuId: { tanggal: today, menuId: menuNasiAyam.id } },
    update: {},
    create: { tanggal: today, menuId: menuNasiAyam.id },
  });
  await prisma.menuHarian.upsert({
    where: { tanggal_menuId: { tanggal: yesterday, menuId: menuNasiIkan.id } },
    update: {},
    create: { tanggal: yesterday, menuId: menuNasiIkan.id },
  });
  await prisma.menuHarian.upsert({
    where: { tanggal_menuId: { tanggal: dayBefore, menuId: menuNasiAyam.id } },
    update: {},
    create: { tanggal: dayBefore, menuId: menuNasiAyam.id },
  });
  console.log('  ✅ Menu harian scheduled (today + 2 days back)');

  // ─── DISTRIBUSI ──────────────────────────────────────────────────────────────
  // Helper to upsert distribusi
  async function upsertDistribusi(tanggal: Date, sekolahId: string, menuId: string, status: StatusDistribusi, catatan?: string) {
    const existing = await prisma.distribusi.findFirst({ where: { tanggal, sekolahId } });
    if (!existing) {
      return prisma.distribusi.create({
        data: {
          tanggal,
          sekolahId,
          dapurId: dapurPusat!.id,
          jumlahPorsi: 35,
          status,
          catatanDapur: catatan || 'Dikirim tepat waktu',
          createdById: dapurUser.id,
          menuId,
        },
      });
    }
    return existing;
  }

  const distToday1 = await upsertDistribusi(today, sekolah1.id, menuNasiAyam.id, StatusDistribusi.DIKIRIM, 'Diantar Pak Budi pukul 07.30');
  const distToday2 = await upsertDistribusi(today, sekolah2.id, menuNasiAyam.id, StatusDistribusi.DITERIMA, 'Sudah diterima lengkap');
  const distYesterday1 = await upsertDistribusi(yesterday, sekolah1.id, menuNasiIkan.id, StatusDistribusi.SELESAI, 'Semua makanan terdistribusi');
  const distYesterday2 = await upsertDistribusi(yesterday, sekolah2.id, menuNasiIkan.id, StatusDistribusi.SELESAI);
  const distDayBefore = await upsertDistribusi(dayBefore, sekolah1.id, menuNasiAyam.id, StatusDistribusi.SELESAI);

  // Update catatanGuru for SELESAI
  if (distYesterday1.status === StatusDistribusi.SELESAI && !distYesterday1.catatanGuru) {
    await prisma.distribusi.update({
      where: { id: distYesterday1.id },
      data: { catatanGuru: 'Makanan diterima dalam kondisi baik', confirmedById: guruUser1.id },
    });
  }
  console.log('  ✅ Distribusi created (today + 2 days back for both sekolah)');

  // ─── EVALUASI (HISTORICAL) ───────────────────────────────────────────────────
  const menuNasiAyamKomponen = await prisma.menuKomponen.findMany({ where: { menuId: menuNasiAyam.id } });
  const menuNasiIkanKomponen = await prisma.menuKomponen.findMany({ where: { menuId: menuNasiIkan.id } });

  async function upsertEvaluasi(
    userId: string,
    tanggal: Date,
    distribusiId: string,
    statusKonsumsi: StatusKonsumsi,
    rating: number,
    feedback: string | null,
    komponen: { id: string; skor: number }[],
  ) {
    const existing = await prisma.evaluasiHarian.findUnique({
      where: { tanggal_penerimaManfaatId: { tanggal, penerimaManfaatId: userId } },
    });
    if (existing) return existing;

    return prisma.evaluasiHarian.create({
      data: {
        tanggal,
        penerimaManfaatId: userId,
        distribusiId,
        statusKonsumsi,
        ratingKeseluruhan: rating,
        feedback,
        penilaianKomponen: {
          create: komponen.map((k) => ({ komponenId: k.id, skorKeterhabisan: k.skor })),
        },
      },
    });
  }

  // Evaluasi yesterday - sekolah1 (pm1 good, pm2 not good)
  await upsertEvaluasi(
    pm1.id, yesterday, distYesterday1.id, StatusKonsumsi.KONSUMSI, 4, 'Enak, porsi cukup',
    menuNasiIkanKomponen.map((k, i) => ({ id: k.id, skor: [5, 4, 3, 5][i] || 4 })),
  );
  await upsertEvaluasi(
    pm2.id, yesterday, distYesterday1.id, StatusKonsumsi.TIDAK_KONSUMSI, 2,
    'Ikan terlalu amis, tidak bisa makan',
    menuNasiIkanKomponen.map((k, i) => ({ id: k.id, skor: [4, 1, 2, 4][i] || 2 })),
  );

  // Evaluasi dayBefore - sekolah1 (pm1 perfect)
  await upsertEvaluasi(
    pm1.id, dayBefore, distDayBefore.id, StatusKonsumsi.KONSUMSI, 5, null,
    menuNasiAyamKomponen.map((k) => ({ id: k.id, skor: 5 })),
  );

  // Evaluasi yesterday - sekolah2 (pm3 only)
  await upsertEvaluasi(
    pm3.id, yesterday, distYesterday2.id, StatusKonsumsi.KONSUMSI, 3, 'Biasa saja, nasi agak dingin',
    menuNasiIkanKomponen.map((k, i) => ({ id: k.id, skor: [4, 3, 3, 4][i] || 3 })),
  );

  console.log('  ✅ Evaluasi historical seeded (pm1, pm2, pm3 - yesterday & day before)');

  console.log('');
  console.log('🎉 Demo seed completed! Akun tersedia:');
  console.log('  📧 admin@example.com      | 🔑 Password123! | Role: ADMIN');
  console.log('  📧 dapur@example.com      | 🔑 Password123! | Role: TIM_DAPUR');
  console.log('  📧 guru@example.com       | 🔑 Password123! | Role: GURU (SDN 01 Merdeka)');
  console.log('  📧 guru2@example.com      | 🔑 Password123! | Role: GURU (SDN 02 Bahagia)');
  console.log('  📧 pm@example.com         | 🔑 Password123! | Role: PENERIMA_MANFAAT (belum isi hari ini)');
  console.log('  📧 pm2@example.com        | 🔑 Password123! | Role: PENERIMA_MANFAAT');
  console.log('  📧 pm3@example.com        | 🔑 Password123! | Role: PENERIMA_MANFAAT');
  console.log('  📧 pm4@example.com        | 🔑 Password123! | Role: PENERIMA_MANFAAT (belum isi hari ini)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
