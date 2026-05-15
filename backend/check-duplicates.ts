import { PrismaService } from './src/prisma/prisma.service';

const prisma = new PrismaService();

async function check() {
  await prisma.$connect();
  const d: any[] = await prisma.$queryRaw`SELECT nama, count(*) FROM dapur GROUP BY nama HAVING count(*) > 1`;
  const s: any[] = await prisma.$queryRaw`SELECT nama, count(*) FROM sekolah GROUP BY nama HAVING count(*) > 1`;
  console.log('dapur duplicates:', d);
  console.log('sekolah duplicates:', s);
}

check().then(() => console.log('done')).catch(console.error).finally(() => prisma.$disconnect());
