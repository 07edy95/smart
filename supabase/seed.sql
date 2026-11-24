-- ============================================================
-- INITIAL SEED DATA FOR SISTEM MANAJEMEN SEKOLAH
-- SMA MEDANGGILI CIRUAS (NPSN: 20605358)
-- Bersih dari data dummy / contoh
-- ============================================================

-- 1. PROFILES (Master Admin)
INSERT INTO profiles (id, email, full_name, role, phone, is_active)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'admin@sekolah.sch.id', 'Administrator Utama', 'admin', '081234567890', true),
  ('a0000000-0000-0000-0000-000000000002', 'admin@smamedanggili.sch.id', 'Admin SMA Medanggili Ciruas', 'admin', '081234567890', true)
ON CONFLICT (id) DO NOTHING;

-- 2. ACADEMIC YEARS & SEMESTERS
INSERT INTO academic_years (id, name, start_date, end_date, is_active, is_archived)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '2025/2026', '2025-07-15', '2026-06-25', true, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO semesters (id, academic_year_id, name, is_active)
VALUES 
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Ganjil', true),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Genap', false)
ON CONFLICT (id) DO NOTHING;

-- 3. SCHOOL SETTINGS
INSERT INTO school_settings (
  id, school_name, npsn, nss, level, status, address, 
  village, district, regency, province, postal_code, 
  email, phone, website, headmaster_name,
  active_academic_year_id, active_semester_id, enable_payments
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'SMA Medanggili Ciruas',
  '20605358',
  '3010203040',
  'SMA',
  'Swasta',
  'Jl. Raya Jakarta - Serang Km. 9.5, Ciruas',
  'Citerep',
  'Ciruas',
  'Kabupaten Serang',
  'Banten',
  '42182',
  'info@smamedanggili.sch.id',
  '(0254) 281234',
  'https://smamedanggili.sch.id',
  'Drs. H. Ahmad Sanusi, M.M.Pd.',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222221',
  true
) ON CONFLICT (id) DO UPDATE SET 
  school_name = EXCLUDED.school_name,
  npsn = EXCLUDED.npsn,
  address = EXCLUDED.address,
  village = EXCLUDED.village,
  district = EXCLUDED.district,
  regency = EXCLUDED.regency,
  province = EXCLUDED.province,
  postal_code = EXCLUDED.postal_code,
  email = EXCLUDED.email,
  website = EXCLUDED.website;

-- Seluruh tabel data lainnya (siswa, guru, rombel, mapel, jadwal, presensi, nilai, dll.)
-- Dibuat bersih (0 data) dan siap diinputkan data riil sekolah.
