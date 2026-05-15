require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dapur = await prisma.dapur.findMany();
  const dSeen = new Set();
  for (const d of dapur) {
    if (dSeen.has(d.nama)) {
      await prisma.dapur.update({ where: { id: d.id }, data: { nama: d.nama + '_' + Date.now() }});
    } else {
      dSeen.add(d.nama);
    }
  }

  const sekolah = await prisma.sekolah.findMany();
  const sSeen = new Set();
  for (const s of sekolah) {
    if (sSeen.has(s.nama)) {
      await prisma.sekolah.update({ where: { id: s.id }, data: { nama: s.nama + '_' + Date.now() }});
    } else {
      sSeen.add(s.nama);
    }
  }

  const pm = await prisma.penerimaManfaatProfile.findMany();
  const pSeen = new Set();
  for (const p of pm) {
    if (p.nisn && pSeen.has(p.nisn)) {
      await prisma.penerimaManfaatProfile.update({ where: { id: p.id }, data: { nisn: p.nisn + Math.floor(Math.random()*1000) }});
    } else {
      pSeen.add(p.nisn);
    }
  }
}
main().then(()=>console.log('done')).catch(e => console.error(e));
