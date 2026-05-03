-- CreateEnum
CREATE TYPE "StatusDistribusi" AS ENUM ('DRAFT', 'DIKIRIM', 'DITERIMA', 'BERMASALAH', 'SELESAI');

-- CreateTable
CREATE TABLE "menu_master" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_komponen" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "porsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_komponen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_harian" (
    "id" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "menuId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_harian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distribusi" (
    "id" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "sekolahId" TEXT NOT NULL,
    "dapurId" TEXT NOT NULL,
    "jumlahPorsi" INTEGER NOT NULL,
    "status" "StatusDistribusi" NOT NULL DEFAULT 'DRAFT',
    "catatanDapur" TEXT,
    "catatanGuru" TEXT,
    "createdById" TEXT NOT NULL,
    "confirmedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distribusi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "menu_harian_tanggal_menuId_key" ON "menu_harian"("tanggal", "menuId");

-- AddForeignKey
ALTER TABLE "menu_komponen" ADD CONSTRAINT "menu_komponen_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menu_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_harian" ADD CONSTRAINT "menu_harian_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menu_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribusi" ADD CONSTRAINT "distribusi_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribusi" ADD CONSTRAINT "distribusi_dapurId_fkey" FOREIGN KEY ("dapurId") REFERENCES "dapur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribusi" ADD CONSTRAINT "distribusi_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribusi" ADD CONSTRAINT "distribusi_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
