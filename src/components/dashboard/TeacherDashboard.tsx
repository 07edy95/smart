import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../common/StatsCard';
import { 
  BookOpen, DoorOpen, Users, ClipboardCheck, 
  Award, Clock, CheckCircle, FileText, Plus, Sparkles 
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const TeacherDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { 
    currentUser, teacherProfile, schedules, classes, 
    students, assignments, submissions, announcements 
  } = useApp();

  const teacherName = teacherProfile?.full_name || currentUser?.full_name || 'Bapak/Ibu Guru';

  // Classes taught by this teacher
  const teacherSchedules = schedules.filter(s => 
    s.teacher_name === teacherName || 
    (teacherProfile && s.teacher_id === teacherProfile.id)
  );

  const myClassIds = Array.from(new Set(teacherSchedules.map(s => s.class_id)));
  const myClasses = classes.filter(c => myClassIds.includes(c.id) || c.homeroom_teacher_name === teacherName);
  const myStudents = students.filter(s => myClassIds.includes(s.class_id || ''));

  // Assignments created by this teacher
  const myAssignments = assignments.filter(a => a.teacher_name === teacherName);
  const mySubmissions = submissions.filter(s => 
    myAssignments.some(a => a.id === s.assignment_id)
  );
  const pendingReviewSubmissions = mySubmissions.filter(s => s.score === undefined || s.score === null);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="clay-card p-6 sm:p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>SMART — Portal Layanan Pendidik</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {teacherName}!
          </h2>
          <p className="text-sm text-emerald-100 mt-2 leading-relaxed">
            NIP: {teacherProfile?.nip || '-'} • {teacherProfile?.position || 'Guru Mata Pelajaran'}
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => onNavigate('attendance')}
              className="px-4 py-2 rounded-xl bg-white text-emerald-700 font-bold text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition-all active:scale-95"
            >
              Input Presensi Siswa
            </button>
            <button
              onClick={() => onNavigate('grades')}
              className="px-4 py-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-800/80 text-white border border-white/20 font-bold text-xs sm:text-sm transition-all active:scale-95"
            >
              Kelola Nilai Siswa
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Kelas yang Diampu"
          value={myClasses.length}
          subtitle="Rombongan Belajar"
          icon={DoorOpen}
          variant="mint"
          onClick={() => onNavigate('teacher-classes')}
        />
        <StatsCard
          title="Total Siswa Didik"
          value={myStudents.length}
          subtitle="Siswa Aktif"
          icon={Users}
          variant="blue"
          onClick={() => onNavigate('teacher-classes')}
        />
        <StatsCard
          title="Tugas & Penugasan"
          value={myAssignments.length}
          subtitle="Tugas Terbit"
          icon={BookOpen}
          variant="lavender"
          onClick={() => onNavigate('assignments')}
        />
        <StatsCard
          title="Perlu Dinilai"
          value={pendingReviewSubmissions.length}
          subtitle="Tugas siswa masuk"
          icon={Award}
          variant="peach"
          trend={{ value: `${pendingReviewSubmissions.length} Menunggu` }}
          onClick={() => onNavigate('assignments')}
        />
      </div>

      {/* Today's Teaching Schedule & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule List */}
        <div className="lg:col-span-2 clay-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Jadwal Mengajar Anda
            </h3>
            <button
              onClick={() => onNavigate('schedules')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Lihat Kalender Lengkap
            </button>
          </div>

          <div className="space-y-3">
            {teacherSchedules.length > 0 ? (
              teacherSchedules.map((sch) => (
                <div
                  key={sch.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {sch.day}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {sch.subject_name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {sch.class_name} • {sch.room || 'Ruang Kelas'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <span className="px-3 py-1 rounded-full bg-blue-100/70 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold text-xs">
                      {sch.start_time} - {sch.end_time}
                    </span>
                    <button
                      onClick={() => onNavigate('attendance')}
                      className="clay-btn-primary text-xs py-1.5 px-3"
                    >
                      Presensi
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                Belum ada jadwal mengajar yang terdaftar untuk akun ini.
              </div>
            )}
          </div>
        </div>

        {/* Pending Submissions / Tasks */}
        <div className="clay-card p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-500" />
            Pengumpulan Tugas Terbaru
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {mySubmissions.length > 0 ? (
              mySubmissions.slice(0, 5).map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {sub.student_name}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        sub.score !== undefined
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {sub.score !== undefined ? `Nilai: ${sub.score}` : 'Belum Dinilai'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    {sub.assignment_title}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {formatDate(sub.submitted_at)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-xs text-slate-400">
                Belum ada tugas yang dikumpulkan siswa.
              </p>
            )}
          </div>

          <button
            onClick={() => onNavigate('assignments')}
            className="w-full clay-btn-secondary text-xs py-2 mt-2"
          >
            Lihat Semua Tugas & Pengumpulan
          </button>
        </div>
      </div>
    </div>
  );
};
