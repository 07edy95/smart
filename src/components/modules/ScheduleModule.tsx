import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Schedule } from '../../types/database';
import { Clock, Plus, Trash2, Edit3, Calendar, AlertCircle, Printer } from 'lucide-react';
import { exportToPdf } from '../../utils/helpers';

export const ScheduleModule: React.FC = () => {
  const { 
    schedules, addSchedule, updateSchedule, deleteSchedule, 
    classes, subjects, teachers, role, currentUser, teacherProfile, studentProfile 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Filter state
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterDay, setFilterDay] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  const [formData, setFormData] = useState<Partial<Schedule>>({
    class_id: classes[0]?.id || '',
    subject_id: subjects[0]?.id || '',
    teacher_id: teachers[0]?.id || '',
    day: 'Senin',
    start_time: '07:30',
    end_time: '09:00',
    room: 'Ruang Kelas',
  });

  const isAdmin = role === 'admin';
  const isGuru = role === 'guru';

  // Apply filters
  const filteredSchedules = schedules.filter((s) => {
    // If student, auto filter strictly to student's class
    if (role === 'siswa') {
      if (studentProfile?.class_id && s.class_id !== studentProfile.class_id) return false;
    }
    // If teacher, auto filter strictly to teacher's own teaching schedule
    if (role === 'guru') {
      if (teacherProfile && s.teacher_id !== teacherProfile.id && s.teacher_name !== teacherProfile.full_name) return false;
    }
    if (filterClass !== 'all' && s.class_id !== filterClass) return false;
    if (filterDay !== 'all' && s.day !== filterDay) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setSelectedSchedule(null);
    setFormData({
      class_id: classes[0]?.id || '',
      subject_id: subjects[0]?.id || '',
      teacher_id: teachers[0]?.id || '',
      day: 'Senin',
      start_time: '07:30',
      end_time: '09:00',
      room: 'Ruang Kelas',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sch: Schedule) => {
    setSelectedSchedule(sch);
    setFormData({ ...sch });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSchedule) {
      const res = updateSchedule(selectedSchedule.id, formData);
      if (res.success) setIsModalOpen(false);
    } else {
      const res = addSchedule(formData as Omit<Schedule, 'id'>);
      if (res.success) setIsModalOpen(false);
    }
  };

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const columns: Column<Schedule>[] = [
    {
      header: 'Hari & Waktu',
      cell: (s) => (
        <div className="flex items-center gap-2.5">
          <span className="w-16 px-2.5 py-1 rounded-xl text-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-xs">
            {s.day}
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {s.start_time} - {s.end_time}
          </span>
        </div>
      ),
    },
    {
      header: 'Mata Pelajaran',
      cell: (s) => {
        const sbj = subjects.find(sub => sub.id === s.subject_id);
        return (
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-xs">{sbj?.name || s.subject_name || '-'}</p>
            <p className="text-[11px] text-slate-400">{s.room || 'Ruang Kelas'}</p>
          </div>
        );
      },
    },
    {
      header: 'Rombel / Kelas',
      cell: (s) => {
        const cls = classes.find(c => c.id === s.class_id);
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            {cls?.name || s.class_name || '-'}
          </span>
        );
      },
    },
    {
      header: 'Guru Pengampu',
      cell: (s) => {
        const tch = teachers.find(t => t.id === s.teacher_id);
        return (
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{tch?.full_name || s.teacher_name || '-'}</p>
        );
      },
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (s) => (
        <div className="flex items-center justify-center gap-1.5">
          {isAdmin && (
            <>
              <button
                onClick={() => handleOpenEdit(s)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Edit Jadwal"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Hapus jadwal ${s.subject_name} hari ${s.day}?`)) {
                    deleteSchedule(s.id);
                  }
                }}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="clay-card p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Jadwal Pelajaran Mingguan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Penjadwalan KBM dengan sistem validasi pencegahan bentrok ruang, guru, dan kelas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Tampilan Matriks Hari
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Tampilan Tabel
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="clay-btn-primary text-xs sm:text-sm py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Mode: Day by Day Matriks */}
      {viewMode === 'grid' ? (
        <div className="space-y-6">
          {/* Day selection filters */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter Rombel:</span>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none font-semibold"
              >
                <option value="all">Semua Rombel</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                const headers = ['Hari', 'Waktu', 'Mata Pelajaran', 'Kelas', 'Guru', 'Ruangan'];
                const rows = filteredSchedules.map(s => [
                  s.day, `${s.start_time} - ${s.end_time}`, s.subject_name || '', s.class_name || '', s.teacher_name || '', s.room || ''
                ]);
                exportToPdf('Jadwal Pelajaran Sekolah', headers, rows, 'jadwal_pelajaran');
              }}
              className="clay-btn-secondary text-xs py-1.5 px-3"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Cetak Jadwal PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {daysOfWeek.map((day) => {
              const daySchedules = filteredSchedules.filter((s) => s.day === day);

              return (
                <div key={day} className="clay-card p-5 space-y-3.5 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-base font-extrabold text-blue-700 dark:text-blue-400">
                      {day}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                      {daySchedules.length} Sesi Pelajaran
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-96">
                    {daySchedules.length > 0 ? (
                      daySchedules.map((sch) => {
                        const sbj = subjects.find(sub => sub.id === sch.subject_id);
                        const cls = classes.find(c => c.id === sch.class_id);
                        const tch = teachers.find(t => t.id === sch.teacher_id);
                        return (
                          <div
                            key={sch.id}
                            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {sbj?.name || sch.subject_name || 'Mata Pelajaran'}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                {sch.start_time} - {sch.end_time}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                              <span>{cls?.name || sch.class_name || 'Rombel'} • {sch.room || 'Kelas'} • {tch?.full_name || sch.teacher_name || ''}</span>
                            {isAdmin && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEdit(sch)}
                                  className="text-slate-400 hover:text-amber-500 p-0.5"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteSchedule(sch.id)}
                                  className="text-slate-400 hover:text-rose-500 p-0.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                            Pengampu: {tch?.full_name || sch.teacher_name || '-'}
                          </p>
                        </div>
                      );
                    })
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400">
                        Tidak ada sesi belajar pada hari ini.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <DataTable
          title="Tabel Jadwal Pelajaran"
          subtitle="Daftar seluruh alokasi jam tatap muka"
          data={filteredSchedules}
          columns={columns}
          searchPlaceholder="Cari jadwal, guru, mapel..."
          searchKeys={['subject_name', 'teacher_name', 'class_name', 'day']}
          onAddClick={isAdmin ? handleOpenAdd : undefined}
          addButtonLabel="Tambah Jadwal"
          onBulkDelete={isAdmin ? (ids) => ids.forEach(deleteSchedule) : undefined}
        />
      )}

      {/* Add / Edit Modal with Conflict Validation */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSchedule ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
        subtitle="Validasi otomatis bentrok ruang, guru, dan kelas"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hari Pelajaran *
              </label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              >
                {daysOfWeek.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kelas / Rombel *
              </label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mata Pelajaran *
              </label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Guru Pengampu *
              </label>
              <select
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Mulai *
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Selesai *
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ruang Belajar
              </label>
              <input
                type="text"
                value={formData.room || ''}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="Lab Fisika"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50 flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
            <span>Sistem akan memeriksa kemungkinan bentrok jadwal guru di kelas lain serta bentrok ruangan pada waktu yang sama.</span>
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
              Simpan Jadwal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
