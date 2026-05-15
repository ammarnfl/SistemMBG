import { PrismaService } from './src/prisma/prisma.service';

const prisma = new PrismaService();

async function main() {
  await prisma.$connect();
  const dapur = await prisma.dapur.findMany();
  const dSeen = new Set<string>();
  for (const d of dapur) {
    if (dSeen.has(d.nama)) {
      await prisma.dapur.update({ where: { id: d.id }, data: { nama: d.nama + '_' + Math.random().toString(36).substring(7) }});
    } else {
      dSeen.add(d.nama);
    }
  }

  const sekolah = await prisma.sekolah.findMany();
  const sSeen = new Set<string>();
  for (const s of sekolah) {
    if (sSeen.has(s.nama)) {
      await prisma.sekolah.update({ where: { id: s.id }, data: { nama: s.nama + '_' + Math.random().toString(36).substring(7) }});
    } else {
      sSeen.add(s.nama);
    }
  }
}

main().then(() => console.log('dedup done')).catch(console.error).finally(() => prisma.$disconnect());
