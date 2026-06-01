-- F.10: channel observasi/komentar guru independen tentang makanan harian.
-- CreateTable
CREATE TABLE "observasi_guru" (
    "id" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "sekolahId" TEXT NOT NULL,
    "distribusiId" TEXT,
    "tanggal" DATE NOT NULL,
    "isi" TEXT NOT NULL,
    "kategori" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "observasi_guru_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "observasi_guru_sekolahId_tanggal_idx" ON "observasi_guru"("sekolahId", "tanggal");

-- CreateIndex
CREATE INDEX "observasi_guru_guruId_idx" ON "observasi_guru"("guruId");

-- AddForeignKey
ALTER TABLE "observasi_guru" ADD CONSTRAINT "observasi_guru_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observasi_guru" ADD CONSTRAINT "observasi_guru_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observasi_guru" ADD CONSTRAINT "observasi_guru_distribusiId_fkey" FOREIGN KEY ("distribusiId") REFERENCES "distribusi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
