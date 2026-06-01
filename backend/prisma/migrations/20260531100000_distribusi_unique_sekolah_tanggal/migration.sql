-- B4: cegah dua dapur membuat distribusi ganda untuk (sekolah, tanggal) yang sama.
--
-- Jika migrasi ini gagal dengan "could not create unique index ... duplicate key value",
-- artinya DB-mu sudah punya duplikat. Bersihkan dulu, contoh:
--
--   -- Lihat duplikat:
--   SELECT "sekolahId", "tanggal", COUNT(*)
--   FROM "distribusi"
--   GROUP BY "sekolahId", "tanggal"
--   HAVING COUNT(*) > 1;
--
--   -- Sisakan satu (yang terbaru) per (sekolah, tanggal):
--   DELETE FROM "distribusi" a
--   USING "distribusi" b
--   WHERE a."sekolahId" = b."sekolahId"
--     AND a."tanggal" = b."tanggal"
--     AND a."createdAt" < b."createdAt";

CREATE UNIQUE INDEX "distribusi_sekolahId_tanggal_key"
  ON "distribusi"("sekolahId", "tanggal");
