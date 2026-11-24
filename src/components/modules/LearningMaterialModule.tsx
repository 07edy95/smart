import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { LearningMaterial } from '../../types/database';
import { uploadFile } from '../../lib/supabase';
import { BookOpen, Plus, Download, Trash2, FileText, Video, Presentation } from 'lucide-react';

export const LearningMaterialModule: React.FC = () => {
  const { 
    learningMaterials, addLearningMaterial, deleteLearningMaterial, 
    classes, subjects, teachers, role, teacherProfile 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Modul' | 'Buku Paket' | 'Video' | 'Slide' | 'Latihan'>('Modul');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [fileUrl, setFileUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isSiswa = role === 'siswa';
  const isAdmin = role === 'admin';
  const isGuru = role === 'guru';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let finalUrl = fileUrl;
    if (selectedFile) {
      const res = await uploadFile('materials', selectedFile);
      if (res.url) finalUrl = res.url;
    }

    addLearningMaterial({
      title,
      description,
      category,
      class_id: classId,
      subject_id: subjectId,
      teacher_id: teacherProfile?.id || teachers[0]?.id || '',
      file_url: finalUrl || undefined,
    });

    setIsUploading(false);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setSelectedFile(null);
  };

  const columns: Column<LearningMaterial>[] = [
    {
      header: 'Judul Materi & Deskripsi',
      cell: (m) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center flex-shrink-0">
            {m.category === 'Video' ? <Video className="w-5 h-5" /> : m.category === 'Slide' ? <Presentation className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{m.title}</h4>
            <p className="text-[11px] text-slate-500 line-clamp-1">{m.description}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Kategori',
      cell: (m) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          {m.category}
        </span>
      ),
    },
    {
      header: 'Mata Pelajaran & Kelas',
      cell: (m) => (
        <div className="text-xs">
          <p className="font-bold text-slate-800 dark:text-white">{m.subject_name}</p>
          <p className="text-slate-400">{m.class_name || 'Semua Kelas'}</p>
        </div>
      ),
    },
    {
      header: 'Pengunggah',
      cell: (m) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{m.teacher_name}</span>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (m) => (
        <div className="flex items-center justify-center gap-1.5">
          {m.file_url ? (
            <a
              href={m.file_url}
              target="_blank"
              rel="noreferrer"
              className="clay-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 text-blue-600"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh</span>
            </a>
          ) : (
            <span className="text-xs text-slate-400">Tidak ada file</span>
          )}

          {!isSiswa && (
            <button
              onClick={() => {
                if (window.confirm(`Hapus materi "${m.title}"?`)) {
                  deleteLearningMaterial(m.id);
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
        title="Materi Pembelajaran & E-Book"
        subtitle="Katalog modul belajar, presentasi slide, rekaman video, dan bahan pengayaan"
        data={learningMaterials}
        columns={columns}
        searchPlaceholder="Cari materi, modul, mata pelajaran..."
        searchKeys={['title', 'description', 'category', 'subject_name']}
        onAddClick={!isSiswa ? () => setIsModalOpen(true) : undefined}
        addButtonLabel="Unggah Materi Baru"
      />

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Unggah Materi Pembelajaran"
        subtitle="Bagikan materi ke peserta didik"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Judul Materi *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Modul Kinematika Gerak Lurus"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Materi *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="Modul">Modul PDF</option>
                <option value="Buku Paket">Buku Paket</option>
                <option value="Slide">Slide PPT</option>
                <option value="Video">Video Tutorial</option>
                <option value="Latihan">Bank Soal / Latihan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mata Pelajaran *
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kelas Tujuan (Kosongkan jika untuk semua kelas)
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            >
              <option value="">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rangkuman materi atau petunjuk penggunaan..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Unggah File Materi (Supabase Storage)
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
              disabled={isUploading}
              className="clay-btn-primary text-xs py-2 px-5"
            >
              {isUploading ? 'Mengunggah...' : 'Simpan Materi'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
