import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { role: 'TIM_DAPUR' } });
  
  for (const user of users) {
    const profile = await prisma.timDapurProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      console.log(`Creating Dapur for user ${user.email}...`);
      const dapur = await prisma.dapur.create({
        data: {
          nama: `Dapur ${user.name}`,
          alamat: 'Alamat default'
        }
      });
      await prisma.timDapurProfile.create({
        data: {
          userId: user.id,
          dapurId: dapur.id
        }
      });
      console.log(`Mapped ${user.email} to ${dapur.nama}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
