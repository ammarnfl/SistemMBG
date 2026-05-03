-- CreateEnum
CREATE TYPE "StatusKonsumsi" AS ENUM ('KONSUMSI', 'TIDAK_KONSUMSI');

-- CreateTable
CREATE TABLE "evaluasi_harian" (
    "id" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "penerimaManfaatId" TEXT NOT NULL,
    "distribusiId" TEXT,
    "statusKonsumsi" "StatusKonsumsi" NOT NULL,
    "ratingKeseluruhan" INTEGER,
    "feedback" TEXT,
    "fotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluasi_harian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penilaian_komponen" (
    "id" TEXT NOT NULL,
    "evaluasiId" TEXT NOT NULL,
    "komponenId" TEXT NOT NULL,
    "skorKeterhabisan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penilaian_komponen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "evaluasi_harian_tanggal_penerimaManfaatId_key" ON "evaluasi_harian"("tanggal", "penerimaManfaatId");

-- CreateIndex
CREATE UNIQUE INDEX "penilaian_komponen_evaluasiId_komponenId_key" ON "penilaian_komponen"("evaluasiId", "komponenId");

-- AddForeignKey
ALTER TABLE "evaluasi_harian" ADD CONSTRAINT "evaluasi_harian_penerimaManfaatId_fkey" FOREIGN KEY ("penerimaManfaatId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluasi_harian" ADD CONSTRAINT "evaluasi_harian_distribusiId_fkey" FOREIGN KEY ("distribusiId") REFERENCES "distribusi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaian_komponen" ADD CONSTRAINT "penilaian_komponen_evaluasiId_fkey" FOREIGN KEY ("evaluasiId") REFERENCES "evaluasi_harian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaian_komponen" ADD CONSTRAINT "penilaian_komponen_komponenId_fkey" FOREIGN KEY ("komponenId") REFERENCES "menu_komponen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
