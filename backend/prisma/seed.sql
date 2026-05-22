-- ════════════════════════════════════════════════════════════════════════════
--  SEED DATA (PostgreSQL)  — Sistem Evaluasi Layanan MBG
-- ════════════════════════════════════════════════════════════════════════════
--  Padanan dari prisma/seed.ts. Dijalankan dengan:
--      psql "$DATABASE_URL" -f prisma/seed.sql
--
--  CATATAN PENTING tentang cakupan:
--   - seed.ts adalah generator PENUH & otoritatif (showcase 20 siswa × 7 hari,
--     dst). File .sql ini mereproduksi SKENARIO yang sama dengan UUID EKSPLISIT
--     pada skala REPRESENTATIF agar tetap portabel & dapat ditinjau:
--       • seluruh master data lengkap: 10 dapur, 6 sekolah, mapping, akun,
--         menu/komponen, kelas yang dipakai;
--       • seluruh 20 akun siswa kelas showcase XII IPA 1;
--       • irisan operasional yang mencakup SEMUA skenario wajib: rating positif/
--         netral/negatif, pemicu validasi (rating≤2 / komponen≤2 / tidak
--         mengonsumsi), foto validasi (≥2), distribusi pending (3), dan satu
--         feedback negatif yang sudah di-resolve.
--   - id memakai UUID v4 EKSPLISIT (bukan gen_random_uuid()) agar deterministik.
--   - Tanggal memakai aritmetika CURRENT_DATE (window 7 hari ke belakang, WIB).
--   - enum di-cast eksplisit ke tipe Prisma: "Role"/"StatusDistribusi"/
--     "StatusKonsumsi"/"SentimenLabel".
--
--  Hash bcrypt:
--    admin (Password123!) : $2b$10$2uzmLk9lZNjQvfKLiD5IMO4onlZYOXsqIGJfs.jQQBDfoZcE4yBoG
--    lainnya (mbg12345)   : $2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. RESET (urutan aman, KECUALI akun admin) ──────────────────────────────
DELETE FROM penilaian_komponen;
DELETE FROM evaluasi_harian;
DELETE FROM distribusi;
DELETE FROM menu_harian;
DELETE FROM menu_komponen;
DELETE FROM menu_master;
DELETE FROM komponen_master;
DELETE FROM penerima_manfaat_profiles;
DELETE FROM guru_profiles;
DELETE FROM tim_dapur_profiles;
DELETE FROM kelas;
DELETE FROM sekolah;
DELETE FROM dapur;

DELETE FROM users WHERE role <> 'ADMIN';
-- Pertahankan admin: jika admin lama beremail lain, ganti ke admin@gmail.com.
UPDATE users SET email = 'admin@gmail.com', "updatedAt" = now()
 WHERE role = 'ADMIN' AND email <> 'admin@gmail.com'
   AND NOT EXISTS (SELECT 1 FROM users u2 WHERE u2.email = 'admin@gmail.com');
DELETE FROM users WHERE role = 'ADMIN' AND email <> 'admin@gmail.com';

-- ── 2. ADMIN (upsert) ───────────────────────────────────────────────────────
INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'admin@gmail.com',
  '$2b$10$2uzmLk9lZNjQvfKLiD5IMO4onlZYOXsqIGJfs.jQQBDfoZcE4yBoG',
  'Administrator MBG', 'ADMIN'::"Role", true, now(), now()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password, name = EXCLUDED.name,
  role = 'ADMIN'::"Role", "isActive" = true, "updatedAt" = now();

-- ════════════════════════════════════════════════════════════════════════════
--  3. DAPUR (10) + Tim Dapur (user + profile)
-- ════════════════════════════════════════════════════════════════════════════
INSERT INTO dapur (id, nama, alamat, provinsi, "kabupatenKota", kecamatan, "createdAt", "updatedAt") VALUES
 ('da000000-0000-4000-8000-000000000001','SPPG Lebak Siliwangi','Jl. Sumur Bandung No.6, Lebak Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat','Jawa Barat','Kota Bandung','Coblong',now(),now()),
 ('da000000-0000-4000-8000-000000000002','SPPG Lebak Gede','Jl. Dipatiukur No. 93A, Lebak Gede, Kecamatan Coblong, Kota Bandung, Jawa Barat','Jawa Barat','Kota Bandung','Coblong',now(),now()),
 ('da000000-0000-4000-8000-000000000003','SPPG Dago','Jl. Ir H. Juanda No. 438 A, Kel. Dago, Kec. Coblong, Kota Bandung, Jawa Barat','Jawa Barat','Kota Bandung','Coblong',now(),now()),
 ('da000000-0000-4000-8000-000000000004','SPPG Andir Garuda','Jl. Rajawali III No. 7 RT 03 RW 02, Garuda, Kecamatan Andir, Kota Bandung, Jawa Barat','Jawa Barat','Kota Bandung','Andir',now(),now()),
 ('da000000-0000-4000-8000-000000000005','SPPG Arcamanik Sukamiskin','Jl. Cisaranten Kulon No. 91, Sukamiskin, Kec. Arcamanik, Kota Bandung, Jawa Barat','Jawa Barat','Kota Bandung','Arcamanik',now(),now()),
 ('da000000-0000-4000-8000-000000000006','SPPG Sukajadi Cipedes','Jl. Lembah Sukaresmi III No 22 RT 02 RW 10, Kel. Cipedes, Kecamatan Sukajadi, Kota Bandung, Jawa Barat','Jawa Barat','Kota Bandung','Sukajadi',now(),now()),
 ('da000000-0000-4000-8000-000000000007','SPPG Lebak Gede 2','Jl. Dipati Ukur No.5, Lebakgede, Kecamatan Coblong, Kota Bandung, Jawa Barat','Jawa Barat','Kota Bandung','Coblong',now(),now()),
 ('da000000-0000-4000-8000-000000000008','SPPG Pesanggrahan Petukangan Utara 1','Jl. Kostrad Pusri Raya A7 RT.08 RW.08, Petukangan Utara, Kec. Pesanggrahan, Kota Adm. Jakarta Selatan, DKI Jakarta','DKI Jakarta','Kota Adm. Jakarta Selatan','Pesanggrahan',now(),now()),
 ('da000000-0000-4000-8000-000000000009','SPPG Kebayoran Lama Grogol Utara','Jl. Kemandoran VII No.1, RT.5/RW.3, Grogol Utara, Kec. Kebayoran Lama, Kota Adm. Jakarta Selatan, DKI Jakarta','DKI Jakarta','Kota Adm. Jakarta Selatan','Kebayoran Lama',now(),now()),
 ('da000000-0000-4000-8000-00000000000a','SPPG Tanah Abang Petamburan','Jl. K.S. Tubun No 15-17, RT 002/RW 001, Petamburan, Tanah Abang, Jakarta Pusat, DKI Jakarta','DKI Jakarta','Kota Adm. Jakarta Pusat','Tanah Abang',now(),now())
ON CONFLICT (nama) DO UPDATE SET
  alamat = EXCLUDED.alamat, provinsi = EXCLUDED.provinsi,
  "kabupatenKota" = EXCLUDED."kabupatenKota", kecamatan = EXCLUDED.kecamatan, "updatedAt" = now();

INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt") VALUES
 ('7c000000-0000-4000-8000-000000000001','lebaksiliwangi.dapur@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Asep Mulyana','TIM_DAPUR'::"Role",true,now(),now()),
 ('7c000000-0000-4000-8000-000000000002','lebakgede.dapur@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Yuni Hartati','TIM_DAPUR'::"Role",true,now(),now()),
 ('7c000000-0000-4000-8000-000000000003','dago.dapur@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Dedi Supriadi','TIM_DAPUR'::"Role",true,now(),now()),
 ('7c000000-0000-4000-8000-000000000004','andirgaruda.dapur@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Ratna Komala','TIM_DAPUR'::"Role",true,now(),now()),
 ('7c000000-0000-4000-8000-000000000005','arcamanik.dapur@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Hendi Rustandi','TIM_DAPUR'::"Role",true,now(),now()),
 ('7c000000-0000-4000-8000-000000000006','sukajadi.dapur@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Lilis Maryani','TIM_DAPUR'::"Role",true,now(),now()),
 ('7c000000-0000-4000-8000-000000000007','lebakgede2.dapur@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Rudi Hermawan','TIM_DAPUR'::"Role",true,now(),now()),
 ('7c000000-0000-4000-8000-000000000008','pesanggrahan.dapur@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Sari Wahyuni','TIM_DAPUR'::"Role",true,now(),now()),
 ('7c000000-0000-4000-8000-000000000009','kebayoranlama.dapur@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Joko Susilo','TIM_DAPUR'::"Role",true,now(),now()),
 ('7c000000-0000-4000-8000-00000000000a','tanahabang.dapur@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Endang Sukaesih','TIM_DAPUR'::"Role",true,now(),now())
ON CONFLICT (email) DO UPDATE SET password=EXCLUDED.password, name=EXCLUDED.name, role=EXCLUDED.role, "isActive"=true, "updatedAt"=now();

INSERT INTO tim_dapur_profiles (id, "userId", "dapurId", "createdAt", "updatedAt") VALUES
 ('7d000000-0000-4000-8000-000000000001','7c000000-0000-4000-8000-000000000001','da000000-0000-4000-8000-000000000001',now(),now()),
 ('7d000000-0000-4000-8000-000000000002','7c000000-0000-4000-8000-000000000002','da000000-0000-4000-8000-000000000002',now(),now()),
 ('7d000000-0000-4000-8000-000000000003','7c000000-0000-4000-8000-000000000003','da000000-0000-4000-8000-000000000003',now(),now()),
 ('7d000000-0000-4000-8000-000000000004','7c000000-0000-4000-8000-000000000004','da000000-0000-4000-8000-000000000004',now(),now()),
 ('7d000000-0000-4000-8000-000000000005','7c000000-0000-4000-8000-000000000005','da000000-0000-4000-8000-000000000005',now(),now()),
 ('7d000000-0000-4000-8000-000000000006','7c000000-0000-4000-8000-000000000006','da000000-0000-4000-8000-000000000006',now(),now()),
 ('7d000000-0000-4000-8000-000000000007','7c000000-0000-4000-8000-000000000007','da000000-0000-4000-8000-000000000007',now(),now()),
 ('7d000000-0000-4000-8000-000000000008','7c000000-0000-4000-8000-000000000008','da000000-0000-4000-8000-000000000008',now(),now()),
 ('7d000000-0000-4000-8000-000000000009','7c000000-0000-4000-8000-000000000009','da000000-0000-4000-8000-000000000009',now(),now()),
 ('7d000000-0000-4000-8000-00000000000a','7c000000-0000-4000-8000-00000000000a','da000000-0000-4000-8000-00000000000a',now(),now())
ON CONFLICT (id) DO UPDATE SET "dapurId"=EXCLUDED."dapurId", "updatedAt"=now();

-- ════════════════════════════════════════════════════════════════════════════
--  4. SEKOLAH (6) + mapping (dapurId) + Guru (user + profile)
-- ════════════════════════════════════════════════════════════════════════════
INSERT INTO sekolah (id, nama, alamat, provinsi, "kabupatenKota", kecamatan, "dapurId", "createdAt", "updatedAt") VALUES
 ('5c000000-0000-4000-8000-000000000001','SMA Negeri 1 Bandung','Jl. Ir. H. Djuanda No. 93, Lebak Siliwangi, Coblong, Kota Bandung, Jawa Barat','Jawa Barat','Kota Bandung','Coblong','da000000-0000-4000-8000-000000000002',now(),now()),
 ('5c000000-0000-4000-8000-000000000002','SMA Negeri 2 Bandung','Jl. Cihampelas No. 173, Cipaganti, Coblong, Kota Bandung, Jawa Barat','Jawa Barat','Kota Bandung','Coblong','da000000-0000-4000-8000-000000000001',now(),now()),
 ('5c000000-0000-4000-8000-000000000003','SMA Negeri 3 Bandung','Jl. Belitung No. 8, Merdeka, Sumur Bandung, Kota Bandung, Jawa Barat','Jawa Barat','Kota Bandung','Sumur Bandung','da000000-0000-4000-8000-000000000001',now(),now()),
 ('5c000000-0000-4000-8000-000000000004','SMA Negeri 5 Bandung','Jl. Belitung No. 9, Merdeka, Sumur Bandung, Kota Bandung, Jawa Barat','Jawa Barat','Kota Bandung','Sumur Bandung','da000000-0000-4000-8000-000000000003',now(),now()),
 ('5c000000-0000-4000-8000-000000000005','SMA Negeri 6 Bandung','Jl. Pasirkaliki No. 51, Arjuna, Cicendo, Kota Bandung, Jawa Barat','Jawa Barat','Kota Bandung','Cicendo','da000000-0000-4000-8000-000000000003',now(),now()),
 ('5c000000-0000-4000-8000-000000000006','SMA Negeri 19 Bandung','Jl. Dago Pojok, Dago, Coblong, Kota Bandung, Jawa Barat','Jawa Barat','Kota Bandung','Coblong','da000000-0000-4000-8000-000000000002',now(),now())
ON CONFLICT (nama) DO UPDATE SET
  alamat=EXCLUDED.alamat, provinsi=EXCLUDED.provinsi, "kabupatenKota"=EXCLUDED."kabupatenKota",
  kecamatan=EXCLUDED.kecamatan, "dapurId"=EXCLUDED."dapurId", "updatedAt"=now();

INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt") VALUES
 ('61000000-0000-4000-8000-000000000001','sman1bandung.guru@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Ibu Dra. Hj. Siti Aminah, M.Pd.','GURU'::"Role",true,now(),now()),
 ('61000000-0000-4000-8000-000000000002','sman2bandung.guru@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Bapak Drs. Endang Suherman','GURU'::"Role",true,now(),now()),
 ('61000000-0000-4000-8000-000000000003','sman3bandung.guru@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Ibu Tati Suryani, S.Pd.','GURU'::"Role",true,now(),now()),
 ('61000000-0000-4000-8000-000000000004','sman5bandung.guru@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Bapak Agus Setiawan, S.Pd.','GURU'::"Role",true,now(),now()),
 ('61000000-0000-4000-8000-000000000005','sman6bandung.guru@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Ibu Nining Kurnia, M.Pd.','GURU'::"Role",true,now(),now()),
 ('61000000-0000-4000-8000-000000000006','sman19bandung.guru@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Bapak Dudi Supriatna, S.Pd.','GURU'::"Role",true,now(),now())
ON CONFLICT (email) DO UPDATE SET password=EXCLUDED.password, name=EXCLUDED.name, role=EXCLUDED.role, "isActive"=true, "updatedAt"=now();

INSERT INTO guru_profiles (id, "userId", "sekolahId", "createdAt", "updatedAt") VALUES
 ('62000000-0000-4000-8000-000000000001','61000000-0000-4000-8000-000000000001','5c000000-0000-4000-8000-000000000001',now(),now()),
 ('62000000-0000-4000-8000-000000000002','61000000-0000-4000-8000-000000000002','5c000000-0000-4000-8000-000000000002',now(),now()),
 ('62000000-0000-4000-8000-000000000003','61000000-0000-4000-8000-000000000003','5c000000-0000-4000-8000-000000000003',now(),now()),
 ('62000000-0000-4000-8000-000000000004','61000000-0000-4000-8000-000000000004','5c000000-0000-4000-8000-000000000004',now(),now()),
 ('62000000-0000-4000-8000-000000000005','61000000-0000-4000-8000-000000000005','5c000000-0000-4000-8000-000000000005',now(),now()),
 ('62000000-0000-4000-8000-000000000006','61000000-0000-4000-8000-000000000006','5c000000-0000-4000-8000-000000000006',now(),now())
ON CONFLICT (id) DO UPDATE SET "sekolahId"=EXCLUDED."sekolahId", "updatedAt"=now();

-- ════════════════════════════════════════════════════════════════════════════
--  5. KELAS (showcase + representatif; seed.ts membuat seluruh kelas reguler)
-- ════════════════════════════════════════════════════════════════════════════
INSERT INTO kelas (id, nama, "sekolahId", "createdAt", "updatedAt") VALUES
 ('c1000000-0000-4000-8000-000000000001','XII IPA 1','5c000000-0000-4000-8000-000000000001',now(),now()), -- showcase
 ('c1000000-0000-4000-8000-000000000002','X IPA 1','5c000000-0000-4000-8000-000000000001',now(),now()),
 ('c1000000-0000-4000-8000-000000000003','XI IPS 1','5c000000-0000-4000-8000-000000000001',now(),now()),
 ('c1000000-0000-4000-8000-000000000004','XII IPA 1','5c000000-0000-4000-8000-000000000006',now(),now()),
 ('c1000000-0000-4000-8000-000000000005','XII IPS 1','5c000000-0000-4000-8000-000000000006',now(),now()),
 ('c1000000-0000-4000-8000-000000000006','XII IPA 1','5c000000-0000-4000-8000-000000000002',now(),now()),
 ('c1000000-0000-4000-8000-000000000007','XII IPA 1','5c000000-0000-4000-8000-000000000003',now(),now()),
 ('c1000000-0000-4000-8000-000000000008','XII IPA 1','5c000000-0000-4000-8000-000000000004',now(),now()),
 ('c1000000-0000-4000-8000-000000000009','XII IPA 1','5c000000-0000-4000-8000-000000000005',now(),now())
ON CONFLICT (id) DO UPDATE SET nama=EXCLUDED.nama, "sekolahId"=EXCLUDED."sekolahId", "updatedAt"=now();

-- ════════════════════════════════════════════════════════════════════════════
--  6. PENERIMA MANFAAT — Showcase XII IPA 1 (20 siswa) + non-showcase (5)
--     idx 1 = PM-A (positif), idx 2 = PM-B (rating rendah), idx 3 = PM-C (tdk konsumsi)
-- ════════════════════════════════════════════════════════════════════════════
INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt") VALUES
 ('5e000000-0000-4000-8000-000000000001','ahmadrizkypratama@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Ahmad Rizky Pratama','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000002','sitinurhaliza@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Siti Nurhaliza','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000003','bagussetiawan@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Bagus Setiawan','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000004','dewilestari@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Dewi Lestari','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000005','ranggasaputra@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Rangga Saputra','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000006','putrimaharani@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Putri Maharani','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000007','yogapermana@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Yoga Permana','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000008','nadiasalsabila@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Nadia Salsabila','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000009','fajarnugroho@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Fajar Nugroho','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-00000000000a','intanpermata@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Intan Permata','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-00000000000b','dimasaditya@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Dimas Aditya','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-00000000000c','rinawulandari@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Rina Wulandari','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-00000000000d','adikurniawan@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Adi Kurniawan','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-00000000000e','megautami@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Mega Utami','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-00000000000f','galihramadhan@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Galih Ramadhan','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000010','tikaanggraini@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Tika Anggraini','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000011','rezafauzi@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Reza Fauzi','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000012','liaanjani@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Lia Anjani','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000013','bayusaputra@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Bayu Saputra','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000014','wulansari@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Wulan Sari','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 -- non-showcase
 ('5e000000-0000-4000-8000-000000000015','hendragunawan@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Hendra Gunawan','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000016','anisarahmawati@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Anisa Rahmawati','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000017','andikapranata@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Andika Pranata','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000018','citrakirana@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Citra Kirana','PENERIMA_MANFAAT'::"Role",true,now(),now()),
 ('5e000000-0000-4000-8000-000000000019','arifbudiman@gmail.com','$2b$10$oNi.yOJTw.WtKDGK7IeFsOuo7Sultokl1b8HL.KWxoj.1mMFzcHpi','Arif Budiman','PENERIMA_MANFAAT'::"Role",true,now(),now())
ON CONFLICT (email) DO UPDATE SET password=EXCLUDED.password, name=EXCLUDED.name, role=EXCLUDED.role, "isActive"=true, "updatedAt"=now();

INSERT INTO penerima_manfaat_profiles (id, "userId", nisn, "sekolahId", "kelasId", "createdAt", "updatedAt") VALUES
 ('5f000000-0000-4000-8000-000000000001','5e000000-0000-4000-8000-000000000001','0087230001','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-000000000002','5e000000-0000-4000-8000-000000000002','0087230002','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-000000000003','5e000000-0000-4000-8000-000000000003','0087230003','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-000000000004','5e000000-0000-4000-8000-000000000004','0087230004','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-000000000005','5e000000-0000-4000-8000-000000000005','0087230005','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-000000000006','5e000000-0000-4000-8000-000000000006','0087230006','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-000000000007','5e000000-0000-4000-8000-000000000007','0087230007','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-000000000008','5e000000-0000-4000-8000-000000000008','0087230008','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-000000000009','5e000000-0000-4000-8000-000000000009','0087230009','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-00000000000a','5e000000-0000-4000-8000-00000000000a','0087230010','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-00000000000b','5e000000-0000-4000-8000-00000000000b','0087230011','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-00000000000c','5e000000-0000-4000-8000-00000000000c','0087230012','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-00000000000d','5e000000-0000-4000-8000-00000000000d','0087230013','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-00000000000e','5e000000-0000-4000-8000-00000000000e','0087230014','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-00000000000f','5e000000-0000-4000-8000-00000000000f','0087230015','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-000000000010','5e000000-0000-4000-8000-000000000010','0087230016','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-000000000011','5e000000-0000-4000-8000-000000000011','0087230017','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-000000000012','5e000000-0000-4000-8000-000000000012','0087230018','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-000000000013','5e000000-0000-4000-8000-000000000013','0087230019','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 ('5f000000-0000-4000-8000-000000000014','5e000000-0000-4000-8000-000000000014','0087230020','5c000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',now(),now()),
 -- non-showcase: SMA 19 (2), SMA 2 (2), SMA 5 (1)
 ('5f000000-0000-4000-8000-000000000015','5e000000-0000-4000-8000-000000000015','0087230021','5c000000-0000-4000-8000-000000000006','c1000000-0000-4000-8000-000000000004',now(),now()),
 ('5f000000-0000-4000-8000-000000000016','5e000000-0000-4000-8000-000000000016','0087230022','5c000000-0000-4000-8000-000000000006','c1000000-0000-4000-8000-000000000004',now(),now()),
 ('5f000000-0000-4000-8000-000000000017','5e000000-0000-4000-8000-000000000017','0087230023','5c000000-0000-4000-8000-000000000002','c1000000-0000-4000-8000-000000000006',now(),now()),
 ('5f000000-0000-4000-8000-000000000018','5e000000-0000-4000-8000-000000000018','0087230024','5c000000-0000-4000-8000-000000000002','c1000000-0000-4000-8000-000000000006',now(),now()),
 ('5f000000-0000-4000-8000-000000000019','5e000000-0000-4000-8000-000000000019','0087230025','5c000000-0000-4000-8000-000000000004','c1000000-0000-4000-8000-000000000008',now(),now())
ON CONFLICT (id) DO UPDATE SET nisn=EXCLUDED.nisn, "sekolahId"=EXCLUDED."sekolahId", "kelasId"=EXCLUDED."kelasId", "updatedAt"=now();

-- ════════════════════════════════════════════════════════════════════════════
--  7. KOMPONEN MASTER + MENU + MENU KOMPONEN (Lebak Gede, Lebak Siliwangi, Dago)
-- ════════════════════════════════════════════════════════════════════════════
INSERT INTO komponen_master (id, "dapurId", nama, "createdAt", "updatedAt") VALUES
 -- Lebak Gede (showcase)
 ('c0000000-0000-4000-8000-000000000001','da000000-0000-4000-8000-000000000002','Nasi Putih',now(),now()),
 ('c0000000-0000-4000-8000-000000000002','da000000-0000-4000-8000-000000000002','Ayam Goreng',now(),now()),
 ('c0000000-0000-4000-8000-000000000003','da000000-0000-4000-8000-000000000002','Lalapan & Sambal',now(),now()),
 ('c0000000-0000-4000-8000-000000000004','da000000-0000-4000-8000-000000000002','Susu UHT Coklat',now(),now()),
 ('c0000000-0000-4000-8000-000000000005','da000000-0000-4000-8000-000000000002','Ikan Bakar Kecap',now(),now()),
 ('c0000000-0000-4000-8000-000000000006','da000000-0000-4000-8000-000000000002','Cah Kangkung',now(),now()),
 ('c0000000-0000-4000-8000-000000000007','da000000-0000-4000-8000-000000000002','Buah Pisang',now(),now()),
 ('c0000000-0000-4000-8000-000000000008','da000000-0000-4000-8000-000000000002','Telur Balado',now(),now()),
 ('c0000000-0000-4000-8000-000000000009','da000000-0000-4000-8000-000000000002','Tumis Buncis Wortel',now(),now()),
 ('c0000000-0000-4000-8000-00000000000a','da000000-0000-4000-8000-000000000002','Air Mineral',now(),now()),
 ('c0000000-0000-4000-8000-00000000000b','da000000-0000-4000-8000-000000000002','Soto Ayam',now(),now()),
 ('c0000000-0000-4000-8000-00000000000c','da000000-0000-4000-8000-000000000002','Tempe Goreng',now(),now()),
 ('c0000000-0000-4000-8000-00000000000d','da000000-0000-4000-8000-000000000002','Buah Jeruk',now(),now()),
 -- Lebak Siliwangi
 ('c0000000-0000-4000-8000-000000000020','da000000-0000-4000-8000-000000000001','Nasi Putih',now(),now()),
 ('c0000000-0000-4000-8000-000000000021','da000000-0000-4000-8000-000000000001','Ayam Teriyaki',now(),now()),
 ('c0000000-0000-4000-8000-000000000022','da000000-0000-4000-8000-000000000001','Cah Brokoli Wortel',now(),now()),
 ('c0000000-0000-4000-8000-000000000023','da000000-0000-4000-8000-000000000001','Rendang Daging',now(),now()),
 ('c0000000-0000-4000-8000-000000000024','da000000-0000-4000-8000-000000000001','Sayur Nangka',now(),now()),
 -- Dago
 ('c0000000-0000-4000-8000-000000000030','da000000-0000-4000-8000-000000000003','Nasi Putih',now(),now()),
 ('c0000000-0000-4000-8000-000000000031','da000000-0000-4000-8000-000000000003','Capcay Sayur',now(),now()),
 ('c0000000-0000-4000-8000-000000000032','da000000-0000-4000-8000-000000000003','Bakso Sapi',now(),now()),
 ('c0000000-0000-4000-8000-000000000033','da000000-0000-4000-8000-000000000003','Pepes Ikan',now(),now()),
 ('c0000000-0000-4000-8000-000000000034','da000000-0000-4000-8000-000000000003','Lalapan',now(),now())
ON CONFLICT ("dapurId", nama) DO UPDATE SET "updatedAt"=now();

INSERT INTO menu_master (id, nama, deskripsi, "energiKkal", "proteinGram", "lemakGram", "karbohidratGram", "seratGram", "dapurId", "createdAt", "updatedAt") VALUES
 ('33000000-0000-4000-8000-000000000001','Nasi Ayam Goreng Lalapan','Nasi putih, ayam goreng, lalapan & sambal, dan susu UHT coklat.',520,29,16,66,5,'da000000-0000-4000-8000-000000000002',now(),now()),
 ('33000000-0000-4000-8000-000000000002','Nasi Ikan Bakar Kecap','Nasi putih, ikan bakar kecap, cah kangkung, dan buah pisang.',470,31,11,60,6,'da000000-0000-4000-8000-000000000002',now(),now()),
 ('33000000-0000-4000-8000-000000000003','Nasi Telur Balado','Nasi putih, telur balado, tumis buncis wortel, dan air mineral.',450,22,14,62,5,'da000000-0000-4000-8000-000000000002',now(),now()),
 ('33000000-0000-4000-8000-000000000004','Soto Ayam Komplit','Nasi putih, soto ayam, tempe goreng, dan buah jeruk.',480,26,13,64,6,'da000000-0000-4000-8000-000000000002',now(),now()),
 ('33000000-0000-4000-8000-000000000005','Nasi Ayam Teriyaki','Nasi putih, ayam teriyaki, dan cah brokoli wortel.',490,28,13,64,4,'da000000-0000-4000-8000-000000000001',now(),now()),
 ('33000000-0000-4000-8000-000000000006','Nasi Rendang Daging','Nasi putih, rendang daging, dan sayur nangka.',540,30,20,60,5,'da000000-0000-4000-8000-000000000001',now(),now()),
 ('33000000-0000-4000-8000-000000000007','Nasi Capcay Bakso','Nasi putih, capcay sayur, dan bakso sapi.',460,24,12,62,6,'da000000-0000-4000-8000-000000000003',now(),now()),
 ('33000000-0000-4000-8000-000000000008','Nasi Pepes Ikan','Nasi putih, pepes ikan, dan lalapan.',440,27,10,58,5,'da000000-0000-4000-8000-000000000003',now(),now())
ON CONFLICT (id) DO UPDATE SET nama=EXCLUDED.nama, "updatedAt"=now();

INSERT INTO menu_komponen (id, "menuId", "komponenMasterId", "namaSnapshot", "createdAt", "updatedAt") VALUES
 -- Menu m0 (Ayam Goreng Lalapan)
 ('34000000-0000-4000-8000-000000000001','33000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001','Nasi Putih',now(),now()),
 ('34000000-0000-4000-8000-000000000002','33000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000002','Ayam Goreng',now(),now()),
 ('34000000-0000-4000-8000-000000000003','33000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000003','Lalapan & Sambal',now(),now()),
 ('34000000-0000-4000-8000-000000000004','33000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000004','Susu UHT Coklat',now(),now()),
 -- Menu m1 (Ikan Bakar Kecap)
 ('34000000-0000-4000-8000-000000000005','33000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000001','Nasi Putih',now(),now()),
 ('34000000-0000-4000-8000-000000000006','33000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000005','Ikan Bakar Kecap',now(),now()),
 ('34000000-0000-4000-8000-000000000007','33000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000006','Cah Kangkung',now(),now()),
 ('34000000-0000-4000-8000-000000000008','33000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000007','Buah Pisang',now(),now()),
 -- Menu m2 (Telur Balado)
 ('34000000-0000-4000-8000-000000000009','33000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-000000000001','Nasi Putih',now(),now()),
 ('34000000-0000-4000-8000-00000000000a','33000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-000000000008','Telur Balado',now(),now()),
 ('34000000-0000-4000-8000-00000000000b','33000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-000000000009','Tumis Buncis Wortel',now(),now()),
 ('34000000-0000-4000-8000-00000000000c','33000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-00000000000a','Air Mineral',now(),now()),
 -- Menu m3 (Soto Ayam)
 ('34000000-0000-4000-8000-00000000000d','33000000-0000-4000-8000-000000000004','c0000000-0000-4000-8000-000000000001','Nasi Putih',now(),now()),
 ('34000000-0000-4000-8000-00000000000e','33000000-0000-4000-8000-000000000004','c0000000-0000-4000-8000-00000000000b','Soto Ayam',now(),now()),
 ('34000000-0000-4000-8000-00000000000f','33000000-0000-4000-8000-000000000004','c0000000-0000-4000-8000-00000000000c','Tempe Goreng',now(),now()),
 ('34000000-0000-4000-8000-000000000010','33000000-0000-4000-8000-000000000004','c0000000-0000-4000-8000-00000000000d','Buah Jeruk',now(),now()),
 -- Siliwangi m (Ayam Teriyaki)
 ('34000000-0000-4000-8000-000000000011','33000000-0000-4000-8000-000000000005','c0000000-0000-4000-8000-000000000020','Nasi Putih',now(),now()),
 ('34000000-0000-4000-8000-000000000012','33000000-0000-4000-8000-000000000005','c0000000-0000-4000-8000-000000000021','Ayam Teriyaki',now(),now()),
 ('34000000-0000-4000-8000-000000000013','33000000-0000-4000-8000-000000000005','c0000000-0000-4000-8000-000000000022','Cah Brokoli Wortel',now(),now()),
 -- Siliwangi m (Rendang)
 ('34000000-0000-4000-8000-000000000014','33000000-0000-4000-8000-000000000006','c0000000-0000-4000-8000-000000000020','Nasi Putih',now(),now()),
 ('34000000-0000-4000-8000-000000000015','33000000-0000-4000-8000-000000000006','c0000000-0000-4000-8000-000000000023','Rendang Daging',now(),now()),
 ('34000000-0000-4000-8000-000000000016','33000000-0000-4000-8000-000000000006','c0000000-0000-4000-8000-000000000024','Sayur Nangka',now(),now()),
 -- Dago m (Capcay Bakso)
 ('34000000-0000-4000-8000-000000000017','33000000-0000-4000-8000-000000000007','c0000000-0000-4000-8000-000000000030','Nasi Putih',now(),now()),
 ('34000000-0000-4000-8000-000000000018','33000000-0000-4000-8000-000000000007','c0000000-0000-4000-8000-000000000031','Capcay Sayur',now(),now()),
 ('34000000-0000-4000-8000-000000000019','33000000-0000-4000-8000-000000000007','c0000000-0000-4000-8000-000000000032','Bakso Sapi',now(),now()),
 -- Dago m (Pepes Ikan)
 ('34000000-0000-4000-8000-00000000001a','33000000-0000-4000-8000-000000000008','c0000000-0000-4000-8000-000000000030','Nasi Putih',now(),now()),
 ('34000000-0000-4000-8000-00000000001b','33000000-0000-4000-8000-000000000008','c0000000-0000-4000-8000-000000000033','Pepes Ikan',now(),now()),
 ('34000000-0000-4000-8000-00000000001c','33000000-0000-4000-8000-000000000008','c0000000-0000-4000-8000-000000000034','Lalapan',now(),now())
ON CONFLICT (id) DO UPDATE SET "namaSnapshot"=EXCLUDED."namaSnapshot", "updatedAt"=now();

-- ── MENU HARIAN showcase (7 hari, rotasi m0,m1,m2,m3,m0,m1,m2) ───────────────
INSERT INTO menu_harian (id, tanggal, "menuId", "createdAt", "updatedAt") VALUES
 ('31000000-0000-4000-8000-000000000001', CURRENT_DATE - 6, '33000000-0000-4000-8000-000000000001', now(), now()),
 ('31000000-0000-4000-8000-000000000002', CURRENT_DATE - 5, '33000000-0000-4000-8000-000000000002', now(), now()),
 ('31000000-0000-4000-8000-000000000003', CURRENT_DATE - 4, '33000000-0000-4000-8000-000000000003', now(), now()),
 ('31000000-0000-4000-8000-000000000004', CURRENT_DATE - 3, '33000000-0000-4000-8000-000000000004', now(), now()),
 ('31000000-0000-4000-8000-000000000005', CURRENT_DATE - 2, '33000000-0000-4000-8000-000000000001', now(), now()),
 ('31000000-0000-4000-8000-000000000006', CURRENT_DATE - 1, '33000000-0000-4000-8000-000000000002', now(), now()),
 ('31000000-0000-4000-8000-000000000007', CURRENT_DATE - 0, '33000000-0000-4000-8000-000000000003', now(), now())
ON CONFLICT (tanggal, "menuId") DO UPDATE SET "updatedAt"=now();

-- ════════════════════════════════════════════════════════════════════════════
--  8. DISTRIBUSI
-- ════════════════════════════════════════════════════════════════════════════
INSERT INTO distribusi (id, tanggal, "sekolahId", "dapurId", "jumlahPorsi", status, "catatanDapur", "catatanGuru", "createdById", "confirmedById", "menuId", "createdAt", "updatedAt") VALUES
 -- SHOWCASE: Lebak Gede → SMA 1 (7 hari; hari ini DITERIMA, lainnya SELESAI)
 ('d1000000-0000-4000-8000-000000000001', CURRENT_DATE - 6, '5c000000-0000-4000-8000-000000000001','da000000-0000-4000-8000-000000000002',20,'SELESAI'::"StatusDistribusi",'Dikirim lengkap dan tepat waktu.','Makanan diterima dalam kondisi baik.','7c000000-0000-4000-8000-000000000002','61000000-0000-4000-8000-000000000001','33000000-0000-4000-8000-000000000001',now(),now()),
 ('d1000000-0000-4000-8000-000000000002', CURRENT_DATE - 5, '5c000000-0000-4000-8000-000000000001','da000000-0000-4000-8000-000000000002',20,'SELESAI'::"StatusDistribusi",'Dikirim lengkap dan tepat waktu.','Makanan diterima dalam kondisi baik.','7c000000-0000-4000-8000-000000000002','61000000-0000-4000-8000-000000000001','33000000-0000-4000-8000-000000000002',now(),now()),
 ('d1000000-0000-4000-8000-000000000003', CURRENT_DATE - 4, '5c000000-0000-4000-8000-000000000001','da000000-0000-4000-8000-000000000002',20,'SELESAI'::"StatusDistribusi",'Dikirim lengkap dan tepat waktu.','Makanan diterima dalam kondisi baik.','7c000000-0000-4000-8000-000000000002','61000000-0000-4000-8000-000000000001','33000000-0000-4000-8000-000000000003',now(),now()),
 ('d1000000-0000-4000-8000-000000000004', CURRENT_DATE - 3, '5c000000-0000-4000-8000-000000000001','da000000-0000-4000-8000-000000000002',20,'SELESAI'::"StatusDistribusi",'Dikirim lengkap dan tepat waktu.','Makanan diterima dalam kondisi baik.','7c000000-0000-4000-8000-000000000002','61000000-0000-4000-8000-000000000001','33000000-0000-4000-8000-000000000004',now(),now()),
 ('d1000000-0000-4000-8000-000000000005', CURRENT_DATE - 2, '5c000000-0000-4000-8000-000000000001','da000000-0000-4000-8000-000000000002',20,'SELESAI'::"StatusDistribusi",'Dikirim lengkap dan tepat waktu.','Makanan diterima dalam kondisi baik.','7c000000-0000-4000-8000-000000000002','61000000-0000-4000-8000-000000000001','33000000-0000-4000-8000-000000000001',now(),now()),
 ('d1000000-0000-4000-8000-000000000006', CURRENT_DATE - 1, '5c000000-0000-4000-8000-000000000001','da000000-0000-4000-8000-000000000002',20,'SELESAI'::"StatusDistribusi",'Dikirim lengkap dan tepat waktu.','Makanan diterima dalam kondisi baik.','7c000000-0000-4000-8000-000000000002','61000000-0000-4000-8000-000000000001','33000000-0000-4000-8000-000000000002',now(),now()),
 ('d1000000-0000-4000-8000-000000000007', CURRENT_DATE - 0, '5c000000-0000-4000-8000-000000000001','da000000-0000-4000-8000-000000000002',20,'DITERIMA'::"StatusDistribusi",'Dikirim lengkap dan tepat waktu.','Makanan diterima dalam kondisi baik.','7c000000-0000-4000-8000-000000000002','61000000-0000-4000-8000-000000000001','33000000-0000-4000-8000-000000000003',now(),now()),
 -- NON-SHOWCASE: Lebak Gede → SMA 19 (1 selesai, 1 pending DIKIRIM)
 ('d1000000-0000-4000-8000-000000000008', CURRENT_DATE - 1, '5c000000-0000-4000-8000-000000000006','da000000-0000-4000-8000-000000000002',60,'SELESAI'::"StatusDistribusi",'Pengiriman rutin.','Diterima, beberapa porsi terlambat.','7c000000-0000-4000-8000-000000000002','61000000-0000-4000-8000-000000000006','33000000-0000-4000-8000-000000000001',now(),now()),
 ('d1000000-0000-4000-8000-000000000009', CURRENT_DATE - 0, '5c000000-0000-4000-8000-000000000006','da000000-0000-4000-8000-000000000002',60,'DIKIRIM'::"StatusDistribusi",'Pengiriman rutin.',NULL,'7c000000-0000-4000-8000-000000000002',NULL,'33000000-0000-4000-8000-000000000002',now(),now()),
 -- NON-SHOWCASE: Lebak Siliwangi → SMA 2 (1 diterima, 1 pending DIKIRIM)
 ('d1000000-0000-4000-8000-00000000000a', CURRENT_DATE - 1, '5c000000-0000-4000-8000-000000000002','da000000-0000-4000-8000-000000000001',10,'DITERIMA'::"StatusDistribusi",'Dikirim sesuai jadwal.','Diterima lengkap.','7c000000-0000-4000-8000-000000000001','61000000-0000-4000-8000-000000000002','33000000-0000-4000-8000-000000000005',now(),now()),
 ('d1000000-0000-4000-8000-00000000000b', CURRENT_DATE - 0, '5c000000-0000-4000-8000-000000000002','da000000-0000-4000-8000-000000000001',10,'DIKIRIM'::"StatusDistribusi",'Dikirim sesuai jadwal.',NULL,'7c000000-0000-4000-8000-000000000001',NULL,'33000000-0000-4000-8000-000000000006',now(),now()),
 -- NON-SHOWCASE: Dago → SMA 5 (1 diterima, 1 pending DRAFT)
 ('d1000000-0000-4000-8000-00000000000c', CURRENT_DATE - 1, '5c000000-0000-4000-8000-000000000004','da000000-0000-4000-8000-000000000003',10,'DITERIMA'::"StatusDistribusi",'Dikirim sesuai jadwal.','Diterima dengan baik.','7c000000-0000-4000-8000-000000000003','61000000-0000-4000-8000-000000000004','33000000-0000-4000-8000-000000000007',now(),now()),
 ('d1000000-0000-4000-8000-00000000000d', CURRENT_DATE - 0, '5c000000-0000-4000-8000-000000000004','da000000-0000-4000-8000-000000000003',10,'DRAFT'::"StatusDistribusi",'Menu hari ini masih disusun.',NULL,'7c000000-0000-4000-8000-000000000003',NULL,'33000000-0000-4000-8000-000000000008',now(),now())
ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, "updatedAt"=now();

-- ════════════════════════════════════════════════════════════════════════════
--  9. EVALUASI HARIAN + PENILAIAN KOMPONEN (irisan representatif)
--     Showcase: PM-A positif, PM-B rating rendah+foto, PM-C tidak konsumsi,
--     + beberapa siswa lain (netral/negatif/positif) → ≥2 NEG, ≥2 NETRAL, foto.
--
--     SENTIMEN (HYBRID):
--       • Baris SHOWCASE → kolom sentimen/sentimenSkor/sentimenLabel/
--         sentimenAnalyzedAt = NULL. Job HuggingFace (SentimenService; filter
--         feedback != NULL AND sentimen IS NULL) yang akan menilainya.
--       • Baris NON-SHOWCASE → sentimen sintetis terisi; sentimenLabel memakai
--         format raw model: 'positive' | 'neutral' | 'negative'.
-- ════════════════════════════════════════════════════════════════════════════
INSERT INTO evaluasi_harian (id, tanggal, "penerimaManfaatId", "distribusiId", "statusKonsumsi", "ratingKeseluruhan", feedback, "fotoUrl", sentimen, "sentimenSkor", "sentimenLabel", "sentimenAnalyzedAt", "feedbackResolved", "feedbackResolution", "feedbackResolvedAt", "feedbackResolvedById", "createdAt", "updatedAt") VALUES
 -- TODAY (menu m2 Telur Balado), distribusi d07
 ('e1000000-0000-4000-8000-000000000001', CURRENT_DATE - 0, '5e000000-0000-4000-8000-000000000001','d1000000-0000-4000-8000-000000000007','KONSUMSI'::"StatusKonsumsi",5,'Enak sih, nasinya pulen lauknya juga mantap. Habis bersih!','https://storage.mbg.go.id/validasi/e1000001.jpg',NULL,NULL,NULL,NULL,false,NULL,NULL,NULL,now(),now()),
 ('e1000000-0000-4000-8000-000000000002', CURRENT_DATE - 0, '5e000000-0000-4000-8000-000000000004','d1000000-0000-4000-8000-000000000007','KONSUMSI'::"StatusKonsumsi",3,'Makanannya lumayan, tapi sayurnya agak kurang bumbu.','https://storage.mbg.go.id/validasi/e1000002.jpg',NULL,NULL,NULL,NULL,false,NULL,NULL,NULL,now(),now()),
 ('e1000000-0000-4000-8000-000000000003', CURRENT_DATE - 0, '5e000000-0000-4000-8000-000000000005','d1000000-0000-4000-8000-000000000007','KONSUMSI'::"StatusKonsumsi",2,'Porsinya dikit dan rasanya hambar, jadi cuma dimakan sedikit.','https://storage.mbg.go.id/validasi/e1000003.jpg',NULL,NULL,NULL,NULL,false,NULL,NULL,NULL,now(),now()),
 ('e1000000-0000-4000-8000-000000000004', CURRENT_DATE - 0, '5e000000-0000-4000-8000-000000000006','d1000000-0000-4000-8000-000000000007','KONSUMSI'::"StatusKonsumsi",5,NULL,NULL,NULL,NULL,NULL,NULL,false,NULL,NULL,NULL,now(),now()),
 ('e1000000-0000-4000-8000-000000000005', CURRENT_DATE - 0, '5e000000-0000-4000-8000-000000000007','d1000000-0000-4000-8000-000000000007','KONSUMSI'::"StatusKonsumsi",4,'Porsinya pas dan bikin kenyang, makasih ya.','https://storage.mbg.go.id/validasi/e1000005.jpg',NULL,NULL,NULL,NULL,false,NULL,NULL,NULL,now(),now()),
 -- PM-C: tidak mengonsumsi (CURRENT_DATE-1, menu m1), distribusi d06
 ('e1000000-0000-4000-8000-000000000006', CURRENT_DATE - 1, '5e000000-0000-4000-8000-000000000003','d1000000-0000-4000-8000-000000000006','TIDAK_KONSUMSI'::"StatusKonsumsi",NULL,'Lagi nggak enak badan jadi nggak sempat makan, maaf.','https://storage.mbg.go.id/validasi/e1000006.jpg',NULL,NULL,NULL,NULL,false,NULL,NULL,NULL,now(),now()),
 -- PM-B: rating rendah (CURRENT_DATE-2, menu m0), distribusi d05
 ('e1000000-0000-4000-8000-000000000007', CURRENT_DATE - 2, '5e000000-0000-4000-8000-000000000002','d1000000-0000-4000-8000-000000000005','KONSUMSI'::"StatusKonsumsi",2,'Lauknya hari ini kurang enak, agak amis jadi susah dimakan.','https://storage.mbg.go.id/validasi/e1000007.jpg',NULL,NULL,NULL,NULL,false,NULL,NULL,NULL,now(),now()),
 -- NON-SHOWCASE: SMA 19 (distribusi d08, menu m0)
 ('e1000000-0000-4000-8000-000000000008', CURRENT_DATE - 1, '5e000000-0000-4000-8000-000000000015','d1000000-0000-4000-8000-000000000008','KONSUMSI'::"StatusKonsumsi",2,'Nasinya keras dan udah dingin pas sampai, jadi nggak habis.','https://storage.mbg.go.id/validasi/e1000008.jpg','NEGATIF'::"SentimenLabel",0.15,'negative',now(),false,NULL,NULL,NULL,now(),now()),
 ('e1000000-0000-4000-8000-000000000009', CURRENT_DATE - 1, '5e000000-0000-4000-8000-000000000016','d1000000-0000-4000-8000-000000000008','KONSUMSI'::"StatusKonsumsi",5,'Suka banget menu hari ini, sampai nambah pengen.','https://storage.mbg.go.id/validasi/e1000009.jpg','POSITIF'::"SentimenLabel",0.90,'positive',now(),false,NULL,NULL,NULL,now(),now()),
 -- NON-SHOWCASE: SMA 2 (distribusi d0a, menu Siliwangi Ayam Teriyaki); 1 negatif di-resolve
 ('e1000000-0000-4000-8000-00000000000a', CURRENT_DATE - 1, '5e000000-0000-4000-8000-000000000017','d1000000-0000-4000-8000-00000000000a','KONSUMSI'::"StatusKonsumsi",4,'Ayam gorengnya gurih, suka banget sama menunya.','https://storage.mbg.go.id/validasi/e100000a.jpg','POSITIF'::"SentimenLabel",0.88,'positive',now(),false,NULL,NULL,NULL,now(),now()),
 ('e1000000-0000-4000-8000-00000000000b', CURRENT_DATE - 1, '5e000000-0000-4000-8000-000000000018','d1000000-0000-4000-8000-00000000000a','KONSUMSI'::"StatusKonsumsi",2,'Sayurnya terlalu matang dan hampir nggak ada rasanya.','https://storage.mbg.go.id/validasi/e100000b.jpg','NEGATIF'::"SentimenLabel",0.13,'negative',now(),true,'Sudah ditindaklanjuti tim dapur, kualitas menu akan diperbaiki.',now(),'61000000-0000-4000-8000-000000000002',now(),now()),
 -- NON-SHOWCASE: SMA 5 (distribusi d0c, menu Dago Capcay)
 ('e1000000-0000-4000-8000-00000000000c', CURRENT_DATE - 1, '5e000000-0000-4000-8000-000000000019','d1000000-0000-4000-8000-00000000000c','KONSUMSI'::"StatusKonsumsi",3,'Standar lah, nggak istimewa tapi cukup mengenyangkan.','https://storage.mbg.go.id/validasi/e100000c.jpg','NETRAL'::"SentimenLabel",0.49,'neutral',now(),false,NULL,NULL,NULL,now(),now())
ON CONFLICT (tanggal, "penerimaManfaatId") DO UPDATE SET
  "statusKonsumsi"=EXCLUDED."statusKonsumsi", "ratingKeseluruhan"=EXCLUDED."ratingKeseluruhan",
  feedback=EXCLUDED.feedback, "fotoUrl"=EXCLUDED."fotoUrl", sentimen=EXCLUDED.sentimen, "updatedAt"=now();

INSERT INTO penilaian_komponen (id, "evaluasiId", "komponenId", "skorKeterhabisan", "createdAt", "updatedAt") VALUES
 -- e01 (menu m2): 5,5,4,5
 ('91000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001','34000000-0000-4000-8000-000000000009',5,now(),now()),
 ('91000000-0000-4000-8000-000000000002','e1000000-0000-4000-8000-000000000001','34000000-0000-4000-8000-00000000000a',5,now(),now()),
 ('91000000-0000-4000-8000-000000000003','e1000000-0000-4000-8000-000000000001','34000000-0000-4000-8000-00000000000b',4,now(),now()),
 ('91000000-0000-4000-8000-000000000004','e1000000-0000-4000-8000-000000000001','34000000-0000-4000-8000-00000000000c',5,now(),now()),
 -- e02 (menu m2): 3,3,4,3
 ('91000000-0000-4000-8000-000000000005','e1000000-0000-4000-8000-000000000002','34000000-0000-4000-8000-000000000009',3,now(),now()),
 ('91000000-0000-4000-8000-000000000006','e1000000-0000-4000-8000-000000000002','34000000-0000-4000-8000-00000000000a',3,now(),now()),
 ('91000000-0000-4000-8000-000000000007','e1000000-0000-4000-8000-000000000002','34000000-0000-4000-8000-00000000000b',4,now(),now()),
 ('91000000-0000-4000-8000-000000000008','e1000000-0000-4000-8000-000000000002','34000000-0000-4000-8000-00000000000c',3,now(),now()),
 -- e03 (menu m2): 2,1,2,3  (komponen ≤2 → pemicu validasi)
 ('91000000-0000-4000-8000-000000000009','e1000000-0000-4000-8000-000000000003','34000000-0000-4000-8000-000000000009',2,now(),now()),
 ('91000000-0000-4000-8000-00000000000a','e1000000-0000-4000-8000-000000000003','34000000-0000-4000-8000-00000000000a',1,now(),now()),
 ('91000000-0000-4000-8000-00000000000b','e1000000-0000-4000-8000-000000000003','34000000-0000-4000-8000-00000000000b',2,now(),now()),
 ('91000000-0000-4000-8000-00000000000c','e1000000-0000-4000-8000-000000000003','34000000-0000-4000-8000-00000000000c',3,now(),now()),
 -- e04 (menu m2): 5,5,5,4
 ('91000000-0000-4000-8000-00000000000d','e1000000-0000-4000-8000-000000000004','34000000-0000-4000-8000-000000000009',5,now(),now()),
 ('91000000-0000-4000-8000-00000000000e','e1000000-0000-4000-8000-000000000004','34000000-0000-4000-8000-00000000000a',5,now(),now()),
 ('91000000-0000-4000-8000-00000000000f','e1000000-0000-4000-8000-000000000004','34000000-0000-4000-8000-00000000000b',5,now(),now()),
 ('91000000-0000-4000-8000-000000000010','e1000000-0000-4000-8000-000000000004','34000000-0000-4000-8000-00000000000c',4,now(),now()),
 -- e05 (menu m2): 4,4,5,4
 ('91000000-0000-4000-8000-000000000011','e1000000-0000-4000-8000-000000000005','34000000-0000-4000-8000-000000000009',4,now(),now()),
 ('91000000-0000-4000-8000-000000000012','e1000000-0000-4000-8000-000000000005','34000000-0000-4000-8000-00000000000a',4,now(),now()),
 ('91000000-0000-4000-8000-000000000013','e1000000-0000-4000-8000-000000000005','34000000-0000-4000-8000-00000000000b',5,now(),now()),
 ('91000000-0000-4000-8000-000000000014','e1000000-0000-4000-8000-000000000005','34000000-0000-4000-8000-00000000000c',4,now(),now()),
 -- e06 (menu m1, tidak konsumsi): 1,1,2,1
 ('91000000-0000-4000-8000-000000000015','e1000000-0000-4000-8000-000000000006','34000000-0000-4000-8000-000000000005',1,now(),now()),
 ('91000000-0000-4000-8000-000000000016','e1000000-0000-4000-8000-000000000006','34000000-0000-4000-8000-000000000006',1,now(),now()),
 ('91000000-0000-4000-8000-000000000017','e1000000-0000-4000-8000-000000000006','34000000-0000-4000-8000-000000000007',2,now(),now()),
 ('91000000-0000-4000-8000-000000000018','e1000000-0000-4000-8000-000000000006','34000000-0000-4000-8000-000000000008',1,now(),now()),
 -- e07 (menu m0, PM-B rating 2): 2,1,2,3
 ('91000000-0000-4000-8000-000000000019','e1000000-0000-4000-8000-000000000007','34000000-0000-4000-8000-000000000001',2,now(),now()),
 ('91000000-0000-4000-8000-00000000001a','e1000000-0000-4000-8000-000000000007','34000000-0000-4000-8000-000000000002',1,now(),now()),
 ('91000000-0000-4000-8000-00000000001b','e1000000-0000-4000-8000-000000000007','34000000-0000-4000-8000-000000000003',2,now(),now()),
 ('91000000-0000-4000-8000-00000000001c','e1000000-0000-4000-8000-000000000007','34000000-0000-4000-8000-000000000004',3,now(),now()),
 -- e08 (SMA19, menu m0): 2,2,1,3
 ('91000000-0000-4000-8000-00000000001d','e1000000-0000-4000-8000-000000000008','34000000-0000-4000-8000-000000000001',2,now(),now()),
 ('91000000-0000-4000-8000-00000000001e','e1000000-0000-4000-8000-000000000008','34000000-0000-4000-8000-000000000002',2,now(),now()),
 ('91000000-0000-4000-8000-00000000001f','e1000000-0000-4000-8000-000000000008','34000000-0000-4000-8000-000000000003',1,now(),now()),
 ('91000000-0000-4000-8000-000000000020','e1000000-0000-4000-8000-000000000008','34000000-0000-4000-8000-000000000004',3,now(),now()),
 -- e09 (SMA19, menu m0): 5,5,4,5
 ('91000000-0000-4000-8000-000000000021','e1000000-0000-4000-8000-000000000009','34000000-0000-4000-8000-000000000001',5,now(),now()),
 ('91000000-0000-4000-8000-000000000022','e1000000-0000-4000-8000-000000000009','34000000-0000-4000-8000-000000000002',5,now(),now()),
 ('91000000-0000-4000-8000-000000000023','e1000000-0000-4000-8000-000000000009','34000000-0000-4000-8000-000000000003',4,now(),now()),
 ('91000000-0000-4000-8000-000000000024','e1000000-0000-4000-8000-000000000009','34000000-0000-4000-8000-000000000004',5,now(),now()),
 -- e0a (SMA2, menu Siliwangi Ayam Teriyaki): 5,4,4
 ('91000000-0000-4000-8000-000000000025','e1000000-0000-4000-8000-00000000000a','34000000-0000-4000-8000-000000000011',5,now(),now()),
 ('91000000-0000-4000-8000-000000000026','e1000000-0000-4000-8000-00000000000a','34000000-0000-4000-8000-000000000012',4,now(),now()),
 ('91000000-0000-4000-8000-000000000027','e1000000-0000-4000-8000-00000000000a','34000000-0000-4000-8000-000000000013',4,now(),now()),
 -- e0b (SMA2, menu Siliwangi Ayam Teriyaki, rating 2): 2,2,1
 ('91000000-0000-4000-8000-000000000028','e1000000-0000-4000-8000-00000000000b','34000000-0000-4000-8000-000000000011',2,now(),now()),
 ('91000000-0000-4000-8000-000000000029','e1000000-0000-4000-8000-00000000000b','34000000-0000-4000-8000-000000000012',2,now(),now()),
 ('91000000-0000-4000-8000-00000000002a','e1000000-0000-4000-8000-00000000000b','34000000-0000-4000-8000-000000000013',1,now(),now()),
 -- e0c (SMA5, menu Dago Capcay): 3,3,4
 ('91000000-0000-4000-8000-00000000002b','e1000000-0000-4000-8000-00000000000c','34000000-0000-4000-8000-000000000017',3,now(),now()),
 ('91000000-0000-4000-8000-00000000002c','e1000000-0000-4000-8000-00000000000c','34000000-0000-4000-8000-000000000018',3,now(),now()),
 ('91000000-0000-4000-8000-00000000002d','e1000000-0000-4000-8000-00000000000c','34000000-0000-4000-8000-000000000019',4,now(),now())
ON CONFLICT ("evaluasiId", "komponenId") DO UPDATE SET "skorKeterhabisan"=EXCLUDED."skorKeterhabisan", "updatedAt"=now();

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
--  RINGKASAN AKUN KUNCI
--   admin@gmail.com                 | Password123! | ADMIN
--   lebakgede.dapur@gmail.com       | mbg12345     | TIM_DAPUR (SHOWCASE)
--   sman1bandung.guru@gmail.com     | mbg12345     | GURU (SHOWCASE)
--   ahmadrizkypratama@gmail.com     | mbg12345     | PM-A (selalu positif)
--   sitinurhaliza@gmail.com         | mbg12345     | PM-B (pernah rating rendah)
--   bagussetiawan@gmail.com         | mbg12345     | PM-C (pernah tidak konsumsi)
-- ════════════════════════════════════════════════════════════════════════════
