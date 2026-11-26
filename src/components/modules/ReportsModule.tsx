import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, FileSpreadsheet, Printer, Users, 
  GraduationCap, ClipboardCheck, Award, Boxes, 
  CreditCard, Clock, Download 
} from 'lucide-react';
import { exportToExcel, exportToPdf, formatDate, formatRupiah } from '../../utils/helpers';

export const ReportsModule: React.FC = () => {
  const { 
    students, teachers, classes, studentAttendance, 
    grades, schedules, inventory, transactions, schoolSettings,
    role, teacherProfile, teacherSubjects, currentUser 
  } = useApp();

  const isAdmin = role === 'admin';
  const isGuru = role === 'guru';
  const teacherName = (teacherProfile?.full_name || currentUser?.full_name || '').toLowerCase().trim();
  const mySubjectIds = teacherSubjects.map(s => s.id);

  // Filter data sesuai hak akses guru (hanya data yang ia kerjakan/ampu, kecuali Data Buku Induk Siswa)
  const displayedStudents = students;
  
  const displayedAttendance = isGuru
    ? studentAttendance.filter(a => 
        (a.subject_id && mySubjectIds.includes(a.subject_id)) ||
        (a.subject_name && teacherSubjects.some(s => s.name.toLowerCase().trim() === a.subject_name?.toLowerCase().trim())) ||
        (a.recorded_by && a.recorded_by.toLowerCase().trim() === teacherName)
      )
    : studentAttendance;

  const displayedGrades = isGuru
    ? grades.filter(g => 
        (g.subject_id && mySubjectIds.includes(g.subject_id)) ||
        (g.subject_name && teacherSubjects.some(s => s.name.toLowerCase().trim() === g.subject_name?.toLowerCase().trim())) ||
        (g.teacher_name && g.teacher_name.toLowerCase().trim() === teacherName)
      )
    : grades;

  const displayedSchedules = isGuru
    ? schedules.filter(s => 
        (s.teacher_id && teacherProfile && s.teacher_id === teacherProfile.id) ||
        (s.teacher_name && s.teacher_name.toLowerCase().trim() === teacherName)
      )
    : schedules;

  const [selectedReport, setSelectedReport] = useState<'siswa' | 'guru' | 'absensi' | 'nilai' | 'jadwal' | 'inventaris' | 'keuangan'>('siswa');

  // Kategori Laporan untuk Admin (Semua Laporan Sekolah)
  const adminReportCards = [
    { id: 'siswa', title: 'Data Buku Induk Siswa', desc: 'Daftar lengkap profil, NIS, NISN, orang tua, dan status', icon: GraduationCap, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
    { id: 'guru', title: 'Data Guru & Pegawai', desc: 'Daftar pendidik, NIP, status kepegawaian, dan jabatan', icon: Users, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
    { id: 'absensi', title: 'Rekap Presensi Siswa', desc: 'Tingkat kehadiran, sakit, izin, dan alpa seluruh rombel', icon: ClipboardCheck, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
    { id: 'nilai', title: 'Rekapitulasi Leger Nilai', desc: 'Daftar rekap nilai tugas, formatif, PTS, dan PAS', icon: Award, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
    { id: 'jadwal', title: 'Jadwal Pelajaran Mingguan', desc: 'Matriks alokasi jam mengajar guru dan kelas', icon: Clock, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
    { id: 'inventaris', title: 'Buku Inventaris Barang', desc: 'Daftar aset sarana, kondisi, lokasi, dan sumber dana', icon: Boxes, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' },
    { id: 'keuangan', title: 'Laporan Pembayaran SPP', desc: 'Mutasi penerimaan kas, kwitansi, dan tagihan siswa', icon: CreditCard, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40' },
  ];

  // Kategori Laporan untuk Guru: Hanya laporan yang dikerjakan guru + Buku Induk Siswa
  const guruReportCards = [
    { id: 'siswa', title: 'Data Buku Induk Siswa', desc: 'Daftar lengkap profil, NIS, NISN, dan rombel peserta didik', icon: GraduationCap, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
    { id: 'nilai', title: 'Rekap Nilai Siswa (Mapel Diampu)', desc: 'Rekap nilai formatif, sumatif, dan tugas mapel yang Anda ampu', icon: Award, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
    { id: 'absensi', title: 'Rekap Presensi Siswa (Sesi Diampu)', desc: 'Riwayat kehadiran siswa pada sesi mata pelajaran Anda', icon: ClipboardCheck, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
    { id: 'jadwal', title: 'Jadwal Mengajar Saya', desc: 'Jadwal dan alokasi sesi mengajar Anda per minggu', icon: Clock, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
  ];

  const reportCards = isGuru ? guruReportCards : adminReportCards;

  // Pastikan guru tidak memilih laporan terlarang
  React.useEffect(() => {
    if (isGuru && ['guru', 'inventaris', 'keuangan'].includes(selectedReport)) {
      setSelectedReport('siswa');
    }
  }, [isGuru, selectedReport]);

  // Export handlers
  const handleExportExcel = () => {
    if (selectedReport === 'siswa') {
      const data = displayedStudents.map(s => ({
        NIS: s.nis,
        NISN: s.nisn,
        'Nama Lengkap': s.full_name,
        Gender: s.gender,
        Kelas: s.class_name,
        Status: s.status,
        'No HP Ortu': s.parent_phone,
      }));
      exportToExcel(data, 'laporan_buku_induk_siswa');
    } else if (selectedReport === 'guru') {
      const data = teachers.map(t => ({
        NIP: t.nip,
        'Nama Lengkap': t.full_name,
        Gender: t.gender,
        Email: t.email,
        Jabatan: t.position,
        Status: t.employment_status,
      }));
      exportToExcel(data, 'laporan_guru_pegawai');
    } else if (selectedReport === 'absensi') {
      const data = displayedAttendance.map(a => ({
        Siswa: a.student_name,
        Kelas: a.class_name,
        Tanggal: a.date,
        'Mata Pelajaran': a.subject_name || 'Umum',
        Status: a.status.toUpperCase(),
        Catatan: a.notes || '-',
      }));
      exportToExcel(data, isGuru ? 'rekap_presensi_guru' : 'rekap_presensi_sekolah');
    } else if (selectedReport === 'nilai') {
      const data = displayedGrades.map(g => ({
        Siswa: g.student_name,
        Kelas: g.class_name || '-',
        Mapel: g.subject_name || '-',
        Komponen: g.component_name || '-',
        Nilai: g.score,
      }));
      exportToExcel(data, isGuru ? 'rekap_nilai_guru' : 'rekap_leger_nilai_sekolah');
    } else if (selectedReport === 'jadwal') {
      const data = displayedSchedules.map(s => ({
        Hari: s.day,
        Waktu: `${s.start_time} - ${s.end_time}`,
        Mapel: s.subject_name,
        Kelas: s.class_name,
        Guru: s.teacher_name,
        Ruangan: s.room || 'Kelas',
      }));
      exportToExcel(data, isGuru ? 'jadwal_mengajar_guru' : 'jadwal_pelajaran_sekolah');
    } else if (selectedReport === 'inventaris') {
      const data = inventory.map(i => ({
        Kode: i.item_code,
        Nama: i.item_name,
        Kategori: i.category,
        Jumlah: i.quantity,
        Kondisi: i.condition,
        Lokasi: i.location,
      }));
      exportToExcel(data, 'laporan_inventaris');
    } else if (selectedReport === 'keuangan') {
      const data = transactions.map(t => ({
        Kwitansi: t.receipt_number,
        Siswa: t.student_name,
        Tanggal: t.payment_date,
        Metode: t.payment_method,
        Jumlah: t.amount,
      }));
      exportToExcel(data, 'laporan_keuangan_spp');
    }
  };

  const handleExportPdf = () => {
    if (selectedReport === 'siswa') {
      const headers = ['No', 'NIS', 'Nama Siswa', 'L/P', 'Kelas', 'Status'];
      const rows = displayedStudents.map((s, idx) => [idx + 1, s.nis, s.full_name, s.gender, s.class_name || '-', s.status]);
      exportToPdf('Laporan Buku Induk Siswa', headers, rows, 'laporan_siswa');
    } else if (selectedReport === 'guru') {
      const headers = ['No', 'NIP', 'Nama Guru', 'Jabatan', 'Status', 'Kontak'];
      const rows = teachers.map((t, idx) => [idx + 1, t.nip || '-', t.full_name, t.position, t.employment_status, t.email]);
      exportToPdf('Laporan Pendidik & Tenaga Kependidikan', headers, rows, 'laporan_guru');
    } else if (selectedReport === 'absensi') {
      const headers = ['No', 'Nama Siswa', 'Kelas', 'Tanggal', 'Mata Pelajaran', 'Status Kehadiran'];
      const rows = displayedAttendance.map((a, idx) => [
        idx + 1, a.student_name || '', a.class_name || '', a.date, a.subject_name || 'Umum', a.status.toUpperCase()
      ]);
      exportToPdf(isGuru ? 'Rekap Presensi Siswa (Sesi Diampu)' : 'Laporan Rekapitulasi Presensi Sekolah', headers, rows, 'rekap_presensi');
    } else if (selectedReport === 'nilai') {
      const headers = ['No', 'Nama Siswa', 'Kelas', 'Mata Pelajaran', 'Komponen', 'Nilai'];
      const rows = displayedGrades.map((g, idx) => [
        idx + 1, g.student_name || '', g.class_name || '-', g.subject_name || '-', g.component_name || '-', g.score
      ]);
      exportToPdf(isGuru ? 'Rekapitulasi Nilai Siswa (Mapel Diampu)' : 'Laporan Rekapitulasi Leger Nilai Sekolah', headers, rows, 'rekap_nilai');
    } else if (selectedReport === 'jadwal') {
      const headers = ['No', 'Hari', 'Waktu', 'Mata Pelajaran', 'Kelas', 'Ruangan'];
      const rows = displayedSchedules.map((s, idx) => [
        idx + 1, s.day, `${s.start_time} - ${s.end_time}`, s.subject_name || '', s.class_name || '', s.room || 'Kelas'
      ]);
      exportToPdf(isGuru ? 'Jadwal Mengajar Guru' : 'Jadwal Pelajaran Sekolah', headers, rows, 'jadwal_pelajaran');
    } else if (selectedReport === 'keuangan') {
      const headers = ['No', 'Kwitansi', 'Nama Siswa', 'Tanggal', 'Metode', 'Jumlah Bayar'];
      const rows = transactions.map((t, idx) => [idx + 1, t.receipt_number, t.student_name || '', formatDate(t.payment_date), t.payment_method, formatRupiah(t.amount)]);
      exportToPdf('Laporan Keuangan & Kas Sekolah', headers, rows, 'laporan_keuangan');
    } else {
      handleExportExcel();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="clay-card p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>{isGuru ? 'Rekap Laporan Pembelajaran Guru' : 'Pusat Laporan & Rekapitulasi Data Sekolah'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isGuru 
              ? 'Unduh rekapitulasi data nilai, presensi, jadwal mengajar, dan buku induk siswa resmi format Excel & PDF'
              : 'Ekspor laporan resmi berstandar dinas pendidikan format Excel (.xlsx) dan dokumen cetak PDF'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="clay-btn-secondary text-xs sm:text-sm py-2 px-3.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="clay-btn-primary text-xs sm:text-sm py-2 px-4"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF Laporan</span>
          </button>
        </div>
      </div>

      {/* Report Categories Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${isAdmin ? 'xl:grid-cols-4' : 'xl:grid-cols-4'} gap-4`}>
        {reportCards.map((rc) => {
          const Icon = rc.icon;
          const isSelected = selectedReport === rc.id;

          return (
            <div
              key={rc.id}
              onClick={() => setSelectedReport(rc.id as any)}
              className={`clay-card p-4 sm:p-5 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rc.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {rc.title}
                  </h4>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    {isSelected ? 'Laporan Terpilih' : 'Klik untuk Pilih'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {rc.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Live Preview Box of the Selected Report */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white capitalize">
              Pratinjau: {reportCards.find(r => r.id === selectedReport)?.title}
            </h3>
            <p className="text-xs text-slate-500">
              {isGuru && selectedReport !== 'siswa' 
                ? 'Data disaring khusus untuk mata pelajaran & sesi yang Anda ampu'
                : 'Data terhubung langsung dengan basis data sekolah'}
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold dark:bg-blue-900/30 dark:text-blue-300">
            {schoolSettings.school_name}
          </span>
        </div>

        {/* Selected table preview */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 max-h-96">
          
          {/* 1. Buku Induk Siswa (Tampil untuk Admin & Guru) */}
          {selectedReport === 'siswa' && (
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">NIS</th>
                  <th className="p-3">NISN</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{s.full_name}</td>
                    <td className="p-3">{s.nis}</td>
                    <td className="p-3">{s.nisn}</td>
                    <td className="p-3">{s.class_name}</td>
                    <td className="p-3 font-semibold text-emerald-600">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 2. Rekap Nilai Siswa */}
          {selectedReport === 'nilai' && (
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Komponen</th>
                  <th className="p-3">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedGrades.length > 0 ? (
                  displayedGrades.map((g, idx) => (
                    <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{g.student_name}</td>
                      <td className="p-3 font-medium">{g.class_name || '-'}</td>
                      <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{g.subject_name || '-'}</td>
                      <td className="p-3 uppercase text-[10px] text-slate-500">{g.component_name || '-'}</td>
                      <td className="p-3 font-extrabold text-emerald-600">{g.score}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Belum ada data nilai tercatat untuk mata pelajaran yang Anda ampu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* 3. Rekap Presensi Siswa */}
          {selectedReport === 'absensi' && (
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">Siswa</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedAttendance.length > 0 ? (
                  displayedAttendance.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{a.student_name}</td>
                      <td className="p-3">{a.class_name}</td>
                      <td className="p-3">{formatDate(a.date)}</td>
                      <td className="p-3 font-medium text-blue-600 dark:text-blue-400">{a.subject_name || 'Umum'}</td>
                      <td className="p-3 font-bold uppercase text-emerald-600">{a.status}</td>
                      <td className="p-3 text-slate-400">{a.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Belum ada catatan presensi untuk sesi mata pelajaran Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* 4. Jadwal Pelajaran / Mengajar */}
          {selectedReport === 'jadwal' && (
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">Hari</th>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Kelas</th>
                  {isAdmin && <th className="p-3">Guru Pengampu</th>}
                  <th className="p-3">Ruangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedSchedules.length > 0 ? (
                  displayedSchedules.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{s.day}</td>
                      <td className="p-3 font-mono">{s.start_time} - {s.end_time}</td>
                      <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{s.subject_name}</td>
                      <td className="p-3">{s.class_name}</td>
                      {isAdmin && <td className="p-3">{s.teacher_name}</td>}
                      <td className="p-3 text-slate-500">{s.room || 'Ruang Kelas'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="p-8 text-center text-slate-400">
                      Belum ada jadwal pelajaran tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* 5. Khusus Admin: Guru & Pegawai */}
          {isAdmin && selectedReport === 'guru' && (
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Nama Guru</th>
                  <th className="p-3">NIP</th>
                  <th className="p-3">Jabatan</th>
                  <th className="p-3">Status Kepegawaian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teachers.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{t.full_name}</td>
                    <td className="p-3">{t.nip || '-'}</td>
                    <td className="p-3">{t.position}</td>
                    <td className="p-3 font-semibold text-blue-600">{t.employment_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 6. Khusus Admin: Keuangan SPP */}
          {isAdmin && selectedReport === 'keuangan' && (
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">No. Kwitansi</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">Tanggal Bayar</th>
                  <th className="p-3">Metode</th>
                  <th className="p-3">Jumlah Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-blue-600">{t.receipt_number}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{t.student_name}</td>
                    <td className="p-3">{formatDate(t.payment_date)}</td>
                    <td className="p-3">{t.payment_method}</td>
                    <td className="p-3 font-bold text-emerald-600">{formatRupiah(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 7. Khusus Admin: Inventaris Barang */}
          {isAdmin && selectedReport === 'inventaris' && (
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">Kode Barang</th>
                  <th className="p-3">Nama Barang</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Jumlah</th>
                  <th className="p-3">Kondisi</th>
                  <th className="p-3">Lokasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inventory.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-blue-600">{i.item_code}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{i.item_name}</td>
                    <td className="p-3">{i.category}</td>
                    <td className="p-3 font-bold">{i.quantity} Unit</td>
                    <td className="p-3 font-medium text-emerald-600 capitalize">{i.condition}</td>
                    <td className="p-3 text-slate-500">{i.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>
    </div>
  );
};
