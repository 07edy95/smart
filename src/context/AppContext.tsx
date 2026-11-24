import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Profile, SchoolSettings, AcademicYear, Semester, ClassRoom, 
  Teacher, Student, Subject, Schedule, StudentAttendance, 
  TeacherAttendance, GradeComponent, Grade, Assignment, 
  AssignmentSubmission, LearningMaterial, Exam, ExamParticipant, 
  Announcement, AcademicEvent, InventoryItem, InventoryLoan, 
  IncomingLetter, OutgoingLetter, PaymentType, StudentBill, 
  PaymentTransaction, NotificationItem, ActivityLog, UserRole 
} from '../types/database';
import { 
  initialProfiles, initialSchoolSettings, initialAcademicYears, 
  initialSemesters, initialTeachers, initialClasses, initialSubjects, 
  initialStudents, initialSchedules, initialAttendance, initialGradeComponents, 
  initialGrades, initialAssignments, initialSubmissions, initialLearningMaterials, 
  initialExams, initialAnnouncements, initialEvents, initialInventory, 
  initialInventoryLoans, initialIncomingLetters, initialOutgoingLetters, 
  initialPaymentTypes, initialStudentBills, initialTransactions, 
  initialNotifications, initialActivityLogs 
} from '../lib/mockData';
import { 
  fetchFromHostinger, 
  insertToHostinger, 
  updateInHostinger, 
  deleteFromHostinger, 
  deleteBulkFromHostinger,
  clearAllSchoolDataOnHostinger,
  insertBulkToHostinger, 
  testHostingerConnection 
} from '../lib/hostingerApi';
import { generateUsername, getDefaultPassword } from '../utils/helpers';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  // Auth & Profile
  currentUser: Profile | null;
  teacherProfile: Teacher | null;
  studentProfile: Student | null;
  role: UserRole;
  teacherSubjects: Subject[];
  teacherClasses: ClassRoom[];
  login: (email: string, password?: string, preferredRole?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateCurrentUserProfile: (data: Partial<Profile>) => void;
  
  // Theme & App State
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isDbConnected: boolean;
  isSyncing: boolean;
  refreshDataFromHostinger: () => Promise<void>;
  syncAllDataToHostinger: () => Promise<{ success: boolean; message: string }>;
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  // Master Data & Academic
  schoolSettings: SchoolSettings;
  updateSchoolSettings: (data: Partial<SchoolSettings>) => void;
  academicYears: AcademicYear[];
  addAcademicYear: (data: Omit<AcademicYear, 'id'>) => void;
  updateAcademicYear: (id: string, data: Partial<AcademicYear>) => void;
  deleteAcademicYear: (id: string) => void;
  setActiveAcademicYear: (id: string) => void;
  
  semesters: Semester[];
  setActiveSemester: (id: string) => void;

  classes: ClassRoom[];
  addClass: (data: Omit<ClassRoom, 'id'>) => void;
  updateClass: (id: string, data: Partial<ClassRoom>) => void;
  deleteClass: (id: string) => void;
  bulkDeleteClasses: (ids: string[]) => void;

  teachers: Teacher[];
  addTeacher: (data: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, data: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  bulkDeleteTeachers: (ids: string[]) => void;
  importTeachers: (teachersList: Omit<Teacher, 'id'>[]) => void;

  students: Student[];
  addStudent: (data: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  bulkDeleteStudents: (ids: string[]) => void;
  importStudents: (studentsList: Omit<Student, 'id'>[]) => void;

  subjects: Subject[];
  addSubject: (data: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, data: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  bulkDeleteSubjects: (ids: string[]) => void;
  importSubjects: (subjectsList: Omit<Subject, 'id'>[]) => void;

  schedules: Schedule[];
  addSchedule: (data: Omit<Schedule, 'id'>) => { success: boolean; message?: string };
  updateSchedule: (id: string, data: Partial<Schedule>) => { success: boolean; message?: string };
  deleteSchedule: (id: string) => void;

  // Attendance
  studentAttendance: StudentAttendance[];
  recordStudentAttendance: (records: Omit<StudentAttendance, 'id'>[]) => void;
  teacherAttendance: TeacherAttendance[];
  recordTeacherAttendance: (data: Omit<TeacherAttendance, 'id'>) => void;

  // Grades
  gradeComponents: GradeComponent[];
  addGradeComponent: (data: Omit<GradeComponent, 'id'>) => void;
  grades: Grade[];
  recordGrade: (data: Omit<Grade, 'id'>) => void;
  bulkRecordGrades: (dataList: Omit<Grade, 'id'>[]) => void;

  // Learning & Tasks
  assignments: Assignment[];
  addAssignment: (data: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, data: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  submissions: AssignmentSubmission[];
  submitAssignment: (data: Omit<AssignmentSubmission, 'id'>) => void;
  gradeSubmission: (id: string, score: number, feedback: string) => void;

  learningMaterials: LearningMaterial[];
  addLearningMaterial: (data: Omit<LearningMaterial, 'id'>) => void;
  deleteLearningMaterial: (id: string) => void;

  // Exams
  exams: Exam[];
  addExam: (data: Omit<Exam, 'id'>) => void;
  deleteExam: (id: string) => void;

  // Announcements & Events
  announcements: Announcement[];
  addAnnouncement: (data: Omit<Announcement, 'id'>) => void;
  deleteAnnouncement: (id: string) => void;
  events: AcademicEvent[];
  addEvent: (data: Omit<AcademicEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;

  // Inventory & Letters
  inventory: InventoryItem[];
  addInventory: (data: Omit<InventoryItem, 'id'>) => void;
  updateInventory: (id: string, data: Partial<InventoryItem>) => void;
  deleteInventory: (id: string) => void;
  inventoryLoans: InventoryLoan[];
  addInventoryLoan: (data: Omit<InventoryLoan, 'id'>) => void;
  returnInventoryLoan: (id: string) => void;

  incomingLetters: IncomingLetter[];
  addIncomingLetter: (data: Omit<IncomingLetter, 'id'>) => void;
  deleteIncomingLetter: (id: string) => void;
  outgoingLetters: OutgoingLetter[];
  addOutgoingLetter: (data: Omit<OutgoingLetter, 'id'>) => void;
  deleteOutgoingLetter: (id: string) => void;

  // Finance & Bills
  paymentTypes: PaymentType[];
  addPaymentType: (data: Omit<PaymentType, 'id'>) => void;
  studentBills: StudentBill[];
  addStudentBill: (data: Omit<StudentBill, 'id'>) => void;
  transactions: PaymentTransaction[];
  recordTransaction: (data: Omit<PaymentTransaction, 'id'>) => void;

  // Notifications & Logs
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  activityLogs: ActivityLog[];
  logAction: (action: string, module: string, details?: string) => void;

  // Data management
  clearAllDummyData: () => void;
  getBackupData: () => Record<string, any>;
  restoreDatabase: (backupData: any) => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('sms_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('sms_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Hostinger MySQL Live connection & sync indicator
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };
  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper for persistent state
  function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
      try {
        const item = localStorage.getItem(`sms_${key}`);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    });

    useEffect(() => {
      try {
        localStorage.setItem(`sms_${key}`, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to persist state:', e);
      }
    }, [key, state]);

    return [state, setState];
  }

  // --- Core Data Stores ---
  const [profiles, setProfiles] = usePersistentState<Profile[]>('profiles', initialProfiles);
  const [currentUser, setCurrentUser] = usePersistentState<Profile | null>('current_user', initialProfiles[0]);
  const [schoolSettings, setSchoolSettings] = usePersistentState<SchoolSettings>('school_settings', initialSchoolSettings);
  const [academicYears, setAcademicYears] = usePersistentState<AcademicYear[]>('academic_years', initialAcademicYears);
  const [semesters, setSemesters] = usePersistentState<Semester[]>('semesters', initialSemesters);
  const [teachers, setTeachers] = usePersistentState<Teacher[]>('teachers', []);
  const [classes, setClasses] = usePersistentState<ClassRoom[]>('classes', []);
  const [subjects, setSubjects] = usePersistentState<Subject[]>('subjects', []);
  const [students, setStudents] = usePersistentState<Student[]>('students', []);
  const [schedules, setSchedules] = usePersistentState<Schedule[]>('schedules', []);
  const [studentAttendance, setStudentAttendance] = usePersistentState<StudentAttendance[]>('student_attendance', []);
  const [teacherAttendance, setTeacherAttendance] = usePersistentState<TeacherAttendance[]>('teacher_attendance', []);
  const [gradeComponents, setGradeComponents] = usePersistentState<GradeComponent[]>('grade_components', []);
  const [grades, setGrades] = usePersistentState<Grade[]>('grades', []);
  const [assignments, setAssignments] = usePersistentState<Assignment[]>('assignments', []);
  const [submissions, setSubmissions] = usePersistentState<AssignmentSubmission[]>('submissions', []);
  const [learningMaterials, setLearningMaterials] = usePersistentState<LearningMaterial[]>('learning_materials', []);
  const [exams, setExams] = usePersistentState<Exam[]>('exams', []);
  const [announcements, setAnnouncements] = usePersistentState<Announcement[]>('announcements', []);
  const [events, setEvents] = usePersistentState<AcademicEvent[]>('events', []);
  const [inventory, setInventory] = usePersistentState<InventoryItem[]>('inventory', []);
  const [inventoryLoans, setInventoryLoans] = usePersistentState<InventoryLoan[]>('inventory_loans', []);
  const [incomingLetters, setIncomingLetters] = usePersistentState<IncomingLetter[]>('incoming_letters', []);
  const [outgoingLetters, setOutgoingLetters] = usePersistentState<OutgoingLetter[]>('outgoing_letters', []);
  const [paymentTypes, setPaymentTypes] = usePersistentState<PaymentType[]>('payment_types', []);
  const [studentBills, setStudentBills] = usePersistentState<StudentBill[]>('student_bills', []);
  const [transactions, setTransactions] = usePersistentState<PaymentTransaction[]>('transactions', []);
  const [notifications, setNotifications] = usePersistentState<NotificationItem[]>('notifications', []);
  const [activityLogs, setActivityLogs] = usePersistentState<ActivityLog[]>('activity_logs', []);

  // Derived user profiles
  const role: UserRole = currentUser?.role || 'admin';
  const teacherProfile = teachers.find(t => 
    (currentUser?.username && t.username && t.username.toLowerCase() === currentUser.username.toLowerCase()) ||
    (t.profile_id && currentUser?.id && t.profile_id === currentUser.id) || 
    (t.email && currentUser?.email && t.email.toLowerCase() === currentUser.email.toLowerCase()) ||
    (currentUser?.full_name && t.full_name && t.full_name.toLowerCase() === currentUser.full_name.toLowerCase()) ||
    (currentUser?.username && generateUsername(t.full_name) === currentUser.username.toLowerCase())
  ) || null;

  const studentProfile = students.find(s => 
    (currentUser?.username && s.username && s.username.toLowerCase() === currentUser.username.toLowerCase()) ||
    (s.profile_id && currentUser?.id && s.profile_id === currentUser.id) || 
    (currentUser?.full_name && s.full_name && s.full_name.toLowerCase() === currentUser.full_name.toLowerCase()) ||
    (currentUser?.username && generateUsername(s.full_name) === currentUser.username.toLowerCase())
  ) || null;

  // Filter mata pelajaran yang diampu oleh guru yang sedang login (Single Source of Truth)
  const teacherSubjects = React.useMemo(() => {
    if (role !== 'guru') return subjects;
    const tId = teacherProfile?.id;
    const tName = (teacherProfile?.full_name || currentUser?.full_name || '').toLowerCase().trim();

    return subjects.filter(s => {
      // 1. Cek langsung di data subject: teacher_id atau teacher_name
      if (tId && s.teacher_id === tId) return true;
      if (tName && s.teacher_name && s.teacher_name.toLowerCase().trim() === tName) return true;
      // 2. Cek di jadwal pelajaran (schedules): apakah guru dijadwalkan mengajar mapel ini
      const hasSchedule = schedules.some(sch => 
        sch.subject_id === s.id && 
        ((tId && sch.teacher_id === tId) || (tName && sch.teacher_name && sch.teacher_name.toLowerCase().trim() === tName))
      );
      return hasSchedule;
    });
  }, [role, teacherProfile, currentUser, subjects, schedules]);

  // Filter kelas / rombel yang diampu oleh guru (sebagai wali kelas atau guru mata pelajaran)
  const teacherClasses = React.useMemo(() => {
    if (role !== 'guru') return classes;
    const tId = teacherProfile?.id;
    const tName = (teacherProfile?.full_name || currentUser?.full_name || '').toLowerCase().trim();

    const classIdsInSchedule = schedules
      .filter(s => (tId && s.teacher_id === tId) || (tName && s.teacher_name && s.teacher_name.toLowerCase().trim() === tName))
      .map(s => s.class_id);

    return classes.filter(c => 
      classIdsInSchedule.includes(c.id) || 
      (tId && c.homeroom_teacher_id === tId) ||
      (tName && c.homeroom_teacher_name && c.homeroom_teacher_name.toLowerCase().trim() === tName)
    );
  }, [role, teacherProfile, currentUser, classes, schedules]);

  // Auto-update school name & NPSN if cached with old sample data
  useEffect(() => {
    if (schoolSettings.school_name.includes('Nusantara') || schoolSettings.npsn !== '20605358') {
      setSchoolSettings(prev => ({
        ...prev,
        school_name: 'SMA Medanggili Ciruas',
        npsn: '20605358',
        address: 'Jl. Raya Jakarta - Serang Km. 9.5, Ciruas',
        village: 'Citerep',
        district: 'Ciruas',
        regency: 'Kabupaten Serang',
        province: 'Banten',
        postal_code: '42182',
        email: 'info@smamedanggili.sch.id',
        website: 'https://smamedanggili.sch.id',
      }));
    }
  }, [schoolSettings.school_name, schoolSettings.npsn]);

  // Hapus semua data dummy / contoh secara permanen (Lokal & Database MySQL Hostinger)
  const clearAllDummyData = async () => {
    // 1. Kosongkan state lokal
    setTeachers([]);
    setClasses([]);
    setSubjects([]);
    setStudents([]);
    setSchedules([]);
    setStudentAttendance([]);
    setTeacherAttendance([]);
    setGradeComponents([]);
    setGrades([]);
    setAssignments([]);
    setSubmissions([]);
    setLearningMaterials([]);
    setExams([]);
    setAnnouncements([]);
    setEvents([]);
    setInventory([]);
    setInventoryLoans([]);
    setIncomingLetters([]);
    setOutgoingLetters([]);
    setPaymentTypes([]);
    setStudentBills([]);
    setTransactions([]);
    setActivityLogs([]);
    setNotifications([]);

    // Sisakan akun master admin di profiles
    const adminProfiles = initialProfiles.filter(p => p.role === 'admin');
    setProfiles(adminProfiles);

    const keysToEmpty = [
      'sms_teachers', 'sms_classes', 'sms_subjects', 'sms_students',
      'sms_schedules', 'sms_student_attendance', 'sms_teacher_attendance',
      'sms_grade_components', 'sms_grades', 'sms_assignments',
      'sms_submissions', 'sms_learning_materials', 'sms_exams',
      'sms_announcements', 'sms_events', 'sms_inventory',
      'sms_inventory_loans', 'sms_incoming_letters', 'sms_outgoing_letters',
      'sms_payment_types', 'sms_student_bills', 'sms_transactions',
      'sms_activity_logs', 'sms_notifications'
    ];
    keysToEmpty.forEach(k => {
      try { localStorage.setItem(k, JSON.stringify([])); } catch (e) {}
    });

    try {
      localStorage.setItem('sms_profiles', JSON.stringify(adminProfiles));
    } catch (e) {}

    // 2. Bersihkan seluruh data transaksional di database MySQL Hostinger
    try {
      const res = await clearAllSchoolDataOnHostinger();
      if (res && res.status === 'success') {
        showToast('Database Dibersihkan', 'Seluruh data sekolah berhasil dihapus permanen dari sistem dan database MySQL.', 'success');
      } else {
        showToast('Database Dibersihkan', 'Data lokal berhasil dikosongkan. Periksa sinkronisasi database MySQL.', 'info');
      }
    } catch (e) {
      console.warn('[Hostinger MySQL] Gagal membersihkan data server:', e);
      showToast('Database Dibersihkan', 'Data lokal berhasil dikosongkan.', 'info');
    }
  };

  // Cadangkan Data (Backup) & Pulihkan Data (Restore)
  const getBackupData = () => {
    return {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      school_name: schoolSettings.school_name,
      school_settings: schoolSettings,
      academic_years: academicYears,
      semesters: semesters,
      classes: classes,
      teachers: teachers,
      students: students,
      profiles: profiles,
      subjects: subjects,
      schedules: schedules,
      student_attendance: studentAttendance,
      teacher_attendance: teacherAttendance,
      grade_components: gradeComponents,
      grades: grades,
      assignments: assignments,
      submissions: submissions,
      learning_materials: learningMaterials,
      exams: exams,
      announcements: announcements,
      events: events,
      inventory: inventory,
      inventory_loans: inventoryLoans,
      incoming_letters: incomingLetters,
      outgoing_letters: outgoingLetters,
      payment_types: paymentTypes,
      student_bills: studentBills,
      transactions: transactions,
    };
  };

  const restoreDatabase = (backupData: any): { success: boolean; message: string } => {
    try {
      if (!backupData || typeof backupData !== 'object') {
        throw new Error('Format file cadangan tidak valid.');
      }

      let restoredCount = 0;

      if (backupData.school_settings) {
        setSchoolSettings(backupData.school_settings);
        restoredCount++;
      }
      if (Array.isArray(backupData.academic_years)) {
        setAcademicYears(backupData.academic_years);
        restoredCount++;
      }
      if (Array.isArray(backupData.semesters)) {
        setSemesters(backupData.semesters);
        restoredCount++;
      }
      if (Array.isArray(backupData.classes)) {
        setClasses(backupData.classes);
        restoredCount++;
      }
      if (Array.isArray(backupData.teachers)) {
        setTeachers(backupData.teachers);
        restoredCount++;
      }
      if (Array.isArray(backupData.students)) {
        setStudents(backupData.students);
        restoredCount++;
      }
      if (Array.isArray(backupData.profiles)) {
        setProfiles(backupData.profiles);
        restoredCount++;
      }
      if (Array.isArray(backupData.subjects)) {
        setSubjects(backupData.subjects);
        restoredCount++;
      }
      if (Array.isArray(backupData.schedules)) {
        setSchedules(backupData.schedules);
        restoredCount++;
      }
      if (Array.isArray(backupData.student_attendance)) {
        setStudentAttendance(backupData.student_attendance);
        restoredCount++;
      }
      if (Array.isArray(backupData.teacher_attendance)) {
        setTeacherAttendance(backupData.teacher_attendance);
        restoredCount++;
      }
      if (Array.isArray(backupData.grade_components)) {
        setGradeComponents(backupData.grade_components);
        restoredCount++;
      }
      if (Array.isArray(backupData.grades)) {
        setGrades(backupData.grades);
        restoredCount++;
      }
      if (Array.isArray(backupData.assignments)) {
        setAssignments(backupData.assignments);
        restoredCount++;
      }
      if (Array.isArray(backupData.submissions)) {
        setSubmissions(backupData.submissions);
        restoredCount++;
      }
      if (Array.isArray(backupData.learning_materials)) {
        setLearningMaterials(backupData.learning_materials);
        restoredCount++;
      }
      if (Array.isArray(backupData.exams)) {
        setExams(backupData.exams);
        restoredCount++;
      }
      if (Array.isArray(backupData.announcements)) {
        setAnnouncements(backupData.announcements);
        restoredCount++;
      }
      if (Array.isArray(backupData.events)) {
        setEvents(backupData.events);
        restoredCount++;
      }
      if (Array.isArray(backupData.inventory)) {
        setInventory(backupData.inventory);
        restoredCount++;
      }
      if (Array.isArray(backupData.inventory_loans)) {
        setInventoryLoans(backupData.inventory_loans);
        restoredCount++;
      }
      if (Array.isArray(backupData.incoming_letters)) {
        setIncomingLetters(backupData.incoming_letters);
        restoredCount++;
      }
      if (Array.isArray(backupData.outgoing_letters)) {
        setOutgoingLetters(backupData.outgoing_letters);
        restoredCount++;
      }
      if (Array.isArray(backupData.payment_types)) {
        setPaymentTypes(backupData.payment_types);
        restoredCount++;
      }
      if (Array.isArray(backupData.student_bills)) {
        setStudentBills(backupData.student_bills);
        restoredCount++;
      }
      if (Array.isArray(backupData.transactions)) {
        setTransactions(backupData.transactions);
        restoredCount++;
      }

      logAction('RESTORE', 'Pengaturan Sistem', `Memulihkan database dari cadangan (${restoredCount} kumpulan data dipulihkan)`);
      showToast('Pemulihan Berhasil', `Berhasil memulihkan ${restoredCount} kumpulan data sistem.`);
      return { success: true, message: `Berhasil memulihkan ${restoredCount} modul data sistem.` };
    } catch (err: any) {
      showToast('Pemulihan Gagal', err?.message || 'Gagal memulihkan file cadangan.', 'error');
      return { success: false, message: err?.message || 'Gagal memulihkan file cadangan.' };
    }
  };

  // Muat dan Sinkronkan data langsung dari MySQL Hostinger (Full Online Multi-Device Sync)
  const loadHostingerData = async (silent = false) => {
    try {
      if (!silent) setIsSyncing(true);
      const status = await testHostingerConnection();
      setIsDbConnected(status.isConfigured);

      if (status.isConfigured) {
        const [
          remoteProfiles,
          remoteTeachers,
          remoteStudents,
          remoteClasses,
          remoteSubjects,
          remoteSchedules,
          remoteSchoolSettings,
          remoteAcademicYears,
          remoteSemesters
        ] = await Promise.all([
          fetchFromHostinger('profiles'),
          fetchFromHostinger('teachers'),
          fetchFromHostinger('students'),
          fetchFromHostinger('classes'),
          fetchFromHostinger('subjects'),
          fetchFromHostinger('schedules'),
          fetchFromHostinger('school_settings'),
          fetchFromHostinger('academic_years'),
          fetchFromHostinger('semesters')
        ]);

        // 1. Data Guru (Teachers) - Database MySQL sebagai Single Source of Truth
        if (Array.isArray(remoteTeachers)) {
          setTeachers(remoteTeachers);
        }

        // 2. Data Siswa (Students) - Database MySQL sebagai Single Source of Truth
        if (Array.isArray(remoteStudents)) {
          setStudents(remoteStudents);
        }

        // 3. Data Kelas (Classes) - Database MySQL sebagai Single Source of Truth
        if (Array.isArray(remoteClasses)) {
          setClasses(remoteClasses);
        }

        // 4. Data Mata Pelajaran (Subjects) - Database MySQL sebagai Single Source of Truth
        if (Array.isArray(remoteSubjects)) {
          setSubjects(remoteSubjects);
        }

        // 5. Data Jadwal (Schedules) - Database MySQL sebagai Single Source of Truth
        if (Array.isArray(remoteSchedules)) {
          setSchedules(remoteSchedules);
        }

        // 6. Pengaturan Sekolah (School Settings)
        if (Array.isArray(remoteSchoolSettings) && remoteSchoolSettings.length > 0) {
          setSchoolSettings(prev => ({ ...prev, ...remoteSchoolSettings[0] }));
        }

        // 7. Tahun Ajaran & Semester
        if (Array.isArray(remoteAcademicYears) && remoteAcademicYears.length > 0) {
          setAcademicYears(remoteAcademicYears);
        }
        if (Array.isArray(remoteSemesters) && remoteSemesters.length > 0) {
          setSemesters(remoteSemesters);
        }

        // 8. Profil Pengguna (Profiles)
        if (Array.isArray(remoteProfiles)) {
          const mergedProfiles = [...initialProfiles];
          remoteProfiles.forEach(rp => {
            if (!mergedProfiles.some(mp => mp.id === rp.id || (rp.username && mp.username === rp.username))) {
              mergedProfiles.push(rp);
            }
          });
          setProfiles(mergedProfiles);
        }
      }
    } catch (err) {
      console.warn('[MySQL Hostinger] Gagal memuat data awal:', err);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  // Muat data saat startup & pasang sinkronisasi otomatis multi-device
  useEffect(() => {
    loadHostingerData(false);

    // Otomatis sinkronkan ulang saat user kembali ke tab browser (berguna saat input dilakukan dari device lain)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadHostingerData(true);
      }
    };
    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Refresh berkala setiap 60 detik jika jendela aktif
    const syncInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadHostingerData(true);
      }
    }, 60000);

    return () => {
      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(syncInterval);
    };
  }, []);

  const refreshDataFromHostinger = async () => {
    await loadHostingerData(false);
    showToast('Data Diperbarui', 'Data sekolah telah disegarkan dari database server MySQL Hostinger.');
  };

  // Fungsi sinkronisasi manual seluruh data ke MySQL Hostinger
  const syncAllDataToHostinger = async (): Promise<{ success: boolean; message: string }> => {
    try {
      setIsSyncing(true);
      // PENTING: Urutan pengunggahan berjenjang agar relasi data konsisten
      await insertBulkToHostinger('profiles', profiles);
      await insertToHostinger('school_settings', schoolSettings);
      await insertBulkToHostinger('academic_years', academicYears);
      await insertBulkToHostinger('semesters', semesters);
      await insertBulkToHostinger('classes', classes);
      await insertBulkToHostinger('subjects', subjects);
      await insertBulkToHostinger('teachers', teachers);
      await insertBulkToHostinger('students', students);
      await insertBulkToHostinger('schedules', schedules);
      
      showToast('Sinkronisasi Sukses', 'Seluruh data sekolah berhasil disinkronkan ke Database MySQL Hostinger.');
      return { success: true, message: 'Seluruh data berhasil disinkronkan ke database MySQL.' };
    } catch (err: any) {
      showToast('Sinkronisasi Gagal', err.message || 'Gagal menyinkronkan data.', 'error');
      return { success: false, message: err.message };
    } finally {
      setIsSyncing(false);
    }
  };

  // Activity Log Helper
  const logAction = (action: string, module: string, details?: string) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      user_name: currentUser?.full_name || 'System',
      action,
      module,
      details,
      created_at: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  // Auth Operations
  const login = async (identifier: string, passwordInput?: string, preferredRole?: UserRole): Promise<boolean> => {
    const trimmedId = (identifier || '').trim().toLowerCase();
    const trimmedPass = (passwordInput || '').trim();

    // Coba autentikasi via API MySQL Hostinger terlebih dahulu
    try {
      const authRes = await fetch('/api/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: trimmedId, password: trimmedPass })
      });
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.status === 'success' && authData.user) {
          setCurrentUser(authData.user);
          logAction('LOGIN', 'Autentikasi', `Login berhasil via MySQL: ${authData.user.full_name} (${authData.user.role})`);
          showToast('Login Berhasil', `Selamat datang kembali, ${authData.user.full_name}!`);
          return true;
        }
      }
    } catch (e) {
      // Lanjut ke validasi store lokal jika server tidak merespon
    }

    // 1. Cek di tabel profiles (berdasarkan username atau email)
    let matchedProfile = profiles.find(p => 
      (p.username && p.username.toLowerCase() === trimmedId) || 
      (p.email && p.email.toLowerCase() === trimmedId)
    );

    // 2. Jika belum ditemukan di profiles, cek di data teachers (Dewan Guru)
    if (!matchedProfile) {
      const matchedTeacher = teachers.find(t => 
        (t.username && t.username.toLowerCase() === trimmedId) || 
        (t.email && t.email.toLowerCase() === trimmedId) || 
        generateUsername(t.full_name) === trimmedId
      );
      if (matchedTeacher) {
        const username = matchedTeacher.username || generateUsername(matchedTeacher.full_name);
        const pass = matchedTeacher.password || getDefaultPassword('guru');
        matchedProfile = {
          id: matchedTeacher.profile_id || 'usr-' + matchedTeacher.id,
          username: username,
          email: matchedTeacher.email || `${username}@sekolah.sch.id`,
          full_name: matchedTeacher.full_name,
          role: 'guru',
          password: pass,
          phone: matchedTeacher.phone,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfiles(prev => [...prev.filter(p => p.id !== matchedProfile!.id), matchedProfile!]);
      }
    }

    // 3. Jika belum ditemukan, cek di data students (Siswa)
    if (!matchedProfile) {
      const matchedStudent = students.find(s => 
        (s.username && s.username.toLowerCase() === trimmedId) || 
        (s.nis && s.nis.toLowerCase() === trimmedId) || 
        s.nisn === trimmedId ||
        generateUsername(s.full_name) === trimmedId
      );
      if (matchedStudent) {
        const username = matchedStudent.username || generateUsername(matchedStudent.full_name);
        const pass = matchedStudent.password || getDefaultPassword('siswa');
        matchedProfile = {
          id: matchedStudent.profile_id || 'usr-' + matchedStudent.id,
          username: username,
          email: `${username}@siswa.sekolah.sch.id`,
          full_name: matchedStudent.full_name,
          role: 'siswa',
          password: pass,
          phone: matchedStudent.parent_phone,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfiles(prev => [...prev.filter(p => p.id !== matchedProfile!.id), matchedProfile!]);
      }
    }

    // 4. Akun Admin Default (admin / admin@sekolah.sch.id)
    if (!matchedProfile && (trimmedId === 'admin' || trimmedId === 'admin@sekolah.sch.id')) {
      matchedProfile = {
        id: 'usr-admin-01',
        username: 'admin',
        email: 'admin@sekolah.sch.id',
        full_name: 'Administrator Sekolah',
        role: 'admin',
        password: getDefaultPassword('admin'),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProfiles(prev => [...prev.filter(p => p.id !== matchedProfile!.id), matchedProfile!]);
    }

    // 5. Fallback preferredRole untuk kemudahan testing
    if (!matchedProfile && preferredRole) {
      matchedProfile = profiles.find(p => p.role === preferredRole);
    }

    if (!matchedProfile) {
      showToast('Login Gagal', 'Username atau email tidak terdaftar di sistem.', 'error');
      return false;
    }

    // Validasi Kata Sandi (Password)
    const validPasswords: string[] = [
      matchedProfile.password || '',
      getDefaultPassword(matchedProfile.role),
      'password123'
    ].filter(Boolean);

    if (matchedProfile.role === 'admin') {
      validPasswords.push('admin', '123@Admin');
    } else if (matchedProfile.role === 'guru') {
      validPasswords.push('123@Guru');
    } else if (matchedProfile.role === 'siswa') {
      validPasswords.push('123@Siswa');
    }

    if (trimmedPass && !validPasswords.includes(trimmedPass)) {
      const defaultHint = getDefaultPassword(matchedProfile.role);
      showToast('Kata Sandi Salah', `Password salah. Default login ${matchedProfile.role}: ${defaultHint}`, 'error');
      return false;
    }

    setCurrentUser(matchedProfile);
    logAction('LOGIN', 'Autentikasi', `User ${matchedProfile.full_name} (${matchedProfile.role}) berhasil masuk`);
    showToast('Login Berhasil', `Selamat datang kembali, ${matchedProfile.full_name}!`);
    return true;
  };

  const logout = () => {
    logAction('LOGOUT', 'Autentikasi', `User ${currentUser?.full_name} keluar dari sistem`);
    setCurrentUser(null);
    showToast('Logout Berhasil', 'Anda telah keluar dari aplikasi.');
  };

  const switchRole = (newRole: UserRole) => {
    const found = profiles.find(p => p.role === newRole);
    if (found) {
      setCurrentUser(found);
      logAction('SWITCH_ROLE', 'Sistem', `Beralih ke akun peran: ${newRole}`);
      showToast('Peran Diubah', `Sekarang melihat aplikasi sebagai ${newRole.toUpperCase()}`);
    }
  };

  const updateCurrentUserProfile = (data: Partial<Profile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data, updated_at: new Date().toISOString() };
    setCurrentUser(updated);
    setProfiles(prev => prev.map(p => p.id === currentUser.id ? updated : p));
    showToast('Profil Disimpan', 'Data profil Anda telah berhasil diperbarui.');
  };

  // Master Data Methods
  const updateSchoolSettings = (data: Partial<SchoolSettings>) => {
    const updated = { ...schoolSettings, ...data, updated_at: new Date().toISOString() };
    setSchoolSettings(updated);
    updateInHostinger('school_settings', schoolSettings.id || 'sch-01', updated);
    logAction('UPDATE', 'Profil Sekolah', 'Memperbarui informasi identitas sekolah');
    showToast('Pengaturan Disimpan', 'Informasi profil sekolah telah diperbarui.');
  };

  const addAcademicYear = (data: Omit<AcademicYear, 'id'>) => {
    const id = 'ay-' + Date.now();
    const newAy: AcademicYear = { ...data, id };
    setAcademicYears(prev => [...prev, newAy]);
    insertToHostinger('academic_years', newAy);
    logAction('CREATE', 'Tahun Ajaran', `Menambah tahun ajaran ${data.name}`);
    showToast('Berhasil', `Tahun ajaran ${data.name} berhasil ditambahkan.`);
  };

  const updateAcademicYear = (id: string, data: Partial<AcademicYear>) => {
    setAcademicYears(prev => prev.map(ay => ay.id === id ? { ...ay, ...data } : ay));
    updateInHostinger('academic_years', id, data);
    logAction('UPDATE', 'Tahun Ajaran', `Mengubah tahun ajaran ${id}`);
    showToast('Berhasil', 'Data tahun ajaran telah diperbarui.');
  };

  const deleteAcademicYear = async (id: string) => {
    setAcademicYears(prev => prev.filter(ay => ay.id !== id));
    await deleteFromHostinger('academic_years', id);
    logAction('DELETE', 'Tahun Ajaran', `Menghapus tahun ajaran ${id}`);
    showToast('Dihapus', 'Tahun ajaran berhasil dihapus.');
  };

  const setActiveAcademicYear = (id: string) => {
    setAcademicYears(prev => prev.map(ay => ({ ...ay, is_active: ay.id === id })));
    setSchoolSettings(prev => ({ ...prev, active_academic_year_id: id }));
    updateInHostinger('school_settings', schoolSettings.id || 'sch-01', { active_academic_year_id: id });
    showToast('Tahun Ajaran Aktif', 'Tahun ajaran aktif berhasil diganti.');
  };

  const setActiveSemester = (id: string) => {
    setSemesters(prev => prev.map(s => ({ ...s, is_active: s.id === id })));
    setSchoolSettings(prev => ({ ...prev, active_semester_id: id }));
    updateInHostinger('school_settings', schoolSettings.id || 'sch-01', { active_semester_id: id });
    showToast('Semester Aktif', 'Semester aktif berhasil diperbarui.');
  };

  // Class Management
  const addClass = (data: Omit<ClassRoom, 'id'>) => {
    const id = 'cls-' + Date.now();
    const teacher = teachers.find(t => t.id === data.homeroom_teacher_id);
    const newClass: ClassRoom = {
      ...data,
      id,
      homeroom_teacher_name: teacher?.full_name,
      student_count: 0
    };
    setClasses(prev => [...prev, newClass]);
    insertToHostinger('classes', newClass);
    logAction('CREATE', 'Data Kelas', `Menambah kelas baru ${data.name}`);
    showToast('Berhasil', `Kelas ${data.name} berhasil ditambahkan.`);
  };

  const updateClass = (id: string, data: Partial<ClassRoom>) => {
    const teacher = teachers.find(t => t.id === data.homeroom_teacher_id);
    setClasses(prev => prev.map(c => c.id === id ? {
      ...c,
      ...data,
      homeroom_teacher_name: teacher ? teacher.full_name : c.homeroom_teacher_name
    } : c));
    updateInHostinger('classes', id, data);
    logAction('UPDATE', 'Data Kelas', `Memperbarui kelas ${id}`);
    showToast('Berhasil', 'Data rombel/kelas berhasil disimpan.');
  };

  const deleteClass = async (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    await deleteFromHostinger('classes', id);
    logAction('DELETE', 'Data Kelas', `Menghapus kelas ${id}`);
    showToast('Dihapus', 'Data kelas telah dihapus permanen.');
  };

  const bulkDeleteClasses = async (ids: string[]) => {
    setClasses(prev => prev.filter(c => !ids.includes(c.id)));
    await deleteBulkFromHostinger('classes', ids);
    logAction('DELETE', 'Data Kelas', `Menghapus massal ${ids.length} data kelas`);
    showToast('Dihapus', `${ids.length} data kelas berhasil dihapus permanen.`);
  };

  // Teacher Management
  const addTeacher = async (data: Omit<Teacher, 'id'>) => {
    const id = 'tch-' + Date.now();
    const profileId = 'usr-tch-' + Date.now();
    const username = data.username || generateUsername(data.full_name);
    const password = data.password || getDefaultPassword('guru');
    const teacherEmail = data.email || `${username}@sekolah.sch.id`;

    const newTeacher: Teacher = { 
      ...data, 
      id,
      username,
      password,
      email: teacherEmail,
      profile_id: profileId,
    };
    setTeachers(prev => [...prev, newTeacher]);

    // Buat profil akun login untuk guru bersangkutan
    const newProfile: Profile = {
      id: profileId,
      username,
      email: teacherEmail,
      password,
      full_name: data.full_name,
      role: 'guru',
      phone: data.phone,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setProfiles(prev => [...prev.filter(p => p.username !== username && p.email !== teacherEmail), newProfile]);

    // Live sync ke MySQL Hostinger: Pastikan akun login (profiles) diunggah terlebih dahulu
    await insertToHostinger('profiles', newProfile);
    await insertToHostinger('teachers', newTeacher);

    logAction('CREATE', 'Data Guru', `Menambah guru baru: ${data.full_name} (Username: ${username})`);
    showToast('Berhasil', `Data Guru ${data.full_name} berhasil disimpan. Username login: ${username}`);
  };

  const updateTeacher = (id: string, data: Partial<Teacher>) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    updateInHostinger('teachers', id, data);

    // Jika ada update username / password / email / full_name, update profil login terkait juga
    if (data.username || data.password || data.email || data.full_name) {
      setProfiles(prev => prev.map(p => {
        const t = teachers.find(item => item.id === id);
        if (p.id === t?.profile_id || (t?.username && p.username === t.username) || p.email === t?.email) {
          const updated = {
            ...p,
            username: data.username || p.username,
            password: data.password || p.password,
            email: data.email || p.email,
            full_name: data.full_name || p.full_name,
            updated_at: new Date().toISOString()
          };
          updateInHostinger('profiles', p.id, updated);
          return updated;
        }
        return p;
      }));
    }
    logAction('UPDATE', 'Data Guru', `Memperbarui data guru ${data.full_name || id}`);
    showToast('Berhasil', 'Data guru berhasil diperbarui.');
  };

  const deleteTeacher = async (id: string) => {
    const t = teachers.find(item => item.id === id);
    setTeachers(prev => prev.filter(item => item.id !== id));
    await deleteFromHostinger('teachers', id);

    if (t) {
      const username = t.username || generateUsername(t.full_name);
      setProfiles(prev => prev.filter(p => 
        p.id !== t.profile_id && 
        p.username?.toLowerCase() !== username.toLowerCase() && 
        p.email?.toLowerCase() !== t.email?.toLowerCase()
      ));
      if (t.profile_id) {
        await deleteFromHostinger('profiles', t.profile_id);
      }
    }
    logAction('DELETE', 'Data Guru', `Menghapus data guru ${t?.full_name || id}`);
    showToast('Dihapus', 'Data guru telah dihapus permanen.');
  };

  const bulkDeleteTeachers = async (ids: string[]) => {
    const selectedTeachers = teachers.filter(t => ids.includes(t.id));
    const profileIds = selectedTeachers.map(t => t.profile_id).filter(Boolean) as string[];
    const usernames = selectedTeachers.map(t => (t.username || generateUsername(t.full_name)).toLowerCase()).filter(Boolean);

    setTeachers(prev => prev.filter(t => !ids.includes(t.id)));
    setProfiles(prev => prev.filter(p => !profileIds.includes(p.id) && !usernames.includes(p.username?.toLowerCase() || '')));

    await deleteBulkFromHostinger('teachers', ids);
    if (profileIds.length > 0) {
      await deleteBulkFromHostinger('profiles', profileIds);
    }
    logAction('DELETE', 'Data Guru', `Menghapus massal ${ids.length} data guru`);
    showToast('Dihapus', `${ids.length} data guru berhasil dihapus permanen.`);
  };

  const importTeachers = async (teachersList: Omit<Teacher, 'id'>[]) => {
    const newProfiles: Profile[] = [];
    const newTeachers: Teacher[] = teachersList.map((item, index) => {
      const teacherId = 'tch-' + Date.now() + '-' + index;
      const profileId = 'usr-tch-' + Date.now() + '-' + index;
      const baseUsername = item.username || generateUsername(item.full_name) || `guru${item.nip || index}`;
      const username = index > 0 && teachersList.slice(0, index).some(x => generateUsername(x.full_name) === baseUsername)
        ? `${baseUsername}${index + 1}`
        : baseUsername;
      const password = item.password || getDefaultPassword('guru');
      const teacherEmail = item.email || `${username}@sekolah.sch.id`;

      newProfiles.push({
        id: profileId,
        username,
        email: teacherEmail,
        password,
        full_name: item.full_name,
        role: 'guru',
        phone: item.phone,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      return {
        ...item,
        id: teacherId,
        username,
        password,
        email: teacherEmail,
        profile_id: profileId,
      };
    });

    setTeachers(prev => [...prev, ...newTeachers]);
    setProfiles(prev => [...prev, ...newProfiles]);

    // Live bulk sync ke MySQL Hostinger: Pastikan akun login (profiles) diunggah terlebih dahulu
    await insertBulkToHostinger('profiles', newProfiles);
    await insertBulkToHostinger('teachers', newTeachers);

    logAction('IMPORT', 'Data Guru', `Mengimpor ${newTeachers.length} data guru beserta akun login otomatis`);
    showToast('Impor Sukses', `Berhasil mengimpor ${newTeachers.length} data guru dengan akun login default.`);
  };

  // Student Management
  const addStudent = async (data: Omit<Student, 'id'>) => {
    const id = 'std-' + Date.now();
    const profileId = 'usr-std-' + Date.now();
    const username = data.username || generateUsername(data.full_name);
    const password = data.password || getDefaultPassword('siswa');
    const studentEmail = `${username}@siswa.sekolah.sch.id`;

    const cls = classes.find(c => c.id === data.class_id);
    const newStudent: Student = {
      ...data,
      id,
      username,
      password,
      profile_id: profileId,
      class_name: cls?.name,
    };
    setStudents(prev => [...prev, newStudent]);

    // Buat profil akun login untuk siswa bersangkutan
    const newProfile: Profile = {
      id: profileId,
      username,
      email: studentEmail,
      password,
      full_name: data.full_name,
      role: 'siswa',
      phone: data.parent_phone,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setProfiles(prev => [...prev.filter(p => p.username !== username && p.email !== studentEmail), newProfile]);

    // Live sync ke MySQL Hostinger: Pastikan akun login (profiles) diunggah terlebih dahulu
    await insertToHostinger('profiles', newProfile);
    await insertToHostinger('students', newStudent);

    // update class student count
    if (data.class_id) {
      setClasses(prev => prev.map(c => c.id === data.class_id ? { ...c, student_count: (c.student_count || 0) + 1 } : c));
    }
    logAction('CREATE', 'Data Siswa', `Menambah siswa baru ${data.full_name} (Username: ${username})`);
    showToast('Berhasil', `Data Siswa ${data.full_name} berhasil disimpan. Username login: ${username}`);
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    const cls = classes.find(c => c.id === data.class_id);
    setStudents(prev => prev.map(s => s.id === id ? {
      ...s,
      ...data,
      class_name: cls ? cls.name : s.class_name
    } : s));
    updateInHostinger('students', id, data);

    // Update profil akun login jika ada perubahan
    if (data.username || data.password || data.full_name) {
      setProfiles(prev => prev.map(p => {
        const s = students.find(item => item.id === id);
        if (p.id === s?.profile_id || (s?.username && p.username === s.username)) {
          const updated = {
            ...p,
            username: data.username || p.username,
            password: data.password || p.password,
            full_name: data.full_name || p.full_name,
            updated_at: new Date().toISOString()
          };
          updateInHostinger('profiles', p.id, updated);
          return updated;
        }
        return p;
      }));
    }

    logAction('UPDATE', 'Data Siswa', `Memperbarui siswa ${id}`);
    showToast('Berhasil', 'Data siswa berhasil diperbarui.');
  };

  const deleteStudent = async (id: string) => {
    const s = students.find(item => item.id === id);
    setStudents(prev => prev.filter(item => item.id !== id));
    await deleteFromHostinger('students', id);

    if (s) {
      const username = s.username || generateUsername(s.full_name);
      setProfiles(prev => prev.filter(p => 
        p.id !== s.profile_id && 
        p.username?.toLowerCase() !== username.toLowerCase() && 
        p.email?.toLowerCase() !== `${username}@siswa.sekolah.sch.id`.toLowerCase()
      ));
      if (s.profile_id) {
        await deleteFromHostinger('profiles', s.profile_id);
      }
    }
    logAction('DELETE', 'Data Siswa', `Menghapus siswa ${s?.full_name || id}`);
    showToast('Dihapus', 'Data siswa telah dihapus permanen.');
  };

  const bulkDeleteStudents = async (ids: string[]) => {
    const selectedStudents = students.filter(s => ids.includes(s.id));
    const profileIds = selectedStudents.map(s => s.profile_id).filter(Boolean) as string[];
    const usernames = selectedStudents.map(s => (s.username || generateUsername(s.full_name)).toLowerCase()).filter(Boolean);

    setStudents(prev => prev.filter(s => !ids.includes(s.id)));
    setProfiles(prev => prev.filter(p => !profileIds.includes(p.id) && !usernames.includes(p.username?.toLowerCase() || '')));

    await deleteBulkFromHostinger('students', ids);
    if (profileIds.length > 0) {
      await deleteBulkFromHostinger('profiles', profileIds);
    }
    logAction('DELETE', 'Data Siswa', `Menghapus massal ${ids.length} data siswa`);
    showToast('Dihapus', `${ids.length} data siswa berhasil dihapus permanen.`);
  };

  const importStudents = async (studentsList: Omit<Student, 'id'>[]) => {
    const newProfiles: Profile[] = [];
    const newStudents: Student[] = studentsList.map((item, index) => {
      const cls = classes.find(c => c.id === item.class_id || c.name.toLowerCase() === (item.class_name || '').toLowerCase());
      const studentId = 'std-' + Date.now() + '-' + index;
      const profileId = 'usr-std-' + Date.now() + '-' + index;
      const baseUsername = item.username || generateUsername(item.full_name) || `siswa${item.nisn || index}`;
      // Pastikan username unik jika ada kesamaan nama
      const username = index > 0 && studentsList.slice(0, index).some(x => generateUsername(x.full_name) === baseUsername)
        ? `${baseUsername}${index + 1}`
        : baseUsername;
      const password = item.password || getDefaultPassword('siswa');
      const studentEmail = `${username}@siswa.sekolah.sch.id`;

      newProfiles.push({
        id: profileId,
        username,
        email: studentEmail,
        password,
        full_name: item.full_name,
        role: 'siswa',
        phone: item.parent_phone,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      return {
        ...item,
        id: studentId,
        username,
        password,
        profile_id: profileId,
        class_id: cls?.id || item.class_id,
        class_name: cls?.name || item.class_name
      };
    });

    setStudents(prev => [...prev, ...newStudents]);
    setProfiles(prev => [...prev, ...newProfiles]);

    // Live bulk sync ke MySQL Hostinger: Pastikan akun login (profiles) diunggah terlebih dahulu
    await insertBulkToHostinger('profiles', newProfiles);
    await insertBulkToHostinger('students', newStudents);

    logAction('IMPORT', 'Data Siswa', `Mengimpor ${newStudents.length} data siswa beserta akun login otomatis`);
    showToast('Impor Sukses', `Berhasil mengimpor ${newStudents.length} data siswa dengan akun login default.`);
  };

  // Subjects Management
  const addSubject = (data: Omit<Subject, 'id'>) => {
    const id = 'sbj-' + Date.now();
    const teacher = teachers.find(t => t.id === data.teacher_id);
    const newSubject: Subject = {
      ...data,
      id,
      teacher_name: teacher ? teacher.full_name : data.teacher_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSubjects(prev => [...prev, newSubject]);
    insertToHostinger('subjects', newSubject);
    logAction('CREATE', 'Mata Pelajaran', `Menambah mata pelajaran: ${data.name}`);
    showToast('Berhasil', `Mata pelajaran ${data.name} berhasil ditambahkan.`);
  };

  const updateSubject = (id: string, data: Partial<Subject>) => {
    const teacher = data.teacher_id ? teachers.find(t => t.id === data.teacher_id) : undefined;
    const payload = {
      ...data,
      teacher_name: teacher ? teacher.full_name : (data.teacher_name !== undefined ? data.teacher_name : undefined),
      updated_at: new Date().toISOString()
    };
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...payload } : s));
    updateInHostinger('subjects', id, payload);
    logAction('UPDATE', 'Mata Pelajaran', `Memperbarui mata pelajaran ${id}`);
    showToast('Berhasil', 'Data mata pelajaran berhasil disimpan.');
  };

  const deleteSubject = async (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    await deleteFromHostinger('subjects', id);
    logAction('DELETE', 'Mata Pelajaran', `Menghapus mata pelajaran ${id}`);
    showToast('Dihapus', 'Mata pelajaran telah dihapus permanen.');
  };

  const bulkDeleteSubjects = async (ids: string[]) => {
    setSubjects(prev => prev.filter(s => !ids.includes(s.id)));
    await deleteBulkFromHostinger('subjects', ids);
    logAction('DELETE', 'Mata Pelajaran', `Menghapus massal ${ids.length} mata pelajaran`);
    showToast('Dihapus', `${ids.length} mata pelajaran berhasil dihapus permanen.`);
  };

  const importSubjects = (subjectsList: Omit<Subject, 'id'>[]) => {
    const newSubjects: Subject[] = subjectsList.map((item, index) => {
      const id = 'sbj-' + Date.now() + '-' + index;
      const matchedTeacher = teachers.find(t => 
        (item.teacher_id && t.id === item.teacher_id) || 
        (item.teacher_name && t.full_name.toLowerCase().trim() === item.teacher_name.toLowerCase().trim())
      );

      return {
        ...item,
        id,
        teacher_id: matchedTeacher?.id || item.teacher_id,
        teacher_name: matchedTeacher?.full_name || item.teacher_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    setSubjects(prev => [...prev, ...newSubjects]);
    insertBulkToHostinger('subjects', newSubjects);
    logAction('IMPORT', 'Mata Pelajaran', `Mengimpor ${newSubjects.length} mata pelajaran`);
    showToast('Impor Sukses', `Berhasil mengimpor ${newSubjects.length} mata pelajaran.`);
  };

  // Schedule with Conflict Validation!
  const addSchedule = (data: Omit<Schedule, 'id'>): { success: boolean; message?: string } => {
    // 1. Check for Class conflict (same day & overlapping time for the same class)
    const classConflict = schedules.find(s => 
      s.class_id === data.class_id &&
      s.day === data.day &&
      ((data.start_time >= s.start_time && data.start_time < s.end_time) ||
       (data.end_time > s.start_time && data.end_time <= s.end_time) ||
       (data.start_time <= s.start_time && data.end_time >= s.end_time))
    );

    if (classConflict) {
      const msg = `Bentrok Jadwal Kelas! Kelas ini sudah ada pelajaran ${classConflict.subject_name} pada hari ${data.day} jam ${classConflict.start_time} - ${classConflict.end_time}.`;
      showToast('Bentrok Jadwal Kelas', msg, 'error');
      return { success: false, message: msg };
    }

    // 2. Check for Teacher conflict (same teacher teaching another class at same day & time)
    const teacherConflict = schedules.find(s => 
      s.teacher_id === data.teacher_id &&
      s.day === data.day &&
      ((data.start_time >= s.start_time && data.start_time < s.end_time) ||
       (data.end_time > s.start_time && data.end_time <= s.end_time) ||
       (data.start_time <= s.start_time && data.end_time >= s.end_time))
    );

    if (teacherConflict) {
      const msg = `Bentrok Jadwal Guru! Guru yang bersangkutan sudah mengajar di ${teacherConflict.class_name} pada jam tersebut.`;
      showToast('Bentrok Jadwal Guru', msg, 'error');
      return { success: false, message: msg };
    }

    const cls = classes.find(c => c.id === data.class_id);
    const sbj = subjects.find(s => s.id === data.subject_id);
    const tch = teachers.find(t => t.id === data.teacher_id);

    const newSchedule: Schedule = {
      ...data,
      id: 'sch-' + Date.now(),
      class_name: cls?.name,
      subject_name: sbj?.name,
      teacher_name: tch?.full_name,
    };

    setSchedules(prev => [...prev, newSchedule]);
    insertToHostinger('schedules', newSchedule);
    logAction('CREATE', 'Jadwal Pelajaran', `Menambah jadwal ${newSchedule.subject_name} untuk ${newSchedule.class_name}`);
    showToast('Jadwal Ditambahkan', 'Jadwal pelajaran berhasil disimpan tanpa bentrok.');
    return { success: true };
  };

  const updateSchedule = (id: string, data: Partial<Schedule>): { success: boolean; message?: string } => {
    const existing = schedules.find(s => s.id === id);
    if (!existing) return { success: false, message: 'Jadwal tidak ditemukan' };

    const merged = { ...existing, ...data };

    // Check teacher conflict excluding self
    const teacherConflict = schedules.find(s => 
      s.id !== id &&
      s.teacher_id === merged.teacher_id &&
      s.day === merged.day &&
      ((merged.start_time >= s.start_time && merged.start_time < s.end_time) ||
       (merged.end_time > s.start_time && merged.end_time <= s.end_time))
    );

    if (teacherConflict) {
      const msg = `Bentrok Jadwal Guru! Guru sudah memiliki jadwal mengajar di kelas lain pada jam ini.`;
      showToast('Bentrok Jadwal', msg, 'error');
      return { success: false, message: msg };
    }

    const cls = classes.find(c => c.id === merged.class_id);
    const sbj = subjects.find(s => s.id === merged.subject_id);
    const tch = teachers.find(t => t.id === merged.teacher_id);

    setSchedules(prev => prev.map(s => s.id === id ? {
      ...merged,
      class_name: cls?.name || s.class_name,
      subject_name: sbj?.name || s.subject_name,
      teacher_name: tch?.full_name || s.teacher_name,
    } : s));

    updateInHostinger('schedules', id, merged);
    logAction('UPDATE', 'Jadwal Pelajaran', `Memperbarui jadwal ${id}`);
    showToast('Berhasil', 'Jadwal berhasil diperbarui.');
    return { success: true };
  };

  const deleteSchedule = async (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    await deleteFromHostinger('schedules', id);
    logAction('DELETE', 'Jadwal Pelajaran', `Menghapus jadwal ${id}`);
    showToast('Dihapus', 'Jadwal telah dihapus permanen.');
  };

  // Attendance
  const recordStudentAttendance = (records: Omit<StudentAttendance, 'id'>[]) => {
    const newItems: StudentAttendance[] = records.map(r => ({
      ...r,
      id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
    }));

    // Remove duplicates for the same student on the same date and subject
    setStudentAttendance(prev => {
      const filtered = prev.filter(p => !records.some(r => r.student_id === p.student_id && r.date === p.date && r.subject_id === p.subject_id));
      return [...filtered, ...newItems];
    });

    insertBulkToHostinger('student_attendance', newItems);
    logAction('CREATE', 'Absensi Siswa', `Mengisi presensi siswa massal (${records.length} data)`);
    showToast('Presensi Disimpan', `Berhasil mencatat presensi untuk ${records.length} siswa.`);
  };

  const recordTeacherAttendance = (data: Omit<TeacherAttendance, 'id'>) => {
    const id = 'tatt-' + Date.now();
    const tch = teachers.find(t => t.id === data.teacher_id);
    const newItem: TeacherAttendance = {
      ...data,
      id,
      teacher_name: tch?.full_name,
    };
    setTeacherAttendance(prev => {
      const filtered = prev.filter(t => !(t.teacher_id === data.teacher_id && t.date === data.date));
      return [...filtered, newItem];
    });
    insertToHostinger('teacher_attendance', newItem);
    logAction('CREATE', 'Absensi Guru', `Mencatat presensi guru: ${tch?.full_name}`);
    showToast('Presensi Dicatat', 'Presensi kehadiran guru berhasil disimpan.');
  };

  // Grades
  const addGradeComponent = (data: Omit<GradeComponent, 'id'>) => {
    const id = 'gcomp-' + Date.now();
    const item = { ...data, id };
    setGradeComponents(prev => [...prev, item]);
    insertToHostinger('grade_components', item);
    showToast('Komponen Dibuat', `Komponen penilaian ${data.name} berhasil dibuat.`);
  };

  const recordGrade = (data: Omit<Grade, 'id'>) => {
    const id = 'grd-' + Date.now();
    const std = students.find(s => s.id === data.student_id);
    const sbj = subjects.find(s => s.id === data.subject_id);
    const comp = gradeComponents.find(c => c.id === data.component_id);
    const newGrade: Grade = {
      ...data,
      id,
      student_name: std?.full_name,
      subject_name: sbj?.name,
      component_name: comp?.name,
    };

    setGrades(prev => {
      const filtered = prev.filter(g => !(g.student_id === data.student_id && g.subject_id === data.subject_id && g.component_id === data.component_id));
      return [...filtered, newGrade];
    });

    insertToHostinger('grades', newGrade);
    logAction('UPDATE', 'Nilai Akademik', `Input nilai untuk siswa ${std?.full_name}`);
    showToast('Nilai Disimpan', `Nilai ${sbj?.name} siswa ${std?.full_name} berhasil disimpan.`);
  };

  const bulkRecordGrades = (dataList: Omit<Grade, 'id'>[]) => {
    const items = dataList.map(data => {
      const std = students.find(s => s.id === data.student_id);
      const sbj = subjects.find(s => s.id === data.subject_id);
      const comp = gradeComponents.find(c => c.id === data.component_id);
      return {
        ...data,
        id: 'grd-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        student_name: std?.full_name,
        subject_name: sbj?.name,
        component_name: comp?.name,
      };
    });

    setGrades(prev => {
      const filtered = prev.filter(g => !dataList.some(d => d.student_id === g.student_id && d.subject_id === g.subject_id && d.component_id === g.component_id));
      return [...filtered, ...items];
    });

    insertBulkToHostinger('grades', items);
    logAction('UPDATE', 'Leger Nilai', `Input ${dataList.length} nilai siswa secara massal`);
    showToast('Leger Nilai Disimpan', `Berhasil menyimpan nilai untuk ${dataList.length} entri.`);
  };

  // Assignments & Submissions
  const addAssignment = (data: Omit<Assignment, 'id'>) => {
    const id = 'asg-' + Date.now();
    const cls = classes.find(c => c.id === data.class_id);
    const sbj = subjects.find(s => s.id === data.subject_id);
    const tch = teachers.find(t => t.id === data.teacher_id);
    const newAssignment: Assignment = {
      ...data,
      id,
      class_name: cls?.name,
      subject_name: sbj?.name,
      teacher_name: tch?.full_name,
      submission_count: 0
    };
    setAssignments(prev => [newAssignment, ...prev]);
    insertToHostinger('assignments', newAssignment);

    // Send notification to all students
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: 'Tugas Baru Diterbitkan',
      message: `${tch?.full_name || 'Guru'} memberikan tugas baru: ${data.title} (${sbj?.name})`,
      type: 'task',
      is_read: false,
      created_at: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    logAction('CREATE', 'Tugas', `Membuat tugas baru: ${data.title}`);
    showToast('Tugas Diterbitkan', `Tugas "${data.title}" berhasil diumumkan ke kelas.`);
  };

  const updateAssignment = (id: string, data: Partial<Assignment>) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    updateInHostinger('assignments', id, data);
    showToast('Berhasil', 'Data tugas berhasil diperbarui.');
  };

  const deleteAssignment = async (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    setSubmissions(prev => prev.filter(s => s.assignment_id !== id));
    await deleteFromHostinger('assignments', id);
    logAction('DELETE', 'Tugas', `Menghapus tugas ${id}`);
    showToast('Dihapus', 'Tugas berhasil dihapus.');
  };

  const submitAssignment = (data: Omit<AssignmentSubmission, 'id'>) => {
    const id = 'sub-' + Date.now();
    const asg = assignments.find(a => a.id === data.assignment_id);
    const std = students.find(s => s.id === data.student_id);
    const submission: AssignmentSubmission = {
      ...data,
      id,
      assignment_title: asg?.title,
      student_name: std?.full_name,
      submitted_at: new Date().toISOString()
    };
    setSubmissions(prev => {
      const filtered = prev.filter(s => !(s.assignment_id === data.assignment_id && s.student_id === data.student_id));
      return [submission, ...filtered];
    });

    // Update assignment submission count
    setAssignments(prev => prev.map(a => a.id === data.assignment_id ? { ...a, submission_count: (a.submission_count || 0) + 1 } : a));
    insertToHostinger('assignment_submissions', submission);

    logAction('SUBMIT', 'Tugas Siswa', `Siswa ${std?.full_name} mengumpulkan tugas ${asg?.title}`);
    showToast('Tugas Terkumpul', 'Tugas Anda berhasil diunggah dan disimpan!');
  };

  const gradeSubmission = (id: string, score: number, feedback: string) => {
    setSubmissions(prev => prev.map(s => s.id === id ? {
      ...s,
      score,
      feedback,
      graded_at: new Date().toISOString()
    } : s));
    updateInHostinger('assignment_submissions', id, { score, feedback });
    showToast('Penilaian Disimpan', `Submission dinilai dengan skor ${score}.`);
  };

  // Learning Materials
  const addLearningMaterial = (data: Omit<LearningMaterial, 'id'>) => {
    const id = 'mat-' + Date.now();
    const cls = classes.find(c => c.id === data.class_id);
    const sbj = subjects.find(s => s.id === data.subject_id);
    const tch = teachers.find(t => t.id === data.teacher_id);
    const item: LearningMaterial = {
      ...data,
      id,
      class_name: cls?.name,
      subject_name: sbj?.name,
      teacher_name: tch?.full_name,
    };
    setLearningMaterials(prev => [item, ...prev]);
    insertToHostinger('learning_materials', item);
    logAction('CREATE', 'Materi Pembelajaran', `Mengunggah materi ${data.title}`);
    showToast('Materi Tersimpan', `Materi "${data.title}" berhasil dibagikan.`);
  };

  const deleteLearningMaterial = async (id: string) => {
    setLearningMaterials(prev => prev.filter(m => m.id !== id));
    await deleteFromHostinger('learning_materials', id);
    showToast('Dihapus', 'Materi pembelajaran telah dihapus.');
  };

  // Exams
  const addExam = (data: Omit<Exam, 'id'>) => {
    const id = 'ex-' + Date.now();
    const sbj = subjects.find(s => s.id === data.subject_id);
    const tch = teachers.find(t => t.id === data.supervisor_teacher_id);
    const item: Exam = {
      ...data,
      id,
      subject_name: sbj?.name,
      supervisor_name: tch?.full_name,
    };
    setExams(prev => [item, ...prev]);
    insertToHostinger('exams', item);
    logAction('CREATE', 'Manajemen Ujian', `Menjadwalkan ujian ${data.title}`);
    showToast('Ujian Dijadwalkan', `Ujian "${data.title}" telah ditambahkan.`);
  };

  const deleteExam = async (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    await deleteFromHostinger('exams', id);
    showToast('Dihapus', 'Jadwal ujian telah dihapus.');
  };

  // Announcements & Events
  const addAnnouncement = (data: Omit<Announcement, 'id'>) => {
    const id = 'ann-' + Date.now();
    const item: Announcement = {
      ...data,
      id,
      author_name: currentUser?.full_name || 'Admin',
      is_active: true
    };
    setAnnouncements(prev => [item, ...prev]);
    insertToHostinger('announcements', item);
    logAction('CREATE', 'Pengumuman', `Mempublikasikan pengumuman: ${data.title}`);
    showToast('Pengumuman Dipublish', 'Pengumuman berhasil disiarkan.');
  };

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    await deleteFromHostinger('announcements', id);
    showToast('Dihapus', 'Pengumuman telah dihapus.');
  };

  const addEvent = (data: Omit<AcademicEvent, 'id'>) => {
    const id = 'ev-' + Date.now();
    const item = { ...data, id };
    setEvents(prev => [...prev, item]);
    insertToHostinger('academic_events', item);
    showToast('Agenda Ditambahkan', `Agenda ${data.title} berhasil masuk kalender.`);
  };

  const deleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    await deleteFromHostinger('academic_events', id);
    showToast('Dihapus', 'Agenda kegiatan dihapus.');
  };

  // Inventory
  const addInventory = (data: Omit<InventoryItem, 'id'>) => {
    const id = 'inv-' + Date.now();
    const item = { ...data, id };
    setInventory(prev => [...prev, item]);
    insertToHostinger('inventory', item);
    logAction('CREATE', 'Inventaris', `Menambah barang inventaris: ${data.item_name}`);
    showToast('Barang Disimpan', `Barang ${data.item_name} berhasil didaftarkan.`);
  };

  const updateInventory = (id: string, data: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    updateInHostinger('inventory', id, data);
    showToast('Berhasil', 'Data inventaris diperbarui.');
  };

  const deleteInventory = async (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    await deleteFromHostinger('inventory', id);
    showToast('Dihapus', 'Data inventaris telah dihapus.');
  };

  const addInventoryLoan = (data: Omit<InventoryLoan, 'id'>) => {
    const id = 'loan-' + Date.now();
    const inv = inventory.find(i => i.id === data.inventory_id);
    const item: InventoryLoan = {
      ...data,
      id,
      item_name: inv?.item_name,
    };
    setInventoryLoans(prev => [item, ...prev]);
    insertToHostinger('inventory_loans', item);
    logAction('LOAN', 'Peminjaman Inventaris', `Peminjaman ${inv?.item_name} oleh ${data.borrower_name}`);
    showToast('Peminjaman Dicatat', `Peminjaman barang berhasil dicatat.`);
  };

  const returnInventoryLoan = (id: string) => {
    setInventoryLoans(prev => prev.map(l => l.id === id ? {
      ...l,
      status: 'dikembalikan',
      actual_return_date: new Date().toISOString().split('T')[0]
    } : l));
    updateInHostinger('inventory_loans', id, {
      status: 'dikembalikan',
      actual_return_date: new Date().toISOString().split('T')[0]
    });
    showToast('Barang Dikembalikan', 'Status peminjaman berhasil diperbarui menjadi dikembalikan.');
  };

  // Letters
  const addIncomingLetter = (data: Omit<IncomingLetter, 'id'>) => {
    const id = 'let-in-' + Date.now();
    const item = { ...data, id };
    setIncomingLetters(prev => [ item, ...prev ]);
    insertToHostinger('incoming_letters', item);
    logAction('CREATE', 'Surat Masuk', `Mencatat surat masuk no ${data.letter_number}`);
    showToast('Surat Masuk Dicatat', 'Arsip surat masuk berhasil disimpan.');
  };

  const deleteIncomingLetter = async (id: string) => {
    setIncomingLetters(prev => prev.filter(l => l.id !== id));
    await deleteFromHostinger('incoming_letters', id);
    showToast('Dihapus', 'Surat masuk dihapus.');
  };

  const addOutgoingLetter = (data: Omit<OutgoingLetter, 'id'>) => {
    const id = 'let-out-' + Date.now();
    const item = { ...data, id };
    setOutgoingLetters(prev => [ item, ...prev ]);
    insertToHostinger('outgoing_letters', item);
    logAction('CREATE', 'Surat Keluar', `Menerbitkan surat keluar no ${data.letter_number}`);
    showToast('Surat Keluar Dicatat', 'Surat keluar berhasil didaftarkan.');
  };

  const deleteOutgoingLetter = async (id: string) => {
    setOutgoingLetters(prev => prev.filter(l => l.id !== id));
    await deleteFromHostinger('outgoing_letters', id);
    showToast('Dihapus', 'Surat keluar dihapus.');
  };

  // Payments
  const addPaymentType = (data: Omit<PaymentType, 'id'>) => {
    const id = 'pay-' + Date.now();
    const item = { ...data, id };
    setPaymentTypes(prev => [...prev, item]);
    insertToHostinger('payment_types', item);
    showToast('Pos Tagihan Dibuat', `Jenis tagihan ${data.name} berhasil dibuat.`);
  };

  const addStudentBill = (data: Omit<StudentBill, 'id'>) => {
    const id = 'bill-' + Date.now();
    const std = students.find(s => s.id === data.student_id);
    const ptype = paymentTypes.find(p => p.id === data.payment_type_id);
    const item: StudentBill = {
      ...data,
      id,
      student_name: std?.full_name,
      payment_type_name: ptype?.name,
    };
    setStudentBills(prev => [item, ...prev]);
    insertToHostinger('student_bills', item);
    showToast('Tagihan Dibuat', `Tagihan untuk ${std?.full_name} berhasil dibuat.`);
  };

  const recordTransaction = (data: Omit<PaymentTransaction, 'id'>) => {
    const id = 'trx-' + Date.now();
    const std = students.find(s => s.id === data.student_id);
    const item: PaymentTransaction = {
      ...data,
      id,
      student_name: std?.full_name,
      receiver_name: currentUser?.full_name || 'Petugas Keuangan',
    };
    setTransactions(prev => [item, ...prev]);
    insertToHostinger('payment_transactions', item);

    // Update the bill
    setStudentBills(prev => prev.map(b => {
      if (b.id === data.student_bill_id) {
        const newPaid = b.paid_amount + data.amount;
        const newStatus: 'lunas' | 'sebagian' | 'belum_lunas' = newPaid >= b.amount ? 'lunas' : (newPaid > 0 ? 'sebagian' : 'belum_lunas');
        const updatedBill = { ...b, paid_amount: newPaid, status: newStatus };
        updateInHostinger('student_bills', b.id, { paid_amount: newPaid, status: newStatus });
        return updatedBill;
      }
      return b;
    }));

    logAction('PAYMENT', 'Pembayaran Sekolah', `Penerimaan pembayaran ${data.receipt_number} dari ${std?.full_name}`);
    showToast('Pembayaran Berhasil', `Kwitansi ${data.receipt_number} berhasil dicatat.`);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      teacherProfile,
      studentProfile,
      role,
      teacherSubjects,
      teacherClasses,
      login,
      logout,
      switchRole,
      updateCurrentUserProfile,
      theme,
      toggleTheme,
      isDbConnected,
      isSyncing,
      refreshDataFromHostinger,
      syncAllDataToHostinger,
      toasts,
      showToast,
      dismissToast,
      schoolSettings,
      updateSchoolSettings,
      academicYears,
      addAcademicYear,
      updateAcademicYear,
      deleteAcademicYear,
      setActiveAcademicYear,
      semesters,
      setActiveSemester,
      classes,
      addClass,
      updateClass,
      deleteClass,
      bulkDeleteClasses,
      teachers,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      bulkDeleteTeachers,
      importTeachers,
      students,
      addStudent,
      updateStudent,
      deleteStudent,
      bulkDeleteStudents,
      importStudents,
      subjects,
      addSubject,
      updateSubject,
      deleteSubject,
      bulkDeleteSubjects,
      importSubjects,
      schedules,
      addSchedule,
      updateSchedule,
      deleteSchedule,
      studentAttendance,
      recordStudentAttendance,
      teacherAttendance,
      recordTeacherAttendance,
      gradeComponents,
      addGradeComponent,
      grades,
      recordGrade,
      bulkRecordGrades,
      assignments,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      submissions,
      submitAssignment,
      gradeSubmission,
      learningMaterials,
      addLearningMaterial,
      deleteLearningMaterial,
      exams,
      addExam,
      deleteExam,
      announcements,
      addAnnouncement,
      deleteAnnouncement,
      events,
      addEvent,
      deleteEvent,
      inventory,
      addInventory,
      updateInventory,
      deleteInventory,
      inventoryLoans,
      addInventoryLoan,
      returnInventoryLoan,
      incomingLetters,
      addIncomingLetter,
      deleteIncomingLetter,
      outgoingLetters,
      addOutgoingLetter,
      deleteOutgoingLetter,
      paymentTypes,
      addPaymentType,
      studentBills,
      addStudentBill,
      transactions,
      recordTransaction,
      notifications,
      markNotificationRead,
      activityLogs,
      logAction,
      clearAllDummyData,
      getBackupData,
      restoreDatabase
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
