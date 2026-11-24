import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Plus, CheckCircle, Archive, Trash2, Edit3, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { formatDate } from '../../utils/helpers';
import { AcademicYear } from '../../types/database';

export const AcademicYearModule: React.FC = () => {
  const { 
    academicYears, addAcademicYear, updateAcademicYear, 
    deleteAcademicYear, setActiveAcademicYear, semesters, 
    setActiveSemester, role 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademicYear | null>(null);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isAdmin = role === 'admin';

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setStartDate('2026-07-15');
    setEndDate('2027-06-25');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ay: AcademicYear) => {
    setEditingItem(ay);
    setName(ay.name);
    setStartDate(ay.start_date);
    setEndDate(ay.end_date);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateAcademicYear(editingItem.id, {
        name,
        start_date: startDate,
        end_date: endDate,
      });
    } else {
      addAcademicYear({
        name,
        start_date: startDate,
        end_date: endDate,
        is_active: false,
        is_archived: false,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Semester Active Controller */}
      <div className="clay-card p-6">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          Pengaturan Semester Aktif
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tentukan semester yang sedang berlangsung untuk proses absensi, penilaian, dan jadwal pelajaran.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {semesters.map((s) => (
            <div
              key={s.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                s.is_active
                  ? 'border-blue-500/50 bg-blue-50/60 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40'
              }`}
            >
              <div>
                <span className="text-xs font-semibold text-slate-500">Semester</span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{s.name}</h4>
                <p className="text-[11px] text-slate-400">
                  {s.is_active ? 'Sedang Digunakan' : 'Tidak Aktif'}
                </p>
              </div>

              {isAdmin && !s.is_active && (
                <button
                  onClick={() => setActiveSemester(s.id)}
                  className="clay-btn-primary text-xs py-1.5 px-3"
                >
                  Aktifkan
                </button>
              )}

              {s.is_active && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Aktif
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Academic Years List */}
      <div className="clay-card p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Tahun Ajaran</h3>
            <p className="text-xs text-slate-500">
              Riwayat dan konfigurasi tahun ajaran kalender pendidikan
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="clay-btn-primary text-xs sm:text-sm py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tahun Ajaran</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-xs uppercase font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Tahun Ajaran</th>
                <th className="p-4">Periode Mulai</th>
                <th className="p-4">Periode Selesai</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Arsip</th>
                {isAdmin && <th className="p-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {academicYears.map((ay) => (
                <tr key={ay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-slate-800 dark:text-white">
                    {ay.name}
                  </td>
                  <td className="p-4">{formatDate(ay.start_date)}</td>
                  <td className="p-4">{formatDate(ay.end_date)}</td>
                  <td className="p-4 text-center">
                    {ay.is_active ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 inline-flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Aktif
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Tidak Aktif
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {ay.is_archived ? (
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                        Diarsipkan
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {!ay.is_active && (
                          <button
                            onClick={() => setActiveAcademicYear(ay.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                            title="Jadikan Tahun Ajaran Aktif"
                          >
                            Set Aktif
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(ay)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!ay.is_active && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus tahun ajaran ${ay.name}?`)) {
                                deleteAcademicYear(ay.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
        subtitle="Kalender operasional sekolah"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Tahun Ajaran (contoh: 2026/2027) *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="2026/2027"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Mulai *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Selesai *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
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
              Simpan Data
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
