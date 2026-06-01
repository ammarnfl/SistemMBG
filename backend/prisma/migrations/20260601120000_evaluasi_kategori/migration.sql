-- AlterTable: add kategori column for topic categorization (F.14)
ALTER TABLE "evaluasi_harian" ADD COLUMN "kategori" TEXT[] NOT NULL DEFAULT '{}';
