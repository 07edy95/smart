import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { ClassRoom } from '../../types/database';
import { DoorOpen, Eye, Edit3, Trash2, Users, GraduationCap } from 'lucide-react';

export const ClassModule: React.FC = () => {
  const { classes, addClass, updateClass, deleteClass, teachers, students, role } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);

  const [formData, setFormData] = useState<Partial<ClassRoom>>({
    code: '',
    name: '',
    grade_level: 'X',
    major: 'MIPA',
    homeroom_teacher_id: teachers[0]?.id || '',
    capacity: 36,
  });

  const isAdmin = role === 'admin';

  const handleOpenAdd = () => {
    setSelectedClass(null);
    setFormData({
      code: 'X-IPS-1',
      name: 'Kelas X IPS 1',
      grade_level: 'X',
      major: 'IPS',
      homeroom_teacher_id: teachers[0]?.id || '',
      capacity: 36,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassRoom) => {
    setSelectedClass(cls);
    setFormData({ ...cls });
    setIsModalOpen(true);
  };

  const handleOpenDetail = (cls: ClassRoom) => {
    setSelectedClass(cls);
    setIsDetailOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClass) {
      updateClass(selectedClass.id, formData);
    } else {
      addClass(formData as Omit<ClassRoom, 'id'>);
    }
    setIsModalOpen(false);
  };

  const classStudents = selectedClass
    ? students.filter((s) => s.class_id === selectedClass.id)
    : [];

  const columns: Column<ClassRoom>[] = [
    {
      header: 'Nama Rombel / Kelas',
      cell: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs">
            {c.grade_level}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white leading-tight">{c.name}</p>
            <p className="text-[11px] text-slate-400">Kode: {c.code} • Jurusan: {c.major}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Wali Kelas',
      cell: (c) => (
        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
          {c.homeroom_teacher_name || 'Belum Ditentukan'}
        </p>
      ),
    },
    {
      header: 'Kapasitas & Siswa',
      cell: (c) => {
        const count = students.filter((s) => s.class_id === c.id).length || c.student_count || 0;
        return (
          <div className="text-xs">
            <span className="font-bold text-slate-800 dark:text-white">{count} Siswa</span>
            <span className="text-slate-400 ml-1">/ Maks {c.capacity}</span>
          </div>
        );
      },
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (c) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => handleOpenDetail(c)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Daftar Siswa Kelas"
          >
            <Eye className="w-4 h-4" />
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => handleOpenEdit(c)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Edit Rombel"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Hapus rombel ${c.name}?`)) {
                    deleteClass(c.id);
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
        title="Rombongan Belajar (Rombel / Kelas)"
        subtitle="Daftar kelas aktif, wali kelas pengampu, dan kapasitas peserta didik"
        data={classes}
        columns={columns}
        searchPlaceholder="Cari nama rombel, wali kelas..."
        searchKeys={['name', 'code', 'homeroom_teacher_name', 'major']}
        onAddClick={isAdmin ? handleOpenAdd : undefined}
        addButtonLabel="Tambah Kelas Baru"
        onBulkDelete={isAdmin ? (ids) => ids.forEach(deleteClass) : undefined}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedClass ? 'Edit Rombongan Belajar' : 'Tambah Kelas / Rombel Baru'}
        subtitle="Manajemen rombongan belajar sekolah"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Kelas *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="X-MIPA-1"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Kelas *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Kelas X MIPA 1"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tingkat Kelas *
              </label>
              <select
                value={formData.grade_level}
                onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
                <option value="VII">Kelas VII (SMP)</option>
                <option value="VIII">Kelas VIII (SMP)</option>
                <option value="IX">Kelas IX (SMP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jurusan / Peminatan
              </label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                placeholder="MIPA, IPS, Umum"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Wali Kelas Pengampu
            </label>
            <select
              value={formData.homeroom_teacher_id}
              onChange={(e) => setFormData({ ...formData, homeroom_teacher_id: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            >
              <option value="">Pilih Guru Wali Kelas</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.full_name} ({t.position})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kapasitas Maksimal Siswa
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            />
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
              Simpan Kelas
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal with List of Students in Class */}
      {selectedClass && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Daftar Siswa - ${selectedClass.name}`}
          subtitle={`Wali Kelas: ${selectedClass.homeroom_teacher_name || '-'} • Total: ${classStudents.length} Siswa`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 max-h-80">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">
                  <tr>
                    <th className="p-3 w-10 text-center">No</th>
                    <th className="p-3">Nama Lengkap Siswa</th>
                    <th className="p-3">NIS</th>
                    <th className="p-3">L/P</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {classStudents.length > 0 ? (
                    classStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{s.full_name}</td>
                        <td className="p-3">{s.nis}</td>
                        <td className="p-3">{s.gender}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 text-[10px]">
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        Belum ada siswa yang ditempatkan di kelas ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
