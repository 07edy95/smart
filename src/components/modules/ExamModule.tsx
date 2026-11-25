import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Exam } from '../../types/database';
import { formatDate, exportToPdf } from '../../utils/helpers';
import { FileText, Plus, Trash2, Printer, Calendar, Clock, MapPin, Users } from 'lucide-react';

export const ExamModule: React.FC = () => {
  const { 
    exams, addExam, deleteExam, subjects, teachers, classes, role, 
    teacherProfile, teacherSubjects 
  } = useApp();

  const isAdmin = role === 'admin';
  const isGuru = role === 'guru';

  // Guru accessible subjects (Hanya mapel yang diampu)
  const accessibleSubjects = isGuru ? teacherSubjects : subjects;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'harian' | 'sumatif' | 'uts' | 'uas'>('uts');
  const [subjectId, setSubjectId] = useState(accessibleSubjects[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('09:30');
  const [supervisorTeacherId, setSupervisorTeacherId] = useState(teacherProfile?.id || teachers[0]?.id || '');
  const [room, setRoom] = useState('Lab Komputer 1');

  // Sync subjectId saat accessibleSubjects berubah
  React.useEffect(() => {
    if (accessibleSubjects.length > 0 && !accessibleSubjects.some(s => s.id === subjectId)) {
      setSubjectId(accessibleSubjects[0].id);
    }
  }, [accessibleSubjects, subjectId]);

  // Filter exams per role
  const displayedExams = isGuru
    ? exams.filter(e => 
        (teacherProfile && e.supervisor_teacher_id === teacherProfile.id) ||
        e.supervisor_name === teacherProfile?.full_name ||
        accessibleSubjects.some(s => s.id === e.subject_id)
      )
    : exams;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExam({
      title,
      type,
      subject_id: subjectId,
      date,
      start_time: startTime,
      end_time: endTime,
      supervisor_teacher_id: supervisorTeacherId,
      room,
      academic_year_id: '11111111-1111-1111-1111-111111111111',
      semester_id: '22222222-2222-2222-2222-222222222221',
    });
    setIsModalOpen(false);
    setTitle('');
  };

  const columns: Column<Exam>[] = [
    {
      header: 'Nama Asesmen / Ujian',
      cell: (e) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{e.title}</h4>
            <p className="text-[11px] text-slate-500">{subjects.find(s => s.id === e.subject_id)?.name || e.subject_name}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Jenis Ujian',
      cell: (e) => {
        let badge = 'bg-blue-100 text-blue-700';
        if (e.type === 'uts') badge = 'bg-purple-100 text-purple-700';
        if (e.type === 'uas') badge = 'bg-rose-100 text-rose-700';
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${badge}`}>
            {e.type}
          </span>
        );
      },
    },
    {
      header: 'Tanggal & Waktu',
      cell: (e) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800 dark:text-white flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-500" />
            {formatDate(e.date)}
          </p>
          <p className="text-slate-400 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400" />
            {e.start_time} - {e.end_time}
          </p>
        </div>
      ),
    },
    {
      header: 'Pengawas & Ruangan',
      cell: (e) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800 dark:text-white">
            {teachers.find(t => t.id === e.supervisor_teacher_id)?.full_name || e.supervisor_name || 'Pengawas Ruang'}
          </p>
          <p className="text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-500" />
            {e.room}
          </p>
        </div>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (e) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => {
              const headers = ['No', 'NISN', 'Nama Peserta Ujian', 'Kelas', 'Tanda Tangan'];
              const sampleRows = [
                ['1', '0081234501', 'Ahmad Rizky Pratama', 'Kelas X MIPA 1', '....................'],
                ['2', '0081234502', 'Zahra Nurul Aulia', 'Kelas X MIPA 1', '....................'],
                ['3', '0081234503', 'Dimas Arya Saputra', 'Kelas X MIPA 1', '....................'],
                ['4', '0081234504', 'Fathia Salsa Bella', 'Kelas X MIPA 1', '....................'],
              ];
              exportToPdf(`Daftar Hadir Ujian - ${e.title}`, headers, sampleRows, `peserta_ujian_${e.title}`);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Cetak Daftar Hadir Peserta Ujian"
          >
            <Printer className="w-4 h-4" />
          </button>

          {(isAdmin || isGuru) && (
            <button
              onClick={() => {
                if (window.confirm(`Hapus jadwal ujian ${e.title}?`)) {
                  deleteExam(e.id);
                }
              }}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Manajemen Ujian & Evaluasi Pembelajaran"
        subtitle="Jadwal PTS, PAS, asesmen sumatif, pengawas ruang, dan cetak berita acara ujian"
        data={displayedExams}
        columns={columns}
        searchPlaceholder="Cari ujian, mata pelajaran, ruang..."
        searchKeys={['title', 'subject_name', 'room', 'supervisor_name']}
        onAddClick={!role.includes('siswa') ? () => setIsModalOpen(true) : undefined}
        addButtonLabel="Jadwalkan Ujian Baru"
      />

      {/* Add Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Jadwalkan Ujian Baru"
        subtitle="Atur tanggal, jam, pengawas, dan ruang ujian"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Judul / Nama Ujian *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Penilaian Akhir Semester (PAS) Ganjil 2025"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Ujian *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="uts">Ujian Tengah Semester (PTS)</option>
                <option value="uas">Ujian Akhir Semester (PAS)</option>
                <option value="sumatif">Asesmen Sumatif</option>
                <option value="harian">Ujian Harian</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mata Pelajaran * {isGuru && <span className="text-[10px] text-emerald-600 font-normal">(Diampu)</span>}
              </label>
              {accessibleSubjects.length > 0 ? (
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                  required
                >
                  {accessibleSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              ) : (
                <div className="px-3.5 py-2 rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 text-xs text-amber-700 dark:text-amber-300">
                  Belum ada mapel diampu.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Ujian *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Mulai *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Selesai *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Guru Pengawas Ruang
              </label>
              <select
                value={supervisorTeacherId}
                onChange={(e) => setSupervisorTeacherId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ruang Ujian *
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Lab Komputer 1 / Ruang 04"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="clay-btn-secondary text-xs py-2 px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              className="clay-btn-primary text-xs py-2 px-5"
            >
              Simpan Jadwal Ujian
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
