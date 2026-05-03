import { PrismaClient, Role, StatusDistribusi } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:root@127.0.0.1:5432/mbg_db?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['query'] });

const SEED_PASSWORD = 'Password123!';

async function main() {
  console.log('🌱 Starting seed...');

  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

  const users = [
    { email: 'admin@example.com', name: 'Admin Sistem', role: Role.ADMIN },
    { email: 'dapur@example.com', name: 'Tim Dapur Utama', role: Role.TIM_DAPUR },
    { email: 'guru@example.com', name: 'Guru SDN 01', role: Role.GURU },
    { email: 'pm@example.com', name: 'Andi Penerima Manfaat', role: Role.PENERIMA_MANFAAT },
  ];

  const upsertedUsers = [];
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: { ...userData, password: hashedPassword },
    });
    upsertedUsers.push(user);
    console.log(`✅ Upserted user: ${user.email} [${user.role}]`);
  }

  // Find Users by Role
  const dapurUser = upsertedUsers.find((u) => u.role === Role.TIM_DAPUR)!;
  const guruUser = upsertedUsers.find((u) => u.role === Role.GURU)!;

  // Master Data: Dapur & Sekolah
  const dapurPusat = await prisma.dapur.create({
    data: { nama: 'Dapur Umum Pusat MBG', alamat: 'Jl. Merdeka No. 1' }
  });

  const sekolahUtama = await prisma.sekolah.create({
    data: { nama: 'SDN 01 Merdeka', alamat: 'Jl. Merdeka No. 15', dapurId: dapurPusat.id }
  });

  const kelas1A = await prisma.kelas.create({
    data: { nama: 'Kelas 1A', sekolahId: sekolahUtama.id }
  });

  // Assign GuruProfile to Guru
  await prisma.guruProfile.create({
    data: { userId: guruUser.id, sekolahId: sekolahUtama.id }
  });

  // Create Menu Master & Komposisi
  const menuNasiAyam = await prisma.menuMaster.create({
    data: {
      nama: 'Nasi Ayam Teriyaki', deskripsi: 'Nasi putih dengan ayam teriyaki dan sayur brokoli',
      komponen: {
        create: [
          { nama: 'Nasi Putih', porsi: '150 gr' },
          { nama: 'Ayam Teriyaki', porsi: '100 gr' },
          { nama: 'Cah Brokoli Wortel', porsi: '50 gr' },
          { nama: 'Susu UHT', porsi: '200 ml' }
        ]
      }
    }
  });

  // Create Menu Harian (Assign Menu to Today)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to Date only

  const menuHarian = await prisma.menuHarian.create({
    data: {
      tanggal: today,
      menuId: menuNasiAyam.id
    }
  });

  // Create Sample Distribusi
  await prisma.distribusi.create({
    data: {
      tanggal: today,
      sekolahId: sekolahUtama.id,
      dapurId: dapurPusat.id,
      jumlahPorsi: 35,
      status: StatusDistribusi.DIKIRIM,
      catatanDapur: 'Diantar supir Pak Budi',
      createdById: dapurUser.id
    }
  });

  console.log('✅ Seeded master data (Dapur, Sekolah, Menu, Distribusi)');
  console.log('');
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
