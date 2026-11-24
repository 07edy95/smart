import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Subject } from '../../types/database';
import { BookOpen, Edit3, Trash2, Clock } from 'lucide-react';

export const SubjectModule: React.FC = () => {
  const { subjects, addSubject, updateSubject, deleteSubject, role } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [formData, setFormData] = useState<Partial<Subject>>({
    code: '',
    name: '',
    category: 'Wajib',
    hours_per_week: 2,
    grade_level: 'Semua',
  });

  const isAdmin = role === 'admin';

  const handleOpenAdd = () => {
    setSelectedSubject(null);
    setFormData({
      code: 'MAPEL-' + Math.floor(10 + Math.random() * 90),
      name: '',
      category: 'Wajib',
      hours_per_week: 3,
      grade_level: 'Semua',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({ ...subject });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubject) {
      updateSubject(selectedSubject.id, formData);
    } else {
      addSubject(formData as Omit<Subject, 'id'>);
    }
    setIsModalOpen(false);
  };

  const columns: Column<Subject>[] = [
    {
      header: 'Mata Pelajaran',
      cell: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white leading-tight">{s.name}</p>
            <p className="text-[11px] text-slate-400">Kode: {s.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Kelompok / Kategori',
      cell: (s) => {
        let badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
        if (s.category === 'Peminatan') badgeColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
        if (s.category === 'Muatan Lokal') badgeColor = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';

        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
            {s.category}
          </span>
        );
      },
    },
    {
      header: 'Alokasi Jam',
      cell: (s) => (
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{s.hours_per_week} Jam Pelajaran / Minggu</span>
        </div>
      ),
    },
    {
      header: 'Tingkat Kelas',
      cell: (s) => (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {s.grade_level}
        </span>
      ),
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
                title="Edit Mapel"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Hapus mata pelajaran ${s.name}?`)) {
                    deleteSubject(s.id);
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
      <DataTable
        title="Daftar Mata Pelajaran (Kurikulum)"
        subtitle="Mata pelajaran wajib umum, peminatan, muatan lokal, dan jam pelajaran"
        data={subjects}
        columns={columns}
        searchPlaceholder="Cari nama mata pelajaran atau kode..."
        searchKeys={['name', 'code', 'category']}
        onAddClick={isAdmin ? handleOpenAdd : undefined}
        addButtonLabel="Tambah Mata Pelajaran"
        onBulkDelete={isAdmin ? (ids) => ids.forEach(deleteSubject) : undefined}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
        subtitle="Konfigurasi kurikulum dan alokasi jam"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Mata Pelajaran *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="MAT-01"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Kurikulum *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="Wajib">Wajib (Umum)</option>
                <option value="Peminatan">Peminatan</option>
                <option value="Muatan Lokal">Muatan Lokal</option>
                <option value="Pilihan">Pilihan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Mata Pelajaran *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Matematika Tingkat Lanjut"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alokasi Jam per Minggu
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={formData.hours_per_week}
                onChange={(e) => setFormData({ ...formData, hours_per_week: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tingkat Kelas
              </label>
              <select
                value={formData.grade_level}
                onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="Semua">Semua Tingkat</option>
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
              </select>
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
              Simpan Mapel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
