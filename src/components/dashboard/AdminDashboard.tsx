import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../common/StatsCard';
import { 
  Users, GraduationCap, DoorOpen, BookOpen, 
  CheckCircle, Clock, AlertTriangle, Calendar, 
  Bell, Activity, TrendingUp, Sparkles 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { formatDate } from '../../utils/helpers';

export const AdminDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { 
    students, teachers, classes, subjects, 
    studentAttendance, teacherAttendance, announcements, 
    events, activityLogs, schoolSettings 
  } = useApp();

  // Statistics calculation
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const totalSubjects = subjects.length;

  const maleStudents = students.filter(s => s.gender === 'L').length;
  const femaleStudents = students.filter(s => s.gender === 'P').length;

  // Class distribution data
  const classData = classes.map(c => ({
    name: c.name.replace('Kelas ', ''),
    total: students.filter(s => s.class_id === c.id).length || c.student_count || 0,
  }));

  // Gender donut chart data
  const genderData = [
    { name: 'Laki-laki', value: maleStudents, color: '#3B82F6' },
    { name: 'Perempuan', value: femaleStudents, color: '#EC4899' },
  ];

  // Attendance statistics
  const presentCount = studentAttendance.filter(a => a.status === 'hadir').length;
  const sickCount = studentAttendance.filter(a => a.status === 'sakit').length;
  const permissionCount = studentAttendance.filter(a => a.status === 'izin').length;
  const absentCount = studentAttendance.filter(a => a.status === 'alpa').length;
  const totalAtt = studentAttendance.length || 1;
  const attendanceRate = Math.round((presentCount / totalAtt) * 100);

  // Monthly attendance trend sample for chart
  const monthlyAttendanceData = [
    { bulan: 'Jul', hadir: 96, izin: 3, sakit: 1 },
    { bulan: 'Ags', hadir: 95, izin: 4, sakit: 1 },
    { bulan: 'Sep', hadir: 97, izin: 2, sakit: 1 },
    { bulan: 'Okt', hadir: 94, izin: 4, sakit: 2 },
    { bulan: 'Nov', hadir: 98, izin: 1, sakit: 1 },
  ];

  // Soft Pastel Colors for Capsule Bars (matching reference image)
  const PASTEL_BAR_COLORS = [
    '#FACBC0', // Soft Peach
    '#FCE6B3', // Soft Amber
    '#BCE9D1', // Soft Mint
    '#FCA5A5', // Soft Coral
    '#A7F3D0', // Soft Teal
    '#BAE6FD', // Soft Sky Blue
    '#DDD6FE', // Soft Lavender
    '#FED7AA', // Soft Orange
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner in Soft 3D Claymorphic (Reflecting uploaded reference style) */}
      <div className="rounded-[28px] p-6 sm:p-8 bg-[#FDECE2] dark:bg-[#2A1D18] border border-[#FADACD] dark:border-[#422C24] shadow-[8px_10px_24px_rgba(225,185,175,0.35),-5px_-5px_15px_rgba(255,255,255,0.9)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 dark:bg-white/10 text-xs font-bold text-[#9A3423] dark:text-rose-300 mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>SMART — Satu Pintu Layanan Digital</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#5C1D13] dark:text-white tracking-tight">
            Selamat Pagi, Administrator! ☀️
          </h2>
          <p className="text-xs sm:text-sm text-[#8C3A2B] dark:text-slate-300 mt-2 leading-relaxed font-medium">
            Satu Pintu Layanan Digital untuk Guru, Siswa, dan Tata Kelola Sekolah. Kelola seluruh administrasi {schoolSettings.school_name} secara responsif dan terpadu.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => onNavigate('attendance')}
              className="clay-pill-coral"
            >
              <span>▶ Input Presensi Hari Ini</span>
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="clay-pill-teal"
            >
              <span>Data Siswa</span>
            </button>
          </div>
        </div>

        {/* 3D Decorative School Emblem Container */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white/90 dark:bg-slate-800/90 p-3 shadow-[6px_8px_18px_rgba(0,0,0,0.06),inset_2px_2px_4px_rgba(255,255,255,0.9)] flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF7A50] to-[#FCE6B3] flex items-center justify-center shadow-md">
              <GraduationCap className="w-9 h-9 text-white stroke-[2.2]" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Stats 4 Cards in Claymorphic Pastel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Siswa"
          value={totalStudents}
          subtitle={`${maleStudents} Laki-laki, ${femaleStudents} Perempuan`}
          icon={GraduationCap}
          variant="mint"
          trend={{ value: '+18% Aktif' }}
          onClick={() => onNavigate('students')}
        />
        <StatsCard
          title="Total Guru & Staf"
          value={totalTeachers}
          subtitle="Pendidik bersertifikasi"
          icon={Users}
          variant="peach"
          trend={{ value: '+8 Hadir' }}
          onClick={() => onNavigate('teachers')}
        />
        <StatsCard
          title="Rombongan Belajar"
          value={totalClasses}
          subtitle="Tingkat X, XI, XII"
          icon={DoorOpen}
          variant="amber"
          trend={{ value: '100% Aktif' }}
          onClick={() => onNavigate('classes')}
        />
        <StatsCard
          title="Mata Pelajaran"
          value={totalSubjects}
          subtitle="Wajib & Peminatan"
          icon={BookOpen}
          variant="blue"
          trend={{ value: 'Kurikulum Merdeka' }}
          onClick={() => onNavigate('subjects')}
        />
      </div>

      {/* Interactive Charts Section with 3D Soft Aesthetic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Capsule Bar Chart: Siswa per Kelas */}
        <div className="lg:col-span-2 clay-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Jumlah Siswa Berdasarkan Kelas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribusi kapasitas rombongan belajar
              </p>
            </div>
            <button
              onClick={() => onNavigate('classes')}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors shadow-sm"
            >
              Lihat Detail ⌵
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', background: '#1E293B', color: '#fff', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} 
                />
                <Bar dataKey="total" radius={[14, 14, 14, 14]}>
                  {classData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PASTEL_BAR_COLORS[index % PASTEL_BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Komposisi Gender */}
        <div className="clay-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Rasio Gender Siswa
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perbandingan siswa Laki-laki & Perempuan
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={6}
                  dataKey="value"
                >
                  <Cell fill="#60A5FA" />
                  <Cell fill="#F472B6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#60A5FA]" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Laki-laki</span>
              </div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{maleStudents} Siswa ({Math.round((maleStudents/(totalStudents||1))*100)}%)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-pink-50/70 dark:bg-pink-950/30">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F472B6]" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Perempuan</span>
              </div>
              <span className="text-xs font-bold text-pink-700 dark:text-pink-300">{femaleStudents} Siswa ({Math.round((femaleStudents/(totalStudents||1))*100)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kehadiran & Monthly Trend */}
        <div className="lg:col-span-2 clay-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Statistik Absensi & Presensi Siswa
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tingkat kehadiran rata-rata sekolah
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              {attendanceRate}% Rata-rata Kehadiran
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="clay-inset p-3 text-center">
              <p className="text-xs text-slate-500 font-medium">Hadir</p>
              <p className="text-xl font-bold text-emerald-600">{presentCount}</p>
            </div>
            <div className="clay-inset p-3 text-center">
              <p className="text-xs text-slate-500 font-medium">Sakit</p>
              <p className="text-xl font-bold text-amber-500">{sickCount}</p>
            </div>
            <div className="clay-inset p-3 text-center">
              <p className="text-xs text-slate-500 font-medium">Izin</p>
              <p className="text-xl font-bold text-blue-500">{permissionCount}</p>
            </div>
            <div className="clay-inset p-3 text-center">
              <p className="text-xs text-slate-500 font-medium">Alpa</p>
              <p className="text-xl font-bold text-rose-500">{absentCount}</p>
            </div>
          </div>

          {/* Monthly Trend Area Chart */}
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyAttendanceData}>
                <defs>
                  <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="#10B981" stop-opacity={0.3}/>
                    <stop offset="95%" stop-color="#10B981" stop-opacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="bulan" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[80, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="hadir" stroke="#10B981" fillOpacity={1} fill="url(#colorHadir)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Announcements & Events */}
        <div className="space-y-6">
          {/* Announcements Card */}
          <div className="clay-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                Pengumuman Terbaru
              </h3>
              <button
                onClick={() => onNavigate('announcements')}
                className="text-xs text-blue-600 hover:underline"
              >
                Semua
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto">
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{a.title}</h5>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{a.content}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{formatDate(a.published_date)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Events */}
          <div className="clay-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Agenda Kegiatan
              </h3>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {events.slice(0, 3).map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex flex-col items-center justify-center font-bold text-xs flex-shrink-0">
                    <span>{e.event_date.split('-')[2]}</span>
                    <span className="text-[9px] uppercase font-normal">{e.event_date.split('-')[1]}</span>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{e.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{e.description || 'Kegiatan sekolah'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log Bar */}
      <div className="clay-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Riwayat Aktivitas Terakhir
          </h3>
          <span className="text-xs text-slate-400">Pembaruan realtime</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-44 overflow-y-auto">
          {activityLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-600 dark:text-slate-300">
                  {log.action}
                </span>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-white">{log.user_name}</span>
                  <span className="text-slate-500 ml-1.5">{log.details}</span>
                </div>
              </div>
              <span className="text-slate-400 text-[10px] flex-shrink-0 ml-2">
                {formatDate(log.created_at)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Floating Soft 3D Banner (Inspired by reference footer) */}
      <div className="rounded-[24px] p-4 sm:p-5 bg-[#DCEEE8] dark:bg-[#153429] border border-[#C6E4DA] dark:border-[#1E4A3A] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[6px_8px_18px_rgba(165,205,185,0.35)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#56B8AB] text-white flex items-center justify-center shadow-md flex-shrink-0">
            <Sparkles className="w-5 h-5 text-yellow-200" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#1B4332] dark:text-emerald-200">
              Tips & Pembaruan Sistem ✨
            </h4>
            <p className="text-xs text-[#2D6A4F] dark:text-emerald-300/80">
              Pastikan seluruh nilai formatif dan presensi semester ini telah direkapitulasi sebelum cetak rapor.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('reports')}
          className="clay-pill-teal text-xs whitespace-nowrap"
        >
          <span>Eksplorasi Laporan</span>
        </button>
      </div>
    </div>
  );
};
