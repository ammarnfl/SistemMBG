-- CreateTable
CREATE TABLE "dapur" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dapur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sekolah" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "dapurId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sekolah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "sekolahId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guru_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sekolahId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guru_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penerima_manfaat_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sekolahId" TEXT,
    "kelasId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penerima_manfaat_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guru_profiles_userId_key" ON "guru_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "penerima_manfaat_profiles_userId_key" ON "penerima_manfaat_profiles"("userId");

-- AddForeignKey
ALTER TABLE "sekolah" ADD CONSTRAINT "sekolah_dapurId_fkey" FOREIGN KEY ("dapurId") REFERENCES "dapur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru_profiles" ADD CONSTRAINT "guru_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru_profiles" ADD CONSTRAINT "guru_profiles_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penerima_manfaat_profiles" ADD CONSTRAINT "penerima_manfaat_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penerima_manfaat_profiles" ADD CONSTRAINT "penerima_manfaat_profiles_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penerima_manfaat_profiles" ADD CONSTRAINT "penerima_manfaat_profiles_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
