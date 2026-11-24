import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Subject } from '../../types/database';
import { exportToExcel, parseExcelFile } from '../../utils/helpers';
import { 
  BookOpen, Edit3, Trash2, Clock, UserCheck, Upload, Download, 
  FileSpreadsheet, Clipboard, AlertCircle, CheckCircle2, Check, Users 
} from 'lucide-react';

export const SubjectModule: React.FC = () => {
  const { 
    subjects, 
    addSubject, 
    updateSubject, 
    deleteSubject, 
    bulkDeleteSubjects,
    importSubjects, 
    teachers, 
    role, 
    currentUser, 
    teacherProfile,
    teacherSubjects,
    showToast 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // State untuk Input Masal Mapel
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkTab, setBulkTab] = useState<'excel' | 'paste'>('excel');
  const [pasteText, setPasteText] = useState('');
  const [bulkPreview, setBulkPreview] = useState<Omit<Subject, 'id'>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Subject>>({
    code: '',
    name: '',
    category: 'Wajib',
    hours_per_week: 2,
    grade_level: 'Semua',
    teacher_id: '',
    teacher_name: '',
    passing_grade: 75,
  });

  const isAdmin = role === 'admin';
  const isGuru = role === 'guru';

  // Identifikasi profil guru jika role guru login
  const myTeacherName = teacherProfile?.full_name || currentUser?.full_name || '';
  const myTeacherId = teacherProfile?.id;

  // Filter mapel: jika guru yang login, hanya tampilkan mata pelajaran yang diajarkan oleh guru bersangkutan
  const displayedSubjects = isAdmin ? subjects : teacherSubjects;

  const handleOpenAdd = () => {
    setSelectedSubject(null);
    setFormData({
      code: 'MAPEL-' + Math.floor(10 + Math.random() * 90),
      name: '',
      category: 'Wajib',
      hours_per_week: 3,
      grade_level: 'Semua',
      teacher_id: '',
      teacher_name: '',
      passing_grade: 75,
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
    const matchedTeacher = teachers.find(t => t.id === formData.teacher_id);
    const payload = {
      ...formData,
      teacher_name: matchedTeacher ? matchedTeacher.full_name : formData.teacher_name,
    };

    if (selectedSubject) {
      updateSubject(selectedSubject.id, payload);
    } else {
      addSubject(payload as Omit<Subject, 'id'>);
    }
    setIsModalOpen(false);
  };

  // Handler Unduh Template Excel Mapel
  const handleDownloadTemplate = () => {
    const sampleTeacher = teachers[0]?.full_name || 'Budi Santoso, M.Pd.';
    const sampleTeacher2 = teachers[1]?.full_name || 'Siti Rahmawati, S.Pd.';

    const template = [
      {
        'Kode Mapel': 'MAT-01',
        'Nama Mata Pelajaran': 'Matematika Umum',
        'Kelompok (Wajib/Peminatan/Muatan Lokal/Pilihan)': 'Wajib',
        'Alokasi Jam': 4,
        'Tingkat Kelas (Semua/X/XI/XII)': 'X',
        'Nama Guru Pengampu': sampleTeacher,
        'KKM': 75
      },
      {
        'Kode Mapel': 'BIO-01',
        'Nama Mata Pelajaran': 'Biologi Peminatan',
        'Kelompok (Wajib/Peminatan/Muatan Lokal/Pilihan)': 'Peminatan',
        'Alokasi Jam': 3,
        'Tingkat Kelas (Semua/X/XI/XII)': 'XI',
        'Nama Guru Pengampu': sampleTeacher2,
        'KKM': 75
      },
      {
        'Kode Mapel': 'BTI-01',
        'Nama Mata Pelajaran': 'Bahasa dan Sastra Daerah',
        'Kelompok (Wajib/Peminatan/Muatan Lokal/Pilihan)': 'Muatan Lokal',
        'Alokasi Jam': 2,
        'Tingkat Kelas (Semua/X/XI/XII)': 'Semua',
        'Nama Guru Pengampu': sampleTeacher,
        'KKM': 75
      }
    ];
    exportToExcel(template, 'Template_Input_Masal_Mapel_SMART', 'Template Mapel');
    showToast('Template Diunduh', 'Berkas template Excel mata pelajaran berhasil disimpan.');
  };

  // Helper normalisasi kategori
  const normalizeCategory = (cat: string): 'Wajib' | 'Peminatan' | 'Muatan Lokal' | 'Pilihan' => {
    const lower = cat.toLowerCase();
    if (lower.includes('peminatan')) return 'Peminatan';
    if (lower.includes('muatan') || lower.includes('lokal')) return 'Muatan Lokal';
    if (lower.includes('pilihan')) return 'Pilihan';
    return 'Wajib';
  };

  // Handler Parse File Excel Mapel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const json = await parseExcelFile(file);
      if (!Array.isArray(json) || json.length === 0) {
        showToast('Gagal Impor', 'File Excel kosong atau format tidak sesuai', 'error');
        return;
      }

      const parsed: Omit<Subject, 'id'>[] = json.map((row: any, idx: number) => {
        const code = String(row['Kode Mapel'] || row['Kode'] || row['code'] || `MAPEL-${idx + 10}`).trim();
        const name = String(row['Nama Mata Pelajaran'] || row['Nama Mapel'] || row['Mata Pelajaran'] || row['name'] || '').trim();
        const rawCategory = String(row['Kelompok (Wajib/Peminatan/Muatan Lokal/Pilihan)'] || row['Kelompok'] || row['Kategori'] || row['category'] || 'Wajib').trim();
        const category = normalizeCategory(rawCategory);
        const hours = Number(row['Alokasi Jam'] || row['Jam'] || row['hours_per_week'] || 2) || 2;
        const gradeLevel = String(row['Tingkat Kelas (Semua/X/XI/XII)'] || row['Tingkat Kelas'] || row['Kelas'] || row['grade_level'] || 'Semua').trim();
        const teacherNameInput = String(row['Nama Guru Pengampu'] || row['Guru Pengampu'] || row['Guru'] || row['teacher_name'] || '').trim();
        const kkm = Number(row['KKM'] || row['passing_grade'] || 75) || 75;

        // Cocokkan dengan data guru yang ada
        const matchedTeacher = teachers.find(t => 
          teacherNameInput && (
            t.full_name.toLowerCase().includes(teacherNameInput.toLowerCase()) ||
            teacherNameInput.toLowerCase().includes(t.full_name.toLowerCase())
          )
        );

        return {
          code,
          name,
          category,
          hours_per_week: hours,
          grade_level: gradeLevel || 'Semua',
          teacher_id: matchedTeacher?.id || '',
          teacher_name: matchedTeacher ? matchedTeacher.full_name : (teacherNameInput || undefined),
          passing_grade: kkm,
        };
      }).filter(s => s.name.length > 0);

      if (parsed.length === 0) {
        showToast('Data Kosong', 'Tidak ditemukan baris mata pelajaran yang valid dalam file Excel.', 'error');
        return;
      }

      setBulkPreview(parsed);
      showToast('Pratinjau Siap', `Berhasil memuat ${parsed.length} mata pelajaran dari Excel.`);
    } catch (err: any) {
      showToast('Gagal Membaca File', err.message || 'Format file salah', 'error');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handler Parse Teks Salin-Tempel Mapel
  const handleParsePaste = () => {
    if (!pasteText.trim()) {
      showToast('Teks Kosong', 'Silakan tempel (paste) data mata pelajaran terlebih dahulu.', 'error');
      return;
    }

    const lines = pasteText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const parsed: Omit<Subject, 'id'>[] = [];

    lines.forEach((line, idx) => {
      let cols: string[] = [];
      if (line.includes('\t')) {
        cols = line.split('\t').map(c => c.trim());
      } else if (line.includes(';')) {
        cols = line.split(';').map(c => c.trim());
      } else {
        cols = line.split(',').map(c => c.trim());
      }

      // Format urutan: Kode, Nama Mapel, Kelompok, Alokasi Jam, Tingkat, Guru Pengampu, KKM
      // Atau jika kolom 1 langsung Nama: Nama, Kelompok, Jam, Tingkat, Guru
      let code = '';
      let name = '';
      let rawCategory = 'Wajib';
      let hours = 2;
      let gradeLevel = 'Semua';
      let teacherNameInput = '';
      let kkm = 75;

      if (cols.length >= 2) {
        if (cols[0].toUpperCase().includes('MAPEL') || cols[0].length <= 8 && !cols[0].includes(' ')) {
          code = cols[0];
          name = cols[1];
          rawCategory = cols[2] || 'Wajib';
          hours = Number(cols[3]) || 2;
          gradeLevel = cols[4] || 'Semua';
          teacherNameInput = cols[5] || '';
          kkm = Number(cols[6]) || 75;
        } else {
          name = cols[0];
          code = `MAPEL-${idx + 10}`;
          rawCategory = cols[1] || 'Wajib';
          hours = Number(cols[2]) || 2;
          gradeLevel = cols[3] || 'Semua';
          teacherNameInput = cols[4] || '';
          kkm = Number(cols[5]) || 75;
        }
      } else if (cols.length === 1 && cols[0]) {
        name = cols[0];
        code = `MAPEL-${idx + 10}`;
      }

      if (!name) return;

      const matchedTeacher = teachers.find(t => 
        teacherNameInput && (
          t.full_name.toLowerCase().includes(teacherNameInput.toLowerCase()) ||
          teacherNameInput.toLowerCase().includes(t.full_name.toLowerCase())
        )
      );

      parsed.push({
        code: code || `MAPEL-${idx + 10}`,
        name,
        category: normalizeCategory(rawCategory),
        hours_per_week: hours,
        grade_level: gradeLevel,
        teacher_id: matchedTeacher?.id || '',
        teacher_name: matchedTeacher ? matchedTeacher.full_name : (teacherNameInput || undefined),
        passing_grade: kkm,
      });
    });

    if (parsed.length === 0) {
      showToast('Gagal Parsing', 'Format data tidak terbaca. Pastikan dipisahkan koma atau tab.', 'error');
      return;
    }

    setBulkPreview(parsed);
    showToast('Pratinjau Siap', `Berhasil memproses ${parsed.length} baris mata pelajaran.`);
  };

  // Handler Simpan Data Masal Mapel
  const handleSaveBulk = () => {
    if (bulkPreview.length === 0) {
      showToast('Data Kosong', 'Belum ada data mata pelajaran yang siap disimpan.', 'error');
      return;
    }

    importSubjects(bulkPreview);
    setIsBulkModalOpen(false);
    setBulkPreview([]);
    setPasteText('');
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
      header: 'Guru Pengampu',
      cell: (s) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {s.teacher_name || <span className="text-slate-400 font-normal italic">Belum ditentukan</span>}
            </p>
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
        if (s.category === 'Pilihan') badgeColor = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';

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
          <span>{s.hours_per_week} Jam / Minggu</span>
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
      header: 'KKM',
      cell: (s) => (
        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
          {s.passing_grade || 75}
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
      {/* Banner informasi jika user adalah guru */}
      {isGuru && (
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-950 dark:text-blue-100">
              Mata Pelajaran yang Anda Ampu ({myTeacherName})
            </h4>
            <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
              Menampilkan mata pelajaran yang ditugaskan kepada Anda pada tahun ajaran ini.
            </p>
          </div>
        </div>
      )}

      <DataTable
        title={isGuru ? 'Mata Pelajaran Saya' : 'Daftar Mata Pelajaran (Kurikulum)'}
        subtitle={
          isGuru
            ? `Daftar mata pelajaran yang diampu oleh ${myTeacherName}`
            : 'Mata pelajaran wajib umum, peminatan, muatan lokal, dan alokasi guru pengampu'
        }
        data={displayedSubjects}
        columns={columns}
        searchPlaceholder="Cari nama mata pelajaran, kode, atau guru pengampu..."
        searchKeys={['name', 'code', 'category', 'teacher_name']}
        onAddClick={isAdmin ? handleOpenAdd : undefined}
        addButtonLabel="Tambah Mapel"
        onBulkDelete={isAdmin ? bulkDeleteSubjects : undefined}
        extraActions={
          isAdmin ? (
            <button
              onClick={() => {
                setBulkPreview([]);
                setPasteText('');
                setIsBulkModalOpen(true);
              }}
              className="clay-btn-secondary text-xs py-2 px-3.5 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-950/30"
              title="Input Masal Mata Pelajaran"
            >
              <Upload className="w-4 h-4" />
              <span>Input Masal Mapel</span>
            </button>
          ) : undefined
        }
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
        subtitle="Konfigurasi kurikulum, guru pengampu, dan alokasi jam"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Guru Pengampu Mata Pelajaran
            </label>
            <select
              value={formData.teacher_id || ''}
              onChange={(e) => {
                const tchId = e.target.value;
                const tch = teachers.find(t => t.id === tchId);
                setFormData({
                  ...formData,
                  teacher_id: tchId,
                  teacher_name: tch ? tch.full_name : '',
                });
              }}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            >
              <option value="">-- Pilih Guru Pengampu (Opsional) --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name} {t.nip ? `(NIP: ${t.nip})` : ''} - {t.position || 'Guru'}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Guru yang dipilih hanya akan dapat mengelola nilai, jadwal, dan materi untuk mata pelajaran ini.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alokasi Jam / Minggu
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                KKM (Ketuntasan)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={formData.passing_grade || 75}
                onChange={(e) => setFormData({ ...formData, passing_grade: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
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
              Simpan Mapel
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Input Masal Mata Pelajaran */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Input Masal Mata Pelajaran"
        subtitle="Impor banyak mata pelajaran sekaligus melalui file Excel atau salin-tempel teks"
        maxWidth="3xl"
      >
        <div className="space-y-5">
          {/* Navigasi Tab */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 gap-4">
            <button
              type="button"
              onClick={() => setBulkTab('excel')}
              className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
                bulkTab === 'excel'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Upload File Excel / CSV
            </button>
            <button
              type="button"
              onClick={() => setBulkTab('paste')}
              className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
                bulkTab === 'paste'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Clipboard className="w-4 h-4" />
              Salin-Tempel (Copy-Paste)
            </button>
          </div>

          {bulkTab === 'excel' ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 gap-3">
                <div>
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    Gunakan Format Template Excel Mapel Resmi
                  </h4>
                  <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                    Download berkas template standar agar kolom kode, nama mapel, dan guru pengampu dapat terbaca otomatis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="clay-btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 flex-shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template Excel</span>
                </button>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-7 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  Klik untuk memilih file Excel (.xlsx / .csv)
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Atau seret dan lepas berkas Excel mata pelajaran ke area ini
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Format baris yang didukung (Pisahkan dengan koma atau Tab dari Excel):
                </p>
                <p className="font-mono bg-white/70 dark:bg-black/30 p-2 rounded-xl text-[10px] text-slate-700 dark:text-slate-300">
                  Kode Mapel, Nama Mata Pelajaran, Kelompok, Alokasi Jam, Tingkat, Guru Pengampu, KKM
                </p>
                <p className="mt-1 text-slate-500 dark:text-slate-400 text-[10px]">
                  Contoh: <span className="font-semibold">MAT-01, Matematika Umum, Wajib, 4, X, Drs. Budi Santoso M.Pd., 75</span>
                </p>
              </div>

              <textarea
                rows={6}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Tempel (paste) baris data mata pelajaran dari spreadsheet di sini..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParsePaste}
                  className="clay-btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Proses Teks & Pratinjau</span>
                </button>
              </div>
            </div>
          )}

          {/* Pratinjau Data Mata Pelajaran yang Terbaca */}
          {bulkPreview.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    Pratinjau Data ({bulkPreview.length} Mata Pelajaran)
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    Siap Disimpan
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setBulkPreview([])}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Hapus Pratinjau
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Kode</th>
                      <th className="p-2.5">Nama Mata Pelajaran</th>
                      <th className="p-2.5">Kelompok</th>
                      <th className="p-2.5">Jam</th>
                      <th className="p-2.5">Tingkat</th>
                      <th className="p-2.5">Guru Pengampu</th>
                      <th className="p-2.5">KKM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {bulkPreview.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                        <td className="p-2.5 font-mono text-blue-600 font-semibold">{item.code}</td>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-white">{item.name}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{item.category}</td>
                        <td className="p-2.5 text-center font-bold">{item.hours_per_week} Jam</td>
                        <td className="p-2.5 text-slate-500">{item.grade_level}</td>
                        <td className="p-2.5 font-medium text-emerald-600 dark:text-emerald-400">
                          {item.teacher_name || <span className="text-slate-400 italic">Belum ditentukan</span>}
                        </td>
                        <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300">{item.passing_grade || 75}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-500 italic">
                  *Guru pengampu otomatis dicocokkan dengan master Data Guru yang ada di sistem.
                </p>
                <button
                  type="button"
                  onClick={handleSaveBulk}
                  className="clay-btn-primary text-xs py-2.5 px-5 flex items-center justify-center gap-2 shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Seluruh {bulkPreview.length} Mata Pelajaran</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
