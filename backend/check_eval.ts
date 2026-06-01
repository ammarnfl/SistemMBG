import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: 'postgresql://postgres:root@127.0.0.1:5432/mbg_db?schema=public' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const records = await prisma.evaluasiHarian.findMany({
    where: {
      feedback: { not: null }
    },
    select: {
      id: true,
      feedback: true,
      sentimen: true, // Prediksi model
      ratingKeseluruhan: true,
      statusKonsumsi: true,
    }
  });

  let total = records.length;
  let pos = 0, net = 0, neg = 0;
  
  let validPredictions = 0;
  let matches = 0;

  for (const r of records) {
    // Ground truth derived from seeding rules
    let groundTruth = 'NETRAL';
    if (r.statusKonsumsi === 'TIDAK_KONSUMSI') groundTruth = 'NETRAL';
    else if (r.ratingKeseluruhan !== null && r.ratingKeseluruhan <= 2) groundTruth = 'NEGATIF';
    else if (r.ratingKeseluruhan === 3) groundTruth = 'NETRAL';
    else if (r.ratingKeseluruhan !== null && r.ratingKeseluruhan >= 4) groundTruth = 'POSITIF';

    if (groundTruth === 'POSITIF') pos++;
    if (groundTruth === 'NETRAL') net++;
    if (groundTruth === 'NEGATIF') neg++;
    
    if (r.sentimen) {
      validPredictions++;
      if (r.sentimen === groundTruth) matches++;
    }
  }

  console.log(`Total Feedback: ${total}`);
  console.log(`Distribusi Ground Truth -> Positif: ${pos}, Netral: ${net}, Negatif: ${neg}`);
  console.log(`Sudah diprediksi model: ${validPredictions}`);
  if (validPredictions > 0) {
    console.log(`Akurasi Sementara: ${((matches / validPredictions) * 100).toFixed(2)}%`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
