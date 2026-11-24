export type UserRole = 'admin' | 'guru' | 'siswa';

export interface Profile {
  id: string;
  user_id?: string;
  username?: string;
  email: string;
  password?: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchoolSettings {
  id: string;
  school_name: string;
  npsn: string;
  nss?: string;
  level: string;
  status: string;
  address: string;
  village?: string;
  district?: string;
  regency?: string;
  province?: string;
  postal_code?: string;
  email: string;
  phone: string;
  website?: string;
  headmaster_name: string;
  logo_url?: string;
  photo_url?: string;
  active_academic_year_id?: string;
  active_semester_id?: string;
  enable_payments: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_archived: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Semester {
  id: string;
  academic_year_id: string;
  name: 'Ganjil' | 'Genap';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClassRoom {
  id: string;
  code: string;
  name: string;
  grade_level: string;
  major: string;
  homeroom_teacher_id?: string;
  homeroom_teacher_name?: string;
  academic_year_id?: string;
  capacity: number;
  student_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Teacher {
  id: string;
  profile_id?: string;
  username?: string;
  password?: string;
  nip?: string;
  nuptk?: string;
  full_name: string;
  gender: 'L' | 'P';
  birth_place?: string;
  birth_date?: string;
  address?: string;
  phone?: string;
  email: string;
  last_education: string;
  position: string;
  employment_status: 'PNS' | 'PPPK' | 'GTT' | 'Honorer' | 'Yayasan';
  photo_url?: string;
  subject_names?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Student {
  id: string;
  profile_id?: string;
  username?: string;
  password?: string;
  nis: string;
  nisn: string;
  full_name: string;
  gender: 'L' | 'P';
  birth_place?: string;
  birth_date?: string;
  religion?: string;
  address?: string;
  father_name?: string;
  mother_name?: string;
  parent_phone?: string;
  enrollment_year?: string;
  class_id?: string;
  class_name?: string;
  photo_url?: string;
  status: 'aktif' | 'lulus' | 'pindah' | 'keluar';
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: 'Wajib' | 'Peminatan' | 'Muatan Lokal' | 'Pilihan';
  hours_per_week: number;
  grade_level: string;
  created_at?: string;
  updated_at?: string;
}

export interface Schedule {
  id: string;
  class_id: string;
  class_name?: string;
  subject_id: string;
  subject_name?: string;
  teacher_id: string;
  teacher_name?: string;
  academic_year_id?: string;
  semester_id?: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  start_time: string;
  end_time: string;
  room?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentAttendance {
  id: string;
  student_id: string;
  student_name?: string;
  class_id: string;
  class_name?: string;
  subject_id?: string;
  subject_name?: string;
  date: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa' | 'dispensasi';
  notes?: string;
  recorded_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeacherAttendance {
  id: string;
  teacher_id: string;
  teacher_name?: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GradeComponent {
  id: string;
  subject_id: string;
  class_id: string;
  semester_id: string;
  name: string;
  type: 'formatif' | 'sumatif' | 'tugas' | 'praktik' | 'pts' | 'pas';
  weight: number;
  created_at?: string;
  updated_at?: string;
}

export interface Grade {
  id: string;
  student_id: string;
  student_name?: string;
  subject_id: string;
  subject_name?: string;
  class_id: string;
  class_name?: string;
  semester_id?: string;
  academic_year_id?: string;
  component_id?: string;
  component_name?: string;
  score: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  class_id: string;
  class_name?: string;
  subject_id: string;
  subject_name?: string;
  teacher_id: string;
  teacher_name?: string;
  due_date: string;
  file_url?: string;
  submission_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  assignment_title?: string;
  student_id: string;
  student_name?: string;
  file_url?: string;
  submission_text?: string;
  score?: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LearningMaterial {
  id: string;
  title: string;
  description: string;
  class_id?: string;
  class_name?: string;
  subject_id: string;
  subject_name?: string;
  teacher_id: string;
  teacher_name?: string;
  file_url?: string;
  category: 'Modul' | 'Buku Paket' | 'Video' | 'Slide' | 'Latihan';
  created_at?: string;
  updated_at?: string;
}

export interface Exam {
  id: string;
  title: string;
  type: 'harian' | 'sumatif' | 'uts' | 'uas';
  subject_id: string;
  subject_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  supervisor_teacher_id?: string;
  supervisor_name?: string;
  room: string;
  academic_year_id?: string;
  semester_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExamParticipant {
  id: string;
  exam_id: string;
  exam_title?: string;
  student_id: string;
  student_name?: string;
  class_id: string;
  class_name?: string;
  score?: number;
  attendance_status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  attachment_url?: string;
  target_role: 'all' | 'guru' | 'siswa';
  class_id?: string;
  published_date: string;
  author_id?: string;
  author_name?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AcademicEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  end_date?: string;
  event_type: 'akademik' | 'libur' | 'ujian' | 'kegiatan' | 'upacara';
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItem {
  id: string;
  item_code: string;
  item_name: string;
  category: 'Elektronik' | 'Mebel' | 'Alat Peraga' | 'Buku' | 'Olahraga' | 'Lainnya';
  quantity: number;
  condition: 'baik' | 'rusak_ringan' | 'rusak_berat';
  location: string;
  purchase_date?: string;
  funding_source: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryLoan {
  id: string;
  inventory_id: string;
  item_name?: string;
  borrower_name: string;
  borrower_role: 'guru' | 'siswa' | 'staf';
  loan_date: string;
  return_date: string;
  actual_return_date?: string;
  quantity: number;
  status: 'dipinjam' | 'dikembalikan';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IncomingLetter {
  id: string;
  letter_number: string;
  letter_date: string;
  received_date: string;
  subject: string;
  sender: string;
  recipient: string;
  file_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OutgoingLetter {
  id: string;
  letter_number: string;
  letter_date: string;
  subject: string;
  recipient: string;
  signer: string;
  file_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentType {
  id: string;
  name: string;
  amount: number;
  period: 'bulanan' | 'tahunan' | 'sekali';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StudentBill {
  id: string;
  student_id: string;
  student_name?: string;
  payment_type_id: string;
  payment_type_name?: string;
  academic_year_id?: string;
  bill_month?: string;
  amount: number;
  paid_amount: number;
  status: 'lunas' | 'belum_lunas' | 'sebagian';
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentTransaction {
  id: string;
  student_bill_id: string;
  student_id: string;
  student_name?: string;
  amount: number;
  payment_date: string;
  payment_method: 'Tunai' | 'Transfer Bank' | 'Qris' | 'Virtual Account';
  proof_url?: string;
  receipt_number: string;
  received_by?: string;
  receiver_name?: string;
  notes?: string;
  created_at?: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'task' | 'grade' | 'exam';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_name: string;
  action: string;
  module: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}
