import { 
  Profile, SchoolSettings, AcademicYear, Semester, ClassRoom, 
  Teacher, Student, Subject, Schedule, StudentAttendance, 
  TeacherAttendance, GradeComponent, Grade, Assignment, 
  AssignmentSubmission, LearningMaterial, Exam, ExamParticipant, 
  Announcement, AcademicEvent, InventoryItem, InventoryLoan, 
  IncomingLetter, OutgoingLetter, PaymentType, StudentBill, 
  PaymentTransaction, NotificationItem, ActivityLog 
} from '../types/database';

// 1. Master Administrator Account
export const initialProfiles: Profile[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    username: 'admin',
    password: '123@Admin',
    email: 'admin@sekolah.sch.id',
    full_name: 'Administrator Utama',
    role: 'admin',
    phone: '081234567890',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    username: 'adminmedanggili',
    password: '123@Admin',
    email: 'admin@smamedanggili.sch.id',
    full_name: 'Admin SMA Medanggili Ciruas',
    role: 'admin',
    phone: '081234567890',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// 2. Data Master Sekolah - SMA Medanggili Ciruas
export const initialSchoolSettings: SchoolSettings = {
  id: '33333333-3333-3333-3333-333333333333',
  school_name: 'SMA Medanggili Ciruas',
  npsn: '20605358',
  nss: '3010203040',
  level: 'SMA',
  status: 'Swasta',
  address: 'Jl. Raya Jakarta - Serang Km. 9.5, Ciruas',
  village: 'Citerep',
  district: 'Ciruas',
  regency: 'Kabupaten Serang',
  province: 'Banten',
  postal_code: '42182',
  email: 'info@smamedanggili.sch.id',
  phone: '(0254) 281234',
  website: 'https://smamedanggili.sch.id',
  headmaster_name: 'Drs. H. Ahmad Sanusi, M.M.Pd.',
  logo_url: '/logo.png',
  photo_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800',
  active_academic_year_id: '11111111-1111-1111-1111-111111111111',
  active_semester_id: '22222222-2222-2222-2222-222222222221',
  enable_payments: true,
};

// 3. Tahun Ajaran & Semester Aktif
export const initialAcademicYears: AcademicYear[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: '2025/2026',
    start_date: '2025-07-15',
    end_date: '2026-06-25',
    is_active: true,
    is_archived: false,
  }
];

export const initialSemesters: Semester[] = [
  {
    id: '22222222-2222-2222-2222-222222222221',
    academic_year_id: '11111111-1111-1111-1111-111111111111',
    name: 'Ganjil',
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    academic_year_id: '11111111-1111-1111-1111-111111111111',
    name: 'Genap',
    is_active: false,
  }
];

// 4. Data Transaksional Bersih (Semua Data Dummy Telah Dihapus)
export const initialTeachers: Teacher[] = [];
export const initialClasses: ClassRoom[] = [];
export const initialSubjects: Subject[] = [];
export const initialStudents: Student[] = [];
export const initialSchedules: Schedule[] = [];
export const initialAttendance: StudentAttendance[] = [];
export const initialGradeComponents: GradeComponent[] = [];
export const initialGrades: Grade[] = [];
export const initialAssignments: Assignment[] = [];
export const initialSubmissions: AssignmentSubmission[] = [];
export const initialLearningMaterials: LearningMaterial[] = [];
export const initialExams: Exam[] = [];
export const initialAnnouncements: Announcement[] = [];
export const initialEvents: AcademicEvent[] = [];
export const initialInventory: InventoryItem[] = [];
export const initialInventoryLoans: InventoryLoan[] = [];
export const initialIncomingLetters: IncomingLetter[] = [];
export const initialOutgoingLetters: OutgoingLetter[] = [];
export const initialPaymentTypes: PaymentType[] = [];
export const initialStudentBills: StudentBill[] = [];
export const initialTransactions: PaymentTransaction[] = [];
export const initialNotifications: NotificationItem[] = [];
export const initialActivityLogs: ActivityLog[] = [];
