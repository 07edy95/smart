import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { StudentAttendance, TeacherAttendance } from '../../types/database';
import { formatDate, exportToPdf, exportToExcel } from '../../utils/helpers';
import { 
  ClipboardCheck, Users, Calendar, Check, 
  X, AlertCircle, FileText, CheckCircle2, UserCheck, Printer 
} from 'lucide-react';

export const AttendanceModule: React.FC = () => {
  const { 
    classes, subjects, students, teachers, schedules,
    studentAttendance, recordStudentAttendance, 
    teacherAttendance, recordTeacherAttendance, 
    role, currentUser, studentProfile, teacherProfile,
    teacherSubjects, teacherClasses 
  } = useApp();

  const isSiswa = role === 'siswa';
  const isGuru = role === 'guru';
  const isAdmin = role === 'admin';

  // Guru accessible classes & subjects (Hanya mapel & kelas yang diampu)
  const accessibleClasses = isGuru ? teacherClasses : classes;
  const accessibleSubjects = isGuru ? teacherSubjects : subjects;

  const [activeTab, setActiveTab] = useState<'siswa' | 'guru' | 'rekap'>('siswa');

  // Pastikan tab presensi guru hanya bisa diakses admin
  React.useEffect(() => {
    if (!isAdmin && activeTab === 'guru') {
      setActiveTab('siswa');
    }
  }, [isAdmin, activeTab]);

  // Siswa Attendance form state
  const [selectedClassId, setSelectedClassId] = useState<string>(accessibleClasses[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(accessibleSubjects[0]?.id || '');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Bulk records mapped by student ID
  const classStudents = students.filter((s) => s.class_id === selectedClassId);

  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: 'hadir' | 'sakit' | 'izin' | 'alpa' | 'dispensasi'; notes: string }>>({});

  // Guru Attendance Form State
  const [guruTeacherId, setGuruTeacherId] = useState(teacherProfile?.id || teachers[0]?.id || '');
  const [guruDate, setGuruDate] = useState(new Date().toISOString().split('T')[0]);
  const [guruCheckIn, setGuruCheckIn] = useState('06:45');
  const [guruCheckOut, setGuruCheckOut] = useState('15:30');
  const [guruStatus, setGuruStatus] = useState<'hadir' | 'sakit' | 'izin' | 'alpa'>('hadir');
  const [guruNotes, setGuruNotes] = useState('');

  // Sinkronkan selectedClassId saat accessibleClasses berubah
  React.useEffect(() => {
    if (accessibleClasses.length > 0 && !accessibleClasses.some(c => c.id === selectedClassId)) {
      setSelectedClassId(accessibleClasses[0].id);
    }
  }, [accessibleClasses, selectedClassId]);

  // Sinkronkan selectedSubjectId saat accessibleSubjects berubah
  React.useEffect(() => {
    if (accessibleSubjects.length > 0 && !accessibleSubjects.some(s => s.id === selectedSubjectId)) {
      setSelectedSubjectId(accessibleSubjects[0].id);
    }
  }, [accessibleSubjects, selectedSubjectId]);

  // Lock guru ID jika user adalah guru
  React.useEffect(() => {
    if (isGuru && teacherProfile?.id) {
      setGuruTeacherId(teacherProfile.id);
    }
  }, [isGuru, teacherProfile]);

  // Initialize or update attendance map when class changes
  React.useEffect(() => {
    const initial: Record<string, { status: any; notes: string }> = {};
    classStudents.forEach((std) => {
      const existing = studentAttendance.find(
        (a) => a.student_id === std.id && a.date === attendanceDate && a.subject_id === selectedSubjectId
      );
      initial[std.id] = {
        status: existing?.status || 'hadir',
        notes: existing?.notes || '',
      };
    });
    setAttendanceMap(initial);
  }, [selectedClassId, selectedSubjectId, attendanceDate, studentAttendance]);

  const handleStatusChange = (studentId: string, status: any) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }));
  };

  const handleSetAllPresent = () => {
    const updated: Record<string, any> = {};
    classStudents.forEach((std) => {
      updated[std.id] = {
        status: 'hadir',
        notes: attendanceMap[std.id]?.notes || '',
      };
    });
    setAttendanceMap(updated);
  };

  const handleSaveStudentAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSub = accessibleSubjects.find(s => s.id === selectedSubjectId) || subjects.find(s => s.id === selectedSubjectId);
    const currentCls = accessibleClasses.find(c => c.id === selectedClassId) || classes.find(c => c.id === selectedClassId);

    const records = classStudents.map((std) => {
      const entry = attendanceMap[std.id] || { status: 'hadir', notes: '' };
      return {
        student_id: std.id,
        student_name: std.full_name,
        class_id: selectedClassId,
        class_name: currentCls?.name,
        subject_id: selectedSubjectId,
        subject_name: currentSub?.name,
        date: attendanceDate,
        status: entry.status,
        notes: entry.notes,
      };
    });

    recordStudentAttendance(records);
  };

  const handleSaveTeacherAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    recordTeacherAttendance({
      teacher_id: guruTeacherId,
      date: guruDate,
      check_in_time: guruCheckIn,
      check_out_time: guruCheckOut,
      status: guruStatus,
      notes: guruNotes,
    });
  };

  // JIKA ROLE SISWA: TAMPILKAN KHUSUS REKAP PRESENSI PRIBADI TANPA CAMPUR DATA SISWA LAIN
  if (isSiswa) {
    const myAttendance = studentAttendance.filter(
      a => (studentProfile && a.student_id === studentProfile.id) || a.student_name === currentUser?.full_name
    );
    const myHadir = myAttendance.filter(a => a.status === 'hadir').length;
    const mySakit = myAttendance.filter(a => a.status === 'sakit').length;
    const myIzin = myAttendance.filter(a => a.status === 'izin').length;
    const myAlpa = myAttendance.filter(a => a.status === 'alpa').length;
    const totalMyAtt = myAttendance.length;
    const myRate = totalMyAtt > 0 ? Math.round((myHadir / totalMyAtt) * 100) : 100;

    return (
      <div className="space-y-6">
        <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
              Rekapitulasi Presensi Pribadi Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Catatan kehadiran terpadu untuk {studentProfile?.full_name || currentUser?.full_name}
            </p>
          </div>

          <button
            onClick={() => {
              const headers = ['Tanggal', 'Mata Pelajaran', 'Status', 'Catatan'];
              const rows = myAttendance.map(a => [
                formatDate(a.date), a.subject_name || 'Umum', a.status.toUpperCase(), a.notes || '-'
              ]);
              exportToPdf(`Rekap Presensi - ${studentProfile?.full_name || currentUser?.full_name}`, headers, rows, 'presensi_pribadi');
            }}
            className="clay-btn-secondary text-xs py-2 px-3.5"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Cetak Rekap Presensi PDF</span>
          </button>
        </div>

        {/* 5 Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="clay-card p-4 text-center">
            <span className="text-xs text-slate-500 font-semibold block mb-1">Persentase</span>
            <span className="text-2xl font-black text-blue-600">{myRate}%</span>
          </div>
          <div className="clay-card p-4 text-center">
            <span className="text-xs text-emerald-600 font-semibold block mb-1">Hadir</span>
            <span className="text-2xl font-black text-emerald-600">{myHadir}</span>
          </div>
          <div className="clay-card p-4 text-center">
            <span className="text-xs text-amber-600 font-semibold block mb-1">Sakit</span>
            <span className="text-2xl font-black text-amber-600">{mySakit}</span>
          </div>
          <div className="clay-card p-4 text-center">
            <span className="text-xs text-blue-600 font-semibold block mb-1">Izin</span>
            <span className="text-2xl font-black text-blue-600">{myIzin}</span>
          </div>
          <div className="clay-card p-4 text-center col-span-2 sm:col-span-1">
            <span className="text-xs text-rose-600 font-semibold block mb-1">Alpa</span>
            <span className="text-2xl font-black text-rose-600">{myAlpa}</span>
          </div>
        </div>

        {/* Tabel Riwayat Pribadi */}
        <div className="clay-card p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Log Riwayat Kehadiran Pribadi
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Keterangan / Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myAttendance.length > 0 ? (
                  myAttendance.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{formatDate(rec.date)}</td>
                      <td className="p-3">{rec.subject_name || 'Umum'}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] capitalize ${
                          rec.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' :
                          rec.status === 'sakit' ? 'bg-amber-100 text-amber-700' :
                          rec.status === 'izin' ? 'bg-blue-100 text-blue-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{rec.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      Belum ada catatan presensi yang tercatat untuk akun Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Status counts for selected class
  const classRecords = Object.values(attendanceMap);
  const totalHadir = classRecords.filter((r) => r.status === 'hadir').length;
  const totalSakit = classRecords.filter((r) => r.status === 'sakit').length;
  const totalIzin = classRecords.filter((r) => r.status === 'izin').length;
  const totalAlpa = classRecords.filter((r) => r.status === 'alpa').length;

  return (
    <div className="space-y-6">
      {/* Top Tabs */}
      <div className="clay-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('siswa')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'siswa'
                ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Presensi Siswa per Kelas
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('guru')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === 'guru'
                  ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Presensi Dewan Guru
            </button>
          )}
          <button
            onClick={() => setActiveTab('rekap')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'rekap'
                ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Riwayat & Rekapitulasi
          </button>
        </div>

        <button
          onClick={() => {
            const headers = ['Nama Siswa', 'Kelas', 'Tanggal', 'Status', 'Catatan'];
            const rows = studentAttendance.map(a => [
              a.student_name || '', a.class_name || '', a.date, a.status.toUpperCase(), a.notes || '-'
            ]);
            exportToPdf('Laporan Presensi Siswa', headers, rows, 'presensi_siswa');
          }}
          className="clay-btn-secondary text-xs py-2 px-3.5"
        >
          <Printer className="w-4 h-4 text-blue-600" />
          <span>Cetak Rekap Presensi PDF</span>
        </button>
      </div>

      {/* Tab 1: Presensi Siswa */}
      {activeTab === 'siswa' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="clay-card p-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              Pilih Rombel & Jadwal Sesi Presensi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Rombel / Kelas
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                >
                  {accessibleClasses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mata Pelajaran {isGuru && <span className="text-[10px] text-emerald-600 font-normal">(Diampu)</span>}
                </label>
                {accessibleSubjects.length > 0 ? (
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                  >
                    {accessibleSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                ) : (
                  <div className="px-3.5 py-2.5 rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 text-xs text-amber-700 dark:text-amber-300">
                    Belum ada mata pelajaran yang diampu.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tanggal Presensi
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Summary Pill Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Hadir: {totalHadir}
                </span>
                <span className="px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                  Sakit: {totalSakit}
                </span>
                <span className="px-3 py-1 rounded-full font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  Izin: {totalIzin}
                </span>
                <span className="px-3 py-1 rounded-full font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  Alpa: {totalAlpa}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSetAllPresent}
                  className="clay-btn-secondary text-xs py-1.5 px-3"
                >
                  Set Semua Hadir
                </button>
                <button
                  type="button"
                  onClick={handleSaveStudentAttendance}
                  className="clay-btn-primary text-xs py-2 px-5"
                >
                  Simpan Presensi Kelas
                </button>
              </div>
            </div>
          </div>

          {/* Student Presensi Table */}
          <div className="clay-card p-6">
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5 w-12 text-center">No</th>
                    <th className="p-3.5">Nama Peserta Didik</th>
                    <th className="p-3.5">NIS</th>
                    <th className="p-3.5 text-center">Status Kehadiran</th>
                    <th className="p-3.5">Keterangan / Alasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {classStudents.map((std, idx) => {
                    const status = attendanceMap[std.id]?.status || 'hadir';
                    const notes = attendanceMap[std.id]?.notes || '';

                    return (
                      <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 text-center text-xs text-slate-400 font-medium">
                          {idx + 1}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          {std.full_name}
                        </td>
                        <td className="p-3.5 text-xs text-slate-500">{std.nis}</td>
                        <td className="p-3.5 text-center">
                          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 gap-1">
                            {(['hadir', 'sakit', 'izin', 'alpa'] as const).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleStatusChange(std.id, st)}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize transition-all ${
                                  status === st
                                    ? st === 'hadir'
                                      ? 'bg-emerald-500 text-white shadow-sm'
                                      : st === 'sakit'
                                      ? 'bg-amber-500 text-white shadow-sm'
                                      : st === 'izin'
                                      ? 'bg-blue-500 text-white shadow-sm'
                                      : 'bg-rose-500 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <input
                            type="text"
                            placeholder="Catatan surat sakit / alasan izin..."
                            value={notes}
                            onChange={(e) => handleNotesChange(std.id, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Presensi Dewan Guru (Hanya untuk Admin) */}
      {isAdmin && activeTab === 'guru' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="clay-card p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              Input Presensi Guru
            </h3>

            <form onSubmit={handleSaveTeacherAttendance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Guru *
                </label>
                <select
                  value={guruTeacherId}
                  onChange={(e) => setGuruTeacherId(e.target.value)}
                  disabled={isGuru}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                  required
                >
                  {(isGuru && teacherProfile ? teachers.filter(t => t.id === teacherProfile.id) : teachers).map((t) => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Presensi *
                </label>
                <input
                  type="date"
                  value={guruDate}
                  onChange={(e) => setGuruDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Masuk
                  </label>
                  <input
                    type="time"
                    value={guruCheckIn}
                    onChange={(e) => setGuruCheckIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Pulang
                  </label>
                  <input
                    type="time"
                    value={guruCheckOut}
                    onChange={(e) => setGuruCheckOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status Kehadiran *
                </label>
                <select
                  value={guruStatus}
                  onChange={(e) => setGuruStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                >
                  <option value="hadir">Hadir Tepat Waktu</option>
                  <option value="sakit">Sakit (Surat Dokter)</option>
                  <option value="izin">Izin Dinas / Pribadi</option>
                  <option value="alpa">Alpa / Tanpa Keterangan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={guruNotes}
                  onChange={(e) => setGuruNotes(e.target.value)}
                  placeholder="Keterangan dinas luar kota / tugas..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full clay-btn-primary text-xs sm:text-sm py-2.5"
              >
                Catat Presensi Guru
              </button>
            </form>
          </div>

          {/* Teacher Attendance Log */}
          <div className="lg:col-span-2 clay-card p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Riwayat Presensi Dewan Guru
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-3">Guru</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Masuk - Pulang</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {((isGuru && teacherProfile) ? teacherAttendance.filter(ta => ta.teacher_id === teacherProfile.id) : teacherAttendance).length > 0 ? (
                    ((isGuru && teacherProfile) ? teacherAttendance.filter(ta => ta.teacher_id === teacherProfile.id) : teacherAttendance).map((ta) => (
                      <tr key={ta.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{ta.teacher_name}</td>
                        <td className="p-3">{formatDate(ta.date)}</td>
                        <td className="p-3">{ta.check_in_time} - {ta.check_out_time}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 text-[10px] capitalize">
                            {ta.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{ta.notes || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        Belum ada data presensi guru yang tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Rekapitulasi Presensi */}
      {activeTab === 'rekap' && (
        <div className="clay-card p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Log Riwayat Presensi Lengkap {isGuru && '(Mata Pelajaran Diampu)'}
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(isGuru ? studentAttendance.filter(a => accessibleSubjects.some(s => s.id === a.subject_id || s.name === a.subject_name)) : studentAttendance).length > 0 ? (
                  (isGuru ? studentAttendance.filter(a => accessibleSubjects.some(s => s.id === a.subject_id || s.name === a.subject_name)) : studentAttendance).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{rec.student_name}</td>
                    <td className="p-3">{formatDate(rec.date)}</td>
                    <td className="p-3 text-slate-500">{rec.subject_name || '-'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] capitalize ${
                          rec.status === 'hadir'
                            ? 'bg-emerald-100 text-emerald-700'
                            : rec.status === 'sakit'
                            ? 'bg-amber-100 text-amber-700'
                            : rec.status === 'izin'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{rec.notes || '-'}</td>
                  </tr>
                ))) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      Belum ada data presensi yang tercatat untuk kelas ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
