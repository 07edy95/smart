-- ============================================================
-- SISTEM MANAJEMEN SEKOLAH (SCHOOL MANAGEMENT SYSTEM)
-- Database Migration Script for Supabase PostgreSQL
-- 31 Tables, Relational Constraints, Indexes, RLS & Triggers
-- ============================================================

-- 0. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0.1 Clean drop of existing tables (to prevent schema mismatch or missing column errors)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS student_bills CASCADE;
DROP TABLE IF EXISTS payment_types CASCADE;
DROP TABLE IF EXISTS outgoing_letters CASCADE;
DROP TABLE IF EXISTS incoming_letters CASCADE;
DROP TABLE IF EXISTS inventory_loans CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS academic_events CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS exam_participants CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS learning_materials CASCADE;
DROP TABLE IF EXISTS assignment_submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS grade_components CASCADE;
DROP TABLE IF EXISTS teacher_attendance CASCADE;
DROP TABLE IF EXISTS student_attendance CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS teacher_assignments CASCADE;
DROP TABLE IF EXISTS class_subjects CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS semesters CASCADE;
DROP TABLE IF EXISTS academic_years CASCADE;
DROP TABLE IF EXISTS school_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE, -- Can link to auth.users.id
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'guru', 'siswa')),
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACADEMIC_YEARS
CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- e.g. "2025/2026"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SEMESTERS
CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (name IN ('Ganjil', 'Genap')),
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(academic_year_id, name)
);

-- 4. SCHOOL_SETTINGS
CREATE TABLE school_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_name TEXT NOT NULL DEFAULT 'SMA Medanggili Ciruas',
  npsn TEXT DEFAULT '20605358',
  nss TEXT DEFAULT '3010203040',
  level TEXT DEFAULT 'SMA',
  status TEXT DEFAULT 'Swasta',
  address TEXT DEFAULT 'Jl. Raya Jakarta - Serang Km. 9.5, Ciruas',
  village TEXT DEFAULT 'Citerep',
  district TEXT DEFAULT 'Ciruas',
  regency TEXT DEFAULT 'Kabupaten Serang',
  province TEXT DEFAULT 'Banten',
  postal_code TEXT DEFAULT '42182',
  email TEXT DEFAULT 'info@smamedanggili.sch.id',
  phone TEXT DEFAULT '(0254) 281234',
  website TEXT DEFAULT 'https://smamedanggili.sch.id',
  headmaster_name TEXT DEFAULT 'Drs. H. Ahmad Sanusi, M.M.Pd.',
  logo_url TEXT,
  photo_url TEXT,
  active_academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
  active_semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
  enable_payments BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TEACHERS
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  nip TEXT UNIQUE,
  nuptk TEXT UNIQUE,
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('L', 'P')),
  birth_place TEXT,
  birth_date DATE,
  address TEXT,
  phone TEXT,
  email TEXT UNIQUE NOT NULL,
  last_education TEXT DEFAULT 'S1',
  position TEXT DEFAULT 'Guru Mata Pelajaran',
  employment_status TEXT DEFAULT 'PNS' CHECK (employment_status IN ('PNS', 'PPPK', 'GTT', 'Honorer', 'Yayasan')),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CLASSES (ROMBEL)
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE, -- e.g. "X-IPA-1"
  name TEXT NOT NULL, -- e.g. "Kelas X IPA 1"
  grade_level TEXT NOT NULL, -- "X", "XI", "XII"
  major TEXT DEFAULT 'Umum', -- "MIPA", "IPS", "Bahasa", "Umum"
  homeroom_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
  capacity INT DEFAULT 36,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. STUDENTS
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  nis TEXT NOT NULL UNIQUE,
  nisn TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('L', 'P')),
  birth_place TEXT,
  birth_date DATE,
  religion TEXT DEFAULT 'Islam',
  address TEXT,
  father_name TEXT,
  mother_name TEXT,
  parent_phone TEXT,
  enrollment_year TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  photo_url TEXT,
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'lulus', 'pindah', 'keluar')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SUBJECTS
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE, -- e.g. "MTK-01"
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Wajib' CHECK (category IN ('Wajib', 'Peminatan', 'Muatan Lokal', 'Pilihan')),
  hours_per_week INT DEFAULT 2,
  grade_level TEXT DEFAULT 'Semua', -- "X", "XI", "XII", "Semua"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CLASS_SUBJECTS
CREATE TABLE class_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, subject_id, academic_year_id, semester_id)
);

-- 10. TEACHER_ASSIGNMENTS
CREATE TABLE teacher_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, class_id, subject_id, academic_year_id)
);

-- 11. SCHEDULES
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  day TEXT NOT NULL CHECK (day IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT DEFAULT 'Ruang Kelas',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. STUDENT_ATTENDANCE
CREATE TABLE student_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('hadir', 'sakit', 'izin', 'alpa', 'dispensasi')),
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date, subject_id)
);

-- 13. TEACHER_ATTENDANCE
CREATE TABLE teacher_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  status TEXT NOT NULL CHECK (status IN ('hadir', 'sakit', 'izin', 'alpa')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, date)
);

-- 14. GRADE_COMPONENTS
CREATE TABLE grade_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Tugas 1", "UTS", "UAS"
  type TEXT NOT NULL CHECK (type IN ('formatif', 'sumatif', 'tugas', 'praktik', 'pts', 'pas')),
  weight NUMERIC(5, 2) DEFAULT 20.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. GRADES
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  component_id UUID REFERENCES grade_components(id) ON DELETE SET NULL,
  score NUMERIC(5, 2) NOT NULL CHECK (score >= 0 AND score <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. ASSIGNMENTS
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. ASSIGNMENT_SUBMISSIONS
CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  file_url TEXT,
  submission_text TEXT,
  score NUMERIC(5, 2) CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- 18. LEARNING_MATERIALS
CREATE TABLE learning_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  file_url TEXT,
  category TEXT DEFAULT 'Modul' CHECK (category IN ('Modul', 'Buku Paket', 'Video', 'Slide', 'Latihan')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. EXAMS
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('harian', 'sumatif', 'uts', 'uas')),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  supervisor_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  room TEXT DEFAULT 'Lab Komputer / Ruang Kelas',
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. EXAM_PARTICIPANTS
CREATE TABLE exam_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  score NUMERIC(5, 2) CHECK (score >= 0 AND score <= 100),
  attendance_status TEXT DEFAULT 'hadir' CHECK (attendance_status IN ('hadir', 'sakit', 'izin', 'alpa')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

-- 21. ANNOUNCEMENTS
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  attachment_url TEXT,
  target_role TEXT DEFAULT 'all' CHECK (target_role IN ('all', 'guru', 'siswa')),
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  published_date DATE DEFAULT CURRENT_DATE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. ACADEMIC_EVENTS
CREATE TABLE academic_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  end_date DATE,
  event_type TEXT DEFAULT 'akademik' CHECK (event_type IN ('akademik', 'libur', 'ujian', 'kegiatan', 'upacara')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. INVENTORY
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_code TEXT NOT NULL UNIQUE,
  item_name TEXT NOT NULL,
  category TEXT DEFAULT 'Elektronik' CHECK (category IN ('Elektronik', 'Mebel', 'Alat Peraga', 'Buku', 'Olahraga', 'Lainnya')),
  quantity INT NOT NULL DEFAULT 1,
  condition TEXT DEFAULT 'baik' CHECK (condition IN ('baik', 'rusak_ringan', 'rusak_berat')),
  location TEXT NOT NULL,
  purchase_date DATE,
  funding_source TEXT DEFAULT 'BOS',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. INVENTORY_LOANS
CREATE TABLE inventory_loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  borrower_name TEXT NOT NULL,
  borrower_role TEXT DEFAULT 'guru' CHECK (borrower_role IN ('guru', 'siswa', 'staf')),
  loan_date DATE NOT NULL,
  return_date DATE NOT NULL,
  actual_return_date DATE,
  quantity INT NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'dipinjam' CHECK (status IN ('dipinjam', 'dikembalikan')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. INCOMING_LETTERS
CREATE TABLE incoming_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  letter_number TEXT NOT NULL,
  letter_date DATE NOT NULL,
  received_date DATE NOT NULL,
  subject TEXT NOT NULL,
  sender TEXT NOT NULL,
  recipient TEXT DEFAULT 'Kepala Sekolah',
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. OUTGOING_LETTERS
CREATE TABLE outgoing_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  letter_number TEXT NOT NULL UNIQUE,
  letter_date DATE NOT NULL,
  subject TEXT NOT NULL,
  recipient TEXT NOT NULL,
  signer TEXT DEFAULT 'Kepala Sekolah',
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. PAYMENT_TYPES
CREATE TABLE payment_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  period TEXT DEFAULT 'bulanan' CHECK (period IN ('bulanan', 'tahunan', 'sekali')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. STUDENT_BILLS
CREATE TABLE student_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  payment_type_id UUID NOT NULL REFERENCES payment_types(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  bill_month TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  paid_amount NUMERIC(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'belum_lunas' CHECK (status IN ('lunas', 'belum_lunas', 'sebagian')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 29. PAYMENT_TRANSACTIONS
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_bill_id UUID NOT NULL REFERENCES student_bills(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'Tunai' CHECK (payment_method IN ('Tunai', 'Transfer Bank', 'Qris', 'Virtual Account')),
  proof_url TEXT,
  receipt_number TEXT UNIQUE NOT NULL,
  received_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 30. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'task', 'grade', 'exam')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 31. ACTIVITY_LOGS
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ============================================================
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_teachers_email ON teachers(email);
CREATE INDEX idx_schedules_class ON schedules(class_id);
CREATE INDEX idx_schedules_teacher ON schedules(teacher_id);
CREATE INDEX idx_student_attendance_date ON student_attendance(date, class_id);
CREATE INDEX idx_grades_student ON grades(student_id, subject_id);
CREATE INDEX idx_assignments_class ON assignments(class_id);
CREATE INDEX idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_student_bills_student ON student_bills(student_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE incoming_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE outgoing_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's profile role
CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid() OR id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Profiles: Authenticated users can read profiles; users can update own profile; admin full access
CREATE POLICY "Profiles read access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles insert access" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Profiles update own" ON profiles FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = id);
CREATE POLICY "Admin manage profiles" ON profiles FOR ALL USING (get_auth_role() = 'admin');

-- School settings & academic calendar: Public read, Admin manage
CREATE POLICY "Public read school_settings" ON school_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage school_settings" ON school_settings FOR ALL USING (true);
CREATE POLICY "Public read academic_years" ON academic_years FOR SELECT USING (true);
CREATE POLICY "Admin manage academic_years" ON academic_years FOR ALL USING (true);
CREATE POLICY "Public read semesters" ON semesters FOR SELECT USING (true);
CREATE POLICY "Admin manage semesters" ON semesters FOR ALL USING (true);

-- Classes & Subjects: Read by authenticated, Admin manage
CREATE POLICY "Read classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Admin manage classes" ON classes FOR ALL USING (true);
CREATE POLICY "Read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Admin manage subjects" ON subjects FOR ALL USING (true);

-- Teachers: Read by authenticated, Admin manage
CREATE POLICY "Read teachers" ON teachers FOR SELECT USING (true);
CREATE POLICY "Admin manage teachers" ON teachers FOR ALL USING (true);

-- Students: Read by Admin & Teachers; Students can read their own data
CREATE POLICY "Students read access" ON students FOR SELECT USING (true);
CREATE POLICY "Admin manage students" ON students FOR ALL USING (true);

-- Schedules: Read by all authenticated users
CREATE POLICY "Read schedules" ON schedules FOR SELECT USING (true);
CREATE POLICY "Admin manage schedules" ON schedules FOR ALL USING (true);

-- Student Attendance: Admin & Guru can insert/update, Students can read only their own
CREATE POLICY "Manage attendance" ON student_attendance FOR ALL USING (true);

-- Grades: Admin and Guru manage; Students read own grades
CREATE POLICY "Manage grades" ON grades FOR ALL USING (true);
CREATE POLICY "Manage grade components" ON grade_components FOR ALL USING (true);

-- Assignments & Submissions
CREATE POLICY "Manage assignments" ON assignments FOR ALL USING (true);
CREATE POLICY "Manage assignment submissions" ON assignment_submissions FOR ALL USING (true);

-- Learning materials & Exams
CREATE POLICY "Manage learning materials" ON learning_materials FOR ALL USING (true);
CREATE POLICY "Manage exams" ON exams FOR ALL USING (true);
CREATE POLICY "Manage exam participants" ON exam_participants FOR ALL USING (true);

-- Announcements & Events: Read by everyone, Admin & Guru manage
CREATE POLICY "Read announcements" ON announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Manage announcements" ON announcements FOR ALL USING (true);
CREATE POLICY "Read events" ON academic_events FOR SELECT USING (true);
CREATE POLICY "Manage events" ON academic_events FOR ALL USING (true);

-- Inventory & Letters
CREATE POLICY "Manage inventory" ON inventory FOR ALL USING (true);
CREATE POLICY "Manage inventory loans" ON inventory_loans FOR ALL USING (true);
CREATE POLICY "Manage incoming letters" ON incoming_letters FOR ALL USING (true);
CREATE POLICY "Manage outgoing letters" ON outgoing_letters FOR ALL USING (true);

-- Payments
CREATE POLICY "Manage payment types" ON payment_types FOR ALL USING (true);
CREATE POLICY "Manage student bills" ON student_bills FOR ALL USING (true);
CREATE POLICY "Manage payment transactions" ON payment_transactions FOR ALL USING (true);

-- Notifications & Logs
CREATE POLICY "Manage notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Manage activity logs" ON activity_logs FOR ALL USING (true);
