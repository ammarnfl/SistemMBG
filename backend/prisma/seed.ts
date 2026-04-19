import { PrismaClient, Role } from '@prisma/client';
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
    {
      email: 'admin@example.com',
      name: 'Admin Sistem',
      role: Role.ADMIN,
    },
    {
      email: 'dapur@example.com',
      name: 'Tim Dapur Utama',
      role: Role.TIM_DAPUR,
    },
    {
      email: 'guru@example.com',
      name: 'Guru SDN 01',
      role: Role.GURU,
    },
    {
      email: 'pm@example.com',
      name: 'Andi Penerima Manfaat',
      role: Role.PENERIMA_MANFAAT,
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword,
      },
    });
    console.log(`✅ Upserted user: ${user.email} [${user.role}]`);
  }

  console.log('');
  console.log('🎉 Seed completed!');
  console.log('');
  console.log('📋 Akun dummy untuk development:');
  console.log('  admin@example.com     | Password123! | ADMIN');
  console.log('  dapur@example.com     | Password123! | TIM_DAPUR');
  console.log('  guru@example.com      | Password123! | GURU');
  console.log('  pm@example.com        | Password123! | PENERIMA_MANFAAT');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
