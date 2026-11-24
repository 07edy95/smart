import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../common/StatsCard';
import { 
  GraduationCap, Clock, BookOpen, Award, 
  CreditCard, CheckCircle2, AlertCircle, FileText, 
  Send, Sparkles 
} from 'lucide-react';
import { formatDate, formatRupiah } from '../../utils/helpers';

export const StudentDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { 
    currentUser, studentProfile, classes, schedules, 
    assignments, submissions, grades, studentAttendance, 
    studentBills 
  } = useApp();

  const studentName = studentProfile?.full_name || currentUser?.full_name || 'Siswa Berprestasi';
  const myClassId = studentProfile?.class_id || classes[0]?.id;
  const myClass = classes.find(c => c.id === myClassId);

  // My Attendance
  const myAttendance = studentAttendance.filter(a => 
    a.student_name === studentName || 
    (studentProfile && a.student_id === studentProfile.id)
  );
  const myHadir = myAttendance.filter(a => a.status === 'hadir').length;
  const mySakit = myAttendance.filter(a => a.status === 'sakit').length;
  const myIzin = myAttendance.filter(a => a.status === 'izin').length;
  const myAlpa = myAttendance.filter(a => a.status === 'alpa').length;
  const totalAtt = myAttendance.length;
  const attendanceRate = totalAtt > 0 ? Math.round((myHadir / totalAtt) * 100) : 100;

  // My Assignments
  const myAssignments = assignments.filter(a => a.class_id === myClassId || !a.class_id);
  const mySubmissions = submissions.filter(s => 
    s.student_name === studentName || 
    (studentProfile && s.student_id === studentProfile.id)
  );
  const submittedAssignmentIds = mySubmissions.map(s => s.assignment_id);
  const pendingAssignments = myAssignments.filter(a => !submittedAssignmentIds.includes(a.id));

  // My Grades
  const myGrades = grades.filter(g => 
    g.student_name === studentName || 
    (studentProfile && g.student_id === studentProfile.id)
  );
  const averageGrade = myGrades.length > 0
    ? Math.round(myGrades.reduce((sum, g) => sum + g.score, 0) / myGrades.length)
    : 0;

  // My Bills
  const myBills = studentBills.filter(b => 
    b.student_name === studentName || 
    (studentProfile && b.student_id === studentProfile.id)
  );
  const unpaidBills = myBills.filter(b => b.status !== 'lunas');

  // Schedules for my class
  const mySchedules = schedules.filter(s => s.class_id === myClassId);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="clay-card p-6 sm:p-8 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>SMART — Portal Layanan Siswa</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Semangat Belajar, {studentName}!
          </h2>
          <p className="text-sm text-blue-100 mt-2 leading-relaxed">
            {myClass ? myClass.name : 'Kelas Belum Ditentukan'} • NISN: {studentProfile?.nisn || '-'} • Wali Kelas: {myClass?.homeroom_teacher_name || '-'}
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => onNavigate('assignments')}
              className="px-4 py-2 rounded-xl bg-white text-blue-700 font-bold text-xs sm:text-sm shadow-md hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Kumpulkan Tugas
            </button>
            <button
              onClick={() => onNavigate('schedules')}
              className="px-4 py-2 rounded-xl bg-blue-900/60 hover:bg-blue-900/80 text-white border border-white/20 font-bold text-xs sm:text-sm transition-all active:scale-95"
            >
              Cek Jadwal Hari Ini
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Kehadiran Siswa"
          value={totalAtt > 0 ? `${attendanceRate}%` : '100%'}
          subtitle={`${myHadir} Hadir, ${mySakit} Sakit, ${myIzin} Izin`}
          icon={CheckCircle2}
          variant="mint"
          trend={{ value: 'Tertib' }}
          onClick={() => onNavigate('my-attendance')}
        />
        <StatsCard
          title="Rata-rata Nilai"
          value={myGrades.length > 0 ? averageGrade : '-'}
          subtitle="Semester Berjalan"
          icon={Award}
          variant="blue"
          trend={{ value: myGrades.length > 0 ? (averageGrade >= 75 ? 'Tuntas KKM' : 'Perlu Bimbingan') : 'Belum Ada Nilai' }}
          onClick={() => onNavigate('my-grades')}
        />
        <StatsCard
          title="Tugas Belum Dikumpul"
          value={pendingAssignments.length}
          subtitle="Segera selesaikan"
          icon={BookOpen}
          variant="peach"
          trend={{ value: `${pendingAssignments.length} Menunggu`, isPositive: pendingAssignments.length === 0 }}
          onClick={() => onNavigate('assignments')}
        />
        <StatsCard
          title="Status Tagihan SPP"
          value={unpaidBills.length === 0 ? 'LUNAS' : `${unpaidBills.length} Belum`}
          subtitle={unpaidBills.length === 0 ? 'Semua tagihan lunas' : formatRupiah(unpaidBills.reduce((s, b) => s + (b.amount - b.paid_amount), 0))}
          icon={CreditCard}
          variant={unpaidBills.length === 0 ? 'mint' : 'amber'}
          onClick={() => onNavigate('my-bills')}
        />
      </div>

      {/* My Schedules & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jadwal Pelajaran Kelas */}
        <div className="lg:col-span-2 clay-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Jadwal Pelajaran Kelas Anda
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-semibold dark:bg-blue-900/30 dark:text-blue-300">
              {myClass?.name}
            </span>
          </div>

          <div className="space-y-3">
            {mySchedules.length > 0 ? (
              mySchedules.map((sch) => (
                <div
                  key={sch.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {sch.day}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {sch.subject_name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {sch.teacher_name} • {sch.room || 'Ruang Kelas'}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold">
                    {sch.start_time} - {sch.end_time}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-xs text-slate-400">Jadwal belum tersedia untuk kelas ini.</p>
            )}
          </div>
        </div>

        {/* Tugas Yang Harus Dikerjakan */}
        <div className="clay-card p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Tugas Menunggu Dikumpul
          </h3>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {pendingAssignments.length > 0 ? (
              pendingAssignments.map((asg) => (
                <div
                  key={asg.id}
                  className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30"
                >
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {asg.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {asg.description}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-200/40 text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                    <span>Deadline: {formatDate(asg.due_date)}</span>
                    <button
                      onClick={() => onNavigate('assignments')}
                      className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold"
                    >
                      Kirim
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-white">Luar Biasa!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Semua tugas kelas telah Anda kumpulkan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
