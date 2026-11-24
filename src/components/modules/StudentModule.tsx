import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Student } from '../../types/database';
import { formatDate, parseExcelFile, exportToExcel, generateUsername, getDefaultPassword } from '../../utils/helpers';
import { 
  GraduationCap, Eye, Edit3, Trash2, Upload, Download,
  FileSpreadsheet, Phone, Users, CheckCircle2, AlertCircle,
  Key, Copy, Check, Clipboard 
} from 'lucide-react';

export const StudentModule: React.FC = () => {
  const { 
    students, addStudent, updateStudent, deleteStudent, 
    bulkDeleteStudents, importStudents, classes, role, showToast 
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // State untuk Input Masal Siswa
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkTab, setBulkTab] = useState<'excel' | 'paste'>('excel');
  const [pasteText, setPasteText] = useState('');
  const [bulkPreview, setBulkPreview] = useState<Omit<Student, 'id'>[]>([]);
  const [selectedBulkClass, setSelectedBulkClass] = useState<string>('');

  // Filter state
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState<Partial<Student>>({
    full_name: '',
    username: '',
    password: '123@Siswa',
    nis: '',
    nisn: '',
    gender: 'L',
    birth_place: '',
    birth_date: '2008-01-01',
    religion: 'Islam',
    class_id: classes[0]?.id || '',
    father_name: '',
    mother_name: '',
    parent_phone: '',
    enrollment_year: '2025',
    status: 'aktif',
    address: '',
  });

  const isAdmin = role === 'admin';

  const copyCredentials = (student: Student) => {
    const username = student.username || generateUsername(student.full_name);
    const password = student.password || '123@Siswa';
    const text = `Akun Login Siswa SMA Medanggili Ciruas:\nNama: ${student.full_name}\nUsername: ${username}\nPassword: ${password}`;
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    showToast('Kredensial Disalin', `Username: ${username} dan Password: ${password} berhasil disalin.`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Apply filters
  const filteredStudents = students.filter((s) => {
    if (filterClass !== 'all' && s.class_id !== filterClass) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setSelectedStudent(null);
    setFormData({
      full_name: '',
      username: '',
      password: '123@Siswa',
      nis: '25' + Math.floor(1000 + Math.random() * 9000),
      nisn: '008' + Math.floor(1000000 + Math.random() * 9000000),
      gender: 'L',
      birth_place: 'Serang',
      birth_date: '2008-05-15',
      religion: 'Islam',
      class_id: classes[0]?.id || '',
      father_name: '',
      mother_name: '',
      parent_phone: '',
      enrollment_year: '2025',
      status: 'aktif',
      address: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      ...student,
      username: student.username || generateUsername(student.full_name),
      password: student.password || '123@Siswa',
    });
    setIsModalOpen(true);
  };

  const handleOpenDetail = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUsername = formData.username || generateUsername(formData.full_name || '');
    const finalPassword = formData.password || getDefaultPassword('siswa');

    const payload = {
      ...formData,
      username: finalUsername,
      password: finalPassword,
    };

    if (selectedStudent) {
      updateStudent(selectedStudent.id, payload);
    } else {
      addStudent(payload as Omit<Student, 'id'>);
    }
    setIsModalOpen(false);
  };

  // Handler Unduh Template Excel Siswa
  const handleDownloadTemplate = () => {
    const template = [
      {
        'Nama Lengkap': 'Ahmad Dani Pratama',
        'NIS': '202510001',
        'NISN': '0081234567',
        'Jenis Kelamin (L/P)': 'L',
        'Kelas': classes[0]?.name || 'X-A',
        'Tempat Lahir': 'Serang',
        'Tanggal Lahir': '2009-05-12',
        'Nama Orang Tua / Wali': 'H. Dani Suryana',
        'No HP Ortu / WhatsApp': '081234567890',
        'Alamat': 'Ciruas, Serang'
      },
      {
        'Nama Lengkap': 'Nabila Zahra Putri',
        'NIS': '202510002',
        'NISN': '0089876543',
        'Jenis Kelamin (L/P)': 'P',
        'Kelas': classes[0]?.name || 'X-A',
        'Tempat Lahir': 'Serang',
        'Tanggal Lahir': '2009-08-20',
        'Nama Orang Tua / Wali': 'Rahmat Hidayat',
        'No HP Ortu / WhatsApp': '081398765432',
        'Alamat': 'Ciruas, Serang'
      }
    ];
    exportToExcel(template, 'Template_Input_Masal_Siswa_SMART', 'Template Siswa');
    showToast('Template Diunduh', 'Berkas template Excel siswa berhasil disimpan ke komputer Anda.');
  };

  // Handler Parse File Excel Siswa
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const json = await parseExcelFile(file);
      if (!Array.isArray(json) || json.length === 0) {
        showToast('Gagal Impor', 'File Excel kosong atau format tidak sesuai', 'error');
        return;
      }

      const defaultClass = classes.find(c => c.id === selectedBulkClass)?.name || classes[0]?.name;

      const parsed: Omit<Student, 'id'>[] = json.map((row: any, idx: number) => {
        const fullName = String(row['Nama Lengkap'] || row['Nama'] || row['name'] || '').trim();
        const nis = String(row['NIS'] || row['nis'] || Math.floor(100000 + idx)).trim();
        const nisn = String(row['NISN'] || row['nisn'] || Math.floor(1000000000 + idx)).trim();
        const rawGender = String(row['Jenis Kelamin (L/P)'] || row['Jenis Kelamin'] || row['gender'] || 'L').trim().toUpperCase();
        const gender: 'L' | 'P' = rawGender.startsWith('P') ? 'P' : 'L';
        const className = String(row['Kelas'] || row['class'] || defaultClass || '').trim();
        const matchedClass = classes.find(c => c.name.toLowerCase() === className.toLowerCase() || c.id === selectedBulkClass);
        const username = generateUsername(fullName);

        return {
          full_name: fullName,
          username,
          password: '123@Siswa',
          nis,
          nisn,
          gender,
          class_id: matchedClass?.id,
          class_name: matchedClass?.name || className,
          birth_place: String(row['Tempat Lahir'] || 'Serang').trim(),
          birth_date: String(row['Tanggal Lahir'] || '2009-01-01').trim(),
          religion: 'Islam',
          father_name: String(row['Nama Orang Tua / Wali'] || row['Nama Ayah'] || '').trim(),
          mother_name: String(row['Nama Ibu'] || '').trim(),
          parent_phone: String(row['No HP Ortu / WhatsApp'] || row['No HP Ortu'] || row['phone'] || '').trim(),
          enrollment_year: '2025',
          status: 'aktif' as const,
          address: String(row['Alamat'] || 'Banten').trim(),
        };
      }).filter(s => s.full_name.length > 0);

      if (parsed.length === 0) {
        showToast('Data Kosong', 'Tidak ditemukan baris data siswa yang valid dalam file Excel.', 'error');
        return;
      }

      setBulkPreview(parsed);
      showToast('Pratinjau Siap', `Berhasil memuat ${parsed.length} data siswa dari file Excel.`);
    } catch (err: any) {
      showToast('Error Membaca Excel', err.message || 'Format file salah', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handler Parse Teks Salin-Tempel Siswa
  const handleParsePaste = () => {
    if (!pasteText.trim()) {
      showToast('Teks Kosong', 'Silakan tempel (paste) data siswa terlebih dahulu.', 'error');
      return;
    }

    const lines = pasteText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const parsed: Omit<Student, 'id'>[] = [];
    const defaultClass = classes.find(c => c.id === selectedBulkClass)?.name || classes[0]?.name;

    lines.forEach((line, idx) => {
      let cols: string[] = [];
      if (line.includes('\t')) {
        cols = line.split('\t').map(c => c.trim());
      } else if (line.includes(';')) {
        cols = line.split(';').map(c => c.trim());
      } else {
        cols = line.split(',').map(c => c.trim());
      }

      const fullName = cols[0] || '';
      if (!fullName) return;

      const nis = cols[1] || String(Math.floor(100000 + idx));
      const nisn = cols[2] || String(Math.floor(1000000000 + idx));
      const rawGender = (cols[3] || 'L').toUpperCase();
      const gender: 'L' | 'P' = rawGender.startsWith('P') ? 'P' : 'L';
      const className = cols[4] || defaultClass || '';
      const matchedClass = classes.find(c => c.name.toLowerCase() === className.toLowerCase() || c.id === selectedBulkClass);
      const parentPhone = cols[5] || '';
      const username = generateUsername(fullName);

      parsed.push({
        full_name: fullName,
        username,
        password: '123@Siswa',
        nis,
        nisn,
        gender,
        class_id: matchedClass?.id,
        class_name: matchedClass?.name || className,
        birth_place: 'Serang',
        birth_date: '2009-01-01',
        religion: 'Islam',
        parent_phone: parentPhone,
        enrollment_year: '2025',
        status: 'aktif' as const,
        address: 'Banten'
      });
    });

    if (parsed.length === 0) {
      showToast('Gagal Parsing', 'Format data tidak terbaca. Pastikan dipisahkan tanda koma atau tab.', 'error');
      return;
    }

    setBulkPreview(parsed);
    showToast('Pratinjau Siap', `Berhasil memproses ${parsed.length} baris siswa.`);
  };

  // Handler Simpan Data Masal Siswa
  const handleSaveBulk = () => {
    if (bulkPreview.length === 0) {
      showToast('Data Kosong', 'Belum ada data siswa yang siap disimpan.', 'error');
      return;
    }

    importStudents(bulkPreview);
    setIsBulkModalOpen(false);
    setBulkPreview([]);
    setPasteText('');
  };

  const columns: Column<Student>[] = [
    {
      header: 'Peserta Didik (Siswa)',
      cell: (s) => (
        <div className="flex items-center gap-3">
          <img
            src={s.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name)}&background=2563EB&color=fff`}
            alt={s.full_name}
            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          <div>
            <p className="font-bold text-slate-800 dark:text-white leading-tight">{s.full_name}</p>
            <p className="text-[11px] text-slate-400">NIS: {s.nis} • NISN: {s.nisn}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Akun Login Siswa',
      cell: (s) => {
        const username = s.username || generateUsername(s.full_name);
        const password = s.password || '123@Siswa';
        const isCopied = copiedId === s.id;
        return (
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
              <span className="text-slate-400 font-sans font-normal text-[10px]">User:</span>
              <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200/60 dark:border-blue-900/40">
                {username}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-slate-400 font-sans font-normal text-[10px]">Pass:</span>
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-200/60 dark:border-emerald-900/40">
                {password}
              </span>
              <button
                type="button"
                onClick={() => copyCredentials(s)}
                className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
                title="Salin username dan password siswa"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Kelas / Rombel',
      cell: (s) => (
        <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {s.class_name || 'Belum Ada'}
        </span>
      ),
    },
    {
      header: 'L/P',
      accessorKey: 'gender',
      className: 'text-center',
    },
    {
      header: 'Kontak Orang Tua',
      cell: (s) => (
        <div className="text-xs">
          <p className="text-slate-700 dark:text-slate-300">{s.father_name || s.mother_name || 'Wali Siswa'}</p>
          <p className="text-slate-400 flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-500" />
            {s.parent_phone || '-'}
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (s) => {
        let color = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        if (s.status === 'lulus') color = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
        if (s.status === 'pindah') color = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
        if (s.status === 'keluar') color = 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';

        return (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${color}`}>
            {s.status}
          </span>
        );
      },
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (s) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => handleOpenDetail(s)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Lihat Detail Siswa"
          >
            <Eye className="w-4 h-4" />
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => handleOpenEdit(s)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Edit Data Siswa"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Hapus data siswa ${s.full_name}?`)) {
                    deleteStudent(s.id);
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
      {/* Hidden File Input for Excel Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      <DataTable
        title="Buku Induk Data Siswa"
        subtitle="Manajemen data pokok siswa, NIS, NISN, kelas, dan data orang tua"
        data={filteredStudents}
        columns={columns}
        searchPlaceholder="Cari nama siswa, NIS, NISN..."
        searchKeys={['full_name', 'nis', 'nisn', 'father_name', 'mother_name']}
        onAddClick={isAdmin ? handleOpenAdd : undefined}
        addButtonLabel="Tambah Siswa Baru"
        onBulkDelete={isAdmin ? bulkDeleteStudents : undefined}
        extraActions={
          isAdmin ? (
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="clay-btn-secondary text-xs sm:text-sm py-2 px-3.5 flex items-center gap-1.5"
              title="Input data siswa secara masal via Excel atau Teks Salin-Tempel"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Input Masal Siswa</span>
            </button>
          ) : undefined
        }
        filterComponent={
          <div className="flex items-center gap-2">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="lulus">Lulus</option>
              <option value="pindah">Pindah</option>
              <option value="keluar">Keluar</option>
            </select>
          </div>
        }
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
        subtitle="Formulir data pokok peserta didik"
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap Siswa *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Ahmad Rizky Pratama"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
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
                <option value="">Pilih Kelas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIS (Nomor Induk Siswa) *
              </label>
              <input
                type="text"
                value={formData.nis}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                placeholder="250101"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NISN (10 Digit Nasional) *
              </label>
              <input
                type="text"
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                placeholder="0081234501"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Kelamin *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={formData.birth_place || ''}
                onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                placeholder="Jakarta"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Agama
              </label>
              <select
                value={formData.religion}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Ayah Kandung
              </label>
              <input
                type="text"
                value={formData.father_name || ''}
                onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                placeholder="Nama ayah..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Ibu Kandung
              </label>
              <input
                type="text"
                value={formData.mother_name || ''}
                onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                placeholder="Nama ibu..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                No HP / WhatsApp Orang Tua *
              </label>
              <input
                type="text"
                value={formData.parent_phone || ''}
                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                placeholder="081288990011"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Akun Login Siswa */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Pengaturan Akun Login Siswa</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username Login Siswa
                </label>
                <input
                  type="text"
                  value={formData.username || generateUsername(formData.full_name || '')}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  placeholder="namasiswa (otomatis)"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-blue-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Format: nama siswa tanpa spasi huruf kecil semua
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi (Default)
                </label>
                <input
                  type="text"
                  value={formData.password || '123@Siswa'}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="123@Siswa"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-emerald-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Default login siswa: <strong>123@Siswa</strong>
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Tempat Tinggal Siswa
            </label>
            <textarea
              rows={2}
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat domisili siswa..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
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
              Simpan Data Siswa
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedStudent && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title="Detail Peserta Didik"
          subtitle="Buku induk dan arsip identitas siswa"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
              <img
                src={selectedStudent.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.full_name)}&background=2563EB&color=fff`}
                alt={selectedStudent.full_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-md"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedStudent.full_name}
                </h4>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                  {selectedStudent.class_name} • Status: {selectedStudent.status}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  NIS: {selectedStudent.nis} | NISN: {selectedStudent.nisn}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="clay-inset p-3">
                <span className="text-slate-400 block text-[10px]">Tempat, Tanggal Lahir</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {selectedStudent.birth_place || '-'}, {formatDate(selectedStudent.birth_date)}
                </span>
              </div>
              <div className="clay-inset p-3">
                <span className="text-slate-400 block text-[10px]">Agama & Gender</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {selectedStudent.religion} ({selectedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'})
                </span>
              </div>
              <div className="clay-inset p-3">
                <span className="text-slate-400 block text-[10px]">Nama Orang Tua</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  Ayah: {selectedStudent.father_name || '-'} / Ibu: {selectedStudent.mother_name || '-'}
                </span>
              </div>
              <div className="clay-inset p-3">
                <span className="text-slate-400 block text-[10px]">WhatsApp Orang Tua</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {selectedStudent.parent_phone || '-'}
                </span>
              </div>
            </div>

            {/* Akun Login Siswa Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-blue-600" />
                  Kredensial Akun Login Siswa
                </span>
                <button
                  type="button"
                  onClick={() => copyCredentials(selectedStudent)}
                  className="clay-btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Salin Info Akun
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-normal">Username:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {selectedStudent.username || generateUsername(selectedStudent.full_name)}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-normal">Password:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {selectedStudent.password || '123@Siswa'}
                  </span>
                </div>
              </div>
            </div>

            <div className="clay-inset p-3 text-xs">
              <span className="text-slate-400 block text-[10px] mb-1">Alamat Tempat Tinggal</span>
              <p className="text-slate-700 dark:text-slate-300">{selectedStudent.address || '-'}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Import Modal Siswa */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setBulkPreview([]);
          setPasteText('');
        }}
        title="Input Masal Data Siswa (Peserta Didik)"
        subtitle="Tambah banyak siswa sekaligus dengan format Excel atau Salin-Tempel"
        maxWidth="3xl"
      >
        <div className="space-y-5">
          {/* Target Class Selection Helper */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-white">
                Kelas Default (Opsional)
              </label>
              <p className="text-[11px] text-slate-500">
                Pilih rombel jika data yang diinput semuanya masuk ke satu kelas yang sama
              </p>
            </div>
            <select
              value={selectedBulkClass}
              onChange={(e) => setSelectedBulkClass(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="">Otomatis Sesuai Kolom Data</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
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
                    Gunakan Format Template Excel Siswa
                  </h4>
                  <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                    Download format template standar agar data siswa langsung terpetakan dengan benar.
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
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  Klik untuk memilih file Excel (.xlsx / .csv)
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Atau seret dan lepas file Excel data siswa ke sini
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
                  Nama Lengkap, NIS, NISN, Jenis Kelamin (L/P), Kelas, No HP Ortu
                </p>
                <p className="mt-1 text-slate-500 dark:text-slate-400 text-[10px]">
                  Contoh: <span className="font-semibold">Ahmad Dani Pratama, 202510001, 0081234567, L, X-A, 081234567890</span>
                </p>
              </div>

              <textarea
                rows={6}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Tempel (paste) baris data siswa dari Excel di sini..."
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

          {/* Pratinjau Data Siswa yang Terbaca */}
          {bulkPreview.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    Pratinjau Data ({bulkPreview.length} Siswa)
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
                      <th className="p-2.5">Nama Siswa</th>
                      <th className="p-2.5">NIS / NISN</th>
                      <th className="p-2.5">L/P</th>
                      <th className="p-2.5">Kelas</th>
                      <th className="p-2.5">Username Login</th>
                      <th className="p-2.5">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {bulkPreview.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-white">{item.full_name}</td>
                        <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                          {item.nis} / {item.nisn}
                        </td>
                        <td className="p-2.5 text-center font-bold text-blue-600">{item.gender}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.class_name || 'Umum'}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                          {item.username}
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                          123@Siswa
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-500 italic">
                  *Setiap siswa akan dibuatkan akun login otomatis dengan username di atas dan password default 123@Siswa.
                </p>
                <button
                  type="button"
                  onClick={handleSaveBulk}
                  className="clay-btn-primary text-xs py-2.5 px-5 flex items-center justify-center gap-2 shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Seluruh {bulkPreview.length} Data Siswa</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
