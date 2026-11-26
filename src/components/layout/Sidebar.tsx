import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, School, Calendar, Users, GraduationCap, 
  DoorOpen, BookOpen, Clock, ClipboardCheck, Award, 
  FileText, BookMarked, Megaphone, Boxes, Mail, 
  CreditCard, BarChart3, Settings, ChevronLeft, ChevronRight,
  LogOut, ShieldCheck, UserCheck, BookOpenCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { role, currentUser, logout, schoolSettings, academicYears, semesters } = useApp();

  const activeAcademicYear = academicYears.find(a => a.is_active);
  const activeSemester = semesters.find(s => s.is_active);

  // Navigation Items depending on Role
  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'school-profile', label: 'Profil Sekolah', icon: School },
        { id: 'academic-year', label: 'Tahun & Semester', icon: Calendar },
        { id: 'teachers', label: 'Data Guru', icon: Users },
        { id: 'students', label: 'Data Siswa', icon: GraduationCap },
        { id: 'classes', label: 'Rombel / Kelas', icon: DoorOpen },
        { id: 'subjects', label: 'Mata Pelajaran', icon: BookOpen },
        { id: 'schedules', label: 'Jadwal Pelajaran', icon: Clock },
        { id: 'attendance', label: 'Manajemen Absensi', icon: ClipboardCheck },
        { id: 'grades', label: 'Manajemen Nilai', icon: Award },
        { id: 'assignments', label: 'Tugas & Materi', icon: BookMarked },
        { id: 'exams', label: 'Manajemen Ujian', icon: FileText },
        { id: 'announcements', label: 'Pengumuman & Agenda', icon: Megaphone },
        { id: 'inventory', label: 'Inventaris Sekolah', icon: Boxes },
        { id: 'letters', label: 'Administrasi Surat', icon: Mail },
        { id: 'payments', label: 'Pembayaran / SPP', icon: CreditCard },
        { id: 'reports', label: 'Laporan & Rekap', icon: BarChart3 },
        { id: 'settings', label: 'Pengaturan Sistem', icon: Settings },
      ];
    }

    if (role === 'guru') {
      return [
        { id: 'dashboard', label: 'Dashboard Guru', icon: LayoutDashboard },
        { id: 'teacher-classes', label: 'Kelas & Siswa Diampu', icon: DoorOpen },
        { id: 'schedules', label: 'Jadwal Mengajar', icon: Clock },
        { id: 'attendance', label: 'Input Presensi Siswa', icon: ClipboardCheck },
        { id: 'grades', label: 'Input Nilai Siswa', icon: Award },
        { id: 'assignments', label: 'Kelola Tugas & Nilai', icon: BookMarked },
        { id: 'materials', label: 'Materi Pembelajaran', icon: BookOpen },
        { id: 'exams', label: 'Kelola Ujian', icon: FileText },
        { id: 'announcements', label: 'Pengumuman Kelas', icon: Megaphone },
        { id: 'reports', label: 'Rekap Laporan', icon: BarChart3 },
        { id: 'my-profile', label: 'Profil & Password', icon: UserCheck },
      ];
    }

    // Siswa items
    return [
      { id: 'dashboard', label: 'Dashboard Siswa', icon: LayoutDashboard },
      { id: 'my-class', label: 'Informasi Kelas', icon: DoorOpen },
      { id: 'schedules', label: 'Jadwal Pelajaran', icon: Clock },
      { id: 'my-attendance', label: 'Presensi Pribadi', icon: ClipboardCheck },
      { id: 'my-grades', label: 'Nilai & Rapor', icon: Award },
      { id: 'assignments', label: 'Tugas & Kumpul Tugas', icon: BookMarked },
      { id: 'materials', label: 'Materi Pelajaran', icon: BookOpen },
      { id: 'exams', label: 'Jadwal & Hasil Ujian', icon: FileText },
      { id: 'my-bills', label: 'Tagihan SPP', icon: CreditCard },
      { id: 'announcements', label: 'Pengumuman Sekolah', icon: Megaphone },
      { id: 'my-profile', label: 'Profil Siswa', icon: GraduationCap },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-[#1C2541] border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* App Logo & Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 p-1 flex-shrink-0 shadow-md flex items-center justify-center border border-slate-100 dark:border-slate-700">
              <img src="/logo.png" alt="Logo SMA Medanggili Ciruas" className="w-full h-full object-contain" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-blue-600 dark:text-blue-400 tracking-wider">SMART</span>
                </div>
                <h1 className="font-extrabold text-xs text-slate-900 dark:text-white tracking-tight truncate">
                  {schoolSettings?.school_name || 'SMA Medanggili Ciruas'}
                </h1>
                <p className="text-[9px] text-slate-400 truncate">
                  Satu Pintu Layanan Digital
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Role Indicator Pill */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/50">
            <div className="clay-inset p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  role === 'admin' ? 'bg-amber-500' : role === 'guru' ? 'bg-emerald-500' : 'bg-blue-500'
                }`} />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Peran: {role}
                </span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-500 font-medium">
                Aktif
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Feature Card - Status Tahun Ajaran & Semester Aktif */}
        {!isCollapsed && (
          <div className="px-3 pb-2">
            <div className="rounded-2xl p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-800/80 dark:to-slate-800/50 border border-blue-100/90 dark:border-slate-700/80 shadow-sm space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  ★
                </div>
                <p className="text-xs font-extrabold text-blue-900 dark:text-blue-300">
                  TA {activeAcademicYear?.name || '2025/2026'} Aktif
                </p>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 pl-8 leading-tight">
                Semester {activeSemester?.name || 'Ganjil'}
              </p>
            </div>
          </div>
        )}

        {/* User Card & Logout at Bottom */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border border-white dark:border-slate-700 flex-shrink-0"
              />
              {!isCollapsed && (
                <div className="truncate text-left">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {currentUser?.full_name || 'Pengguna'}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize truncate">
                    {currentUser?.role || 'Guest'}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
