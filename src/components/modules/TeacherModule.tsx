import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Teacher } from '../../types/database';
import { formatDate, generateUsername, getDefaultPassword, exportToExcel, parseExcelFile } from '../../utils/helpers';
import { UserCheck, Eye, Edit3, Trash2, Mail, Phone, BookOpen, Key, Copy, Check, Upload, Download, FileSpreadsheet, Clipboard, AlertCircle, CheckCircle2 } from 'lucide-react';

export const TeacherModule: React.FC = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher, importTeachers, role, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // State untuk Input Masal Guru
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkTab, setBulkTab] = useState<'excel' | 'paste'>('excel');
  const [pasteText, setPasteText] = useState('');
  const [bulkPreview, setBulkPreview] = useState<Omit<Teacher, 'id'>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Teacher>>({
    full_name: '',
    username: '',
    password: '123@Guru',
    nip: '',
    nuptk: '',
    gender: 'L',
    email: '',
    phone: '',
    last_education: 'S1',
    position: 'Guru Mata Pelajaran',
    employment_status: 'PNS',
    birth_place: '',
    birth_date: '1985-01-01',
    address: '',
  });

  const isAdmin = role === 'admin';

  const copyCredentials = (teacher: Teacher) => {
    const username = teacher.username || generateUsername(teacher.full_name);
    const password = teacher.password || '123@Guru';
    const text = `Akun Login Guru SMA Medanggili Ciruas:\nNama: ${teacher.full_name}\nUsername: ${username}\nPassword: ${password}`;
    navigator.clipboard.writeText(text);
    setCopiedId(teacher.id);
    showToast('Kredensial Disalin', `Username: ${username} dan Password: ${password} berhasil disalin.`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenAdd = () => {
    setSelectedTeacher(null);
    setFormData({
      full_name: '',
      username: '',
      password: '123@Guru',
      nip: '',
      nuptk: '',
      gender: 'L',
      email: '',
      phone: '',
      last_education: 'S1',
      position: 'Guru Mata Pelajaran',
      employment_status: 'PNS',
      birth_place: '',
      birth_date: '1985-01-01',
      address: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      ...teacher,
      username: teacher.username || generateUsername(teacher.full_name),
      password: teacher.password || '123@Guru',
    });
    setIsModalOpen(true);
  };

  const handleOpenDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDetailOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUsername = formData.username || generateUsername(formData.full_name || '');
    const finalPassword = formData.password || getDefaultPassword('guru');
    const finalEmail = formData.email || `${finalUsername}@sekolah.sch.id`;

    const payload = {
      ...formData,
      username: finalUsername,
      password: finalPassword,
      email: finalEmail
    };

    if (selectedTeacher) {
      updateTeacher(selectedTeacher.id, payload);
    } else {
      addTeacher(payload as Omit<Teacher, 'id'>);
    }
    setIsModalOpen(false);
  };

  // Handler Unduh Template Excel Guru
  const handleDownloadTemplate = () => {
    const template = [
      {
        'Nama Lengkap & Gelar': 'Drs. Budi Santoso, M.Pd.',
        'NIP': '197501012000031001',
        'Jabatan / Posisi': 'Guru Matematika',
        'Jenis Kelamin (L/P)': 'L',
        'No WhatsApp / HP': '081234567890',
        'Email': 'budi.santoso@sekolah.sch.id'
      },
      {
        'Nama Lengkap & Gelar': 'Siti Rahmawati, S.Pd.',
        'NIP': '198205122008012004',
        'Jabatan / Posisi': 'Guru Bahasa Indonesia',
        'Jenis Kelamin (L/P)': 'P',
        'No WhatsApp / HP': '081398765432',
        'Email': 'siti.rahmawati@sekolah.sch.id'
      }
    ];
    exportToExcel(template, 'Template_Input_Masal_Guru_SMART', 'Template Guru');
    showToast('Template Diunduh', 'Berkas template Excel guru berhasil disimpan ke komputer Anda.');
  };

  // Handler Parse File Excel Guru
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

      const parsed: Omit<Teacher, 'id'>[] = json.map((row: any) => {
        const fullName = String(row['Nama Lengkap & Gelar'] || row['Nama Lengkap'] || row['Nama'] || row['name'] || '').trim();
        const nip = String(row['NIP'] || row['nip'] || '').trim();
        const position = String(row['Jabatan / Posisi'] || row['Jabatan'] || row['Posisi'] || row['Mata Pelajaran'] || 'Guru Mata Pelajaran').trim();
        const rawGender = String(row['Jenis Kelamin (L/P)'] || row['Jenis Kelamin'] || row['gender'] || 'L').trim().toUpperCase();
        const gender: 'L' | 'P' = rawGender.startsWith('P') ? 'P' : 'L';
        const phone = String(row['No WhatsApp / HP'] || row['No HP'] || row['WhatsApp'] || row['phone'] || '').trim();
        const username = generateUsername(fullName);
        const email = String(row['Email'] || row['email'] || (username ? `${username}@sekolah.sch.id` : '')).trim();

        return {
          full_name: fullName,
          username,
          password: '123@Guru',
          nip: nip || undefined,
          position,
          gender,
          phone,
          email,
          last_education: 'S1' as const,
          employment_status: 'PNS' as const,
          birth_place: 'Serang',
          birth_date: '1985-01-01',
          address: 'Banten'
        };
      }).filter(t => t.full_name.length > 0);

      if (parsed.length === 0) {
        showToast('Data Kosong', 'Tidak ditemukan baris data guru yang valid dalam file Excel.', 'error');
        return;
      }

      setBulkPreview(parsed);
      showToast('Pratinjau Siap', `Berhasil memuat ${parsed.length} data guru dari file Excel.`);
    } catch (err: any) {
      showToast('Gagal Membaca File', err.message || 'Format file salah', 'error');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handler Parse Teks Salin-Tempel Guru
  const handleParsePaste = () => {
    if (!pasteText.trim()) {
      showToast('Teks Kosong', 'Silakan tempel (paste) data guru terlebih dahulu.', 'error');
      return;
    }

    const lines = pasteText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const parsed: Omit<Teacher, 'id'>[] = [];

    lines.forEach((line) => {
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

      const nip = cols[1] || '';
      const position = cols[2] || 'Guru Mata Pelajaran';
      const rawGender = (cols[3] || 'L').toUpperCase();
      const gender: 'L' | 'P' = rawGender.startsWith('P') ? 'P' : 'L';
      const phone = cols[4] || '';
      const username = generateUsername(fullName);
      const email = cols[5] || (username ? `${username}@sekolah.sch.id` : '');

      parsed.push({
        full_name: fullName,
        username,
        password: '123@Guru',
        nip: nip || undefined,
        position,
        gender,
        phone,
        email,
        last_education: 'S1' as const,
        employment_status: 'PNS' as const,
        birth_place: 'Serang',
        birth_date: '1985-01-01',
        address: 'Banten'
      });
    });

    if (parsed.length === 0) {
      showToast('Gagal Parsing', 'Format data tidak terbaca. Pastikan dipisahkan tanda koma atau tab.', 'error');
      return;
    }

    setBulkPreview(parsed);
    showToast('Pratinjau Siap', `Berhasil memproses ${parsed.length} baris guru.`);
  };

  // Handler Simpan Data Masal Guru
  const handleSaveBulk = () => {
    if (bulkPreview.length === 0) {
      showToast('Data Kosong', 'Belum ada data guru yang siap disimpan.', 'error');
      return;
    }

    importTeachers(bulkPreview);
    setIsBulkModalOpen(false);
    setBulkPreview([]);
    setPasteText('');
  };

  const columns: Column<Teacher>[] = [
    {
      header: 'Guru / Tenaga Pendidik',
      cell: (t) => (
        <div className="flex items-center gap-3">
          <img
            src={t.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.full_name)}&background=3B82F6&color=fff`}
            alt={t.full_name}
            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          <div>
            <p className="font-bold text-slate-800 dark:text-white leading-tight">{t.full_name}</p>
            <p className="text-[11px] text-slate-400">NIP: {t.nip || '-'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Akun Login Guru',
      cell: (t) => {
        const username = t.username || generateUsername(t.full_name);
        const password = t.password || '123@Guru';
        const isCopied = copiedId === t.id;
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
                onClick={() => copyCredentials(t)}
                className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
                title="Salin username dan password guru"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Kontak & Email',
      cell: (t) => (
        <div className="text-xs space-y-0.5">
          <p className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-blue-500" />
            {t.email}
          </p>
          <p className="text-slate-400 flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-emerald-500" />
            {t.phone || '-'}
          </p>
        </div>
      ),
    },
    {
      header: 'Jabatan & Status',
      cell: (t) => {
        let color = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
        if (t.employment_status === 'PPPK') color = 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
        if (t.employment_status === 'Honorer') color = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';

        return (
          <div className="text-xs space-y-1">
            <p className="font-semibold text-slate-800 dark:text-white">{t.position}</p>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${color}`}>
              {t.employment_status}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (t) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => handleOpenDetail(t)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Lihat Detail Profil"
          >
            <Eye className="w-4 h-4" />
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => handleOpenEdit(t)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Edit Data"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Hapus data guru ${t.full_name}? Akun login guru ini juga akan dinonaktifkan.`)) {
                    deleteTeacher(t.id);
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
        title="Data Guru & Tenaga Kependidikan"
        subtitle="Kelola profil pendidik, NIP, NUPTK, dan akun hak akses pengajar"
        data={teachers}
        columns={columns}
        searchPlaceholder="Cari nama guru, NIP, email..."
        searchKeys={['full_name', 'nip', 'email', 'position']}
        onAddClick={isAdmin ? handleOpenAdd : undefined}
        addButtonLabel="Tambah Guru Baru"
        onBulkDelete={isAdmin ? (ids) => ids.forEach(deleteTeacher) : undefined}
        extraActions={
          isAdmin ? (
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="clay-btn-secondary text-xs sm:text-sm py-2 px-3.5 flex items-center gap-1.5"
              title="Input data guru secara masal via Excel atau Teks Salin-Tempel"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Input Masal Guru</span>
            </button>
          ) : undefined
        }
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
        subtitle="Lengkapi formulir pendidik berikut"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Drs. Ahmad Dahlan, M.Pd."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Resmi *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama.guru@sekolah.sch.id"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIP (18 Digit)
              </label>
              <input
                type="text"
                value={formData.nip || ''}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                placeholder="198203152008011005"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NUPTK (16 Digit)
              </label>
              <input
                type="text"
                value={formData.nuptk || ''}
                onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                placeholder="9876543210123456"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
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
                Nomor HP / WhatsApp *
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="081234567890"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Kepegawaian
              </label>
              <select
                value={formData.employment_status}
                onChange={(e) => setFormData({ ...formData, employment_status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="PNS">PNS</option>
                <option value="PPPK">PPPK</option>
                <option value="GTT">GTT</option>
                <option value="Honorer">Honorer</option>
                <option value="Yayasan">Yayasan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pendidikan Terakhir
              </label>
              <input
                type="text"
                value={formData.last_education || ''}
                onChange={(e) => setFormData({ ...formData, last_education: e.target.value })}
                placeholder="S1 Pendidikan Matematika"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Akun Login Guru */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Pengaturan Akun Login Guru</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username Login Guru
                </label>
                <input
                  type="text"
                  value={formData.username || generateUsername(formData.full_name || '')}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  placeholder="namaguru (otomatis)"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-blue-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Format: nama guru tanpa spasi huruf kecil semua
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi (Default)
                </label>
                <input
                  type="text"
                  value={formData.password || '123@Guru'}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="123@Guru"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-emerald-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Default login guru: <strong>123@Guru</strong>
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Tempat Tinggal
            </label>
            <textarea
              rows={2}
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat domisili lengkap..."
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
              Simpan Guru
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedTeacher && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title="Detail Guru & Tenaga Pendidik"
          subtitle="Informasi kepegawaian lengkap"
        >
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
              <img
                src={selectedTeacher.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTeacher.full_name)}&background=3B82F6&color=fff`}
                alt={selectedTeacher.full_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-md"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedTeacher.full_name}
                </h4>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                  {selectedTeacher.position}
                </p>
                <span className="inline-block mt-1 text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold">
                  Status: {selectedTeacher.employment_status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="clay-inset p-3">
                <span className="text-slate-400 block text-[10px]">NIP</span>
                <span className="font-bold text-slate-800 dark:text-white">{selectedTeacher.nip || '-'}</span>
              </div>
              <div className="clay-inset p-3">
                <span className="text-slate-400 block text-[10px]">NUPTK</span>
                <span className="font-bold text-slate-800 dark:text-white">{selectedTeacher.nuptk || '-'}</span>
              </div>
              <div className="clay-inset p-3">
                <span className="text-slate-400 block text-[10px]">Email</span>
                <span className="font-bold text-slate-800 dark:text-white">{selectedTeacher.email}</span>
              </div>
              <div className="clay-inset p-3">
                <span className="text-slate-400 block text-[10px]">Nomor WhatsApp</span>
                <span className="font-bold text-slate-800 dark:text-white">{selectedTeacher.phone || '-'}</span>
              </div>
              <div className="clay-inset p-3">
                <span className="text-slate-400 block text-[10px]">Pendidikan Terakhir</span>
                <span className="font-bold text-slate-800 dark:text-white">{selectedTeacher.last_education}</span>
              </div>
              <div className="clay-inset p-3">
                <span className="text-slate-400 block text-[10px]">Tempat, Tanggal Lahir</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {selectedTeacher.birth_place || '-'}, {formatDate(selectedTeacher.birth_date)}
                </span>
              </div>
            </div>

            {/* Akun Login Info di Modal Detail */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-blue-600" />
                  Kredensial Akun Login Guru
                </span>
                <button
                  type="button"
                  onClick={() => copyCredentials(selectedTeacher)}
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
                    {selectedTeacher.username || generateUsername(selectedTeacher.full_name)}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-normal">Password:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {selectedTeacher.password || '123@Guru'}
                  </span>
                </div>
              </div>
            </div>

            <div className="clay-inset p-3 text-xs">
              <span className="text-slate-400 block text-[10px] mb-1">Alamat Domisili</span>
              <p className="text-slate-700 dark:text-slate-300">{selectedTeacher.address || '-'}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Import Modal Guru */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setBulkPreview([]);
          setPasteText('');
        }}
        title="Input Masal Data Guru & Tenaga Pendidik"
        subtitle="Tambah banyak guru sekaligus dengan format Excel atau Salin-Tempel"
        maxWidth="3xl"
      >
        <div className="space-y-5">
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
                    Gunakan Format Template Excel Resmi
                  </h4>
                  <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                    Download format template standar agar data guru dapat terbaca otomatis dengan tepat.
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
                  Atau seret dan lepas file Excel data guru Anda ke sini
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
                  Nama Lengkap, NIP, Jabatan/Mata Pelajaran, Jenis Kelamin (L/P), No HP
                </p>
                <p className="mt-1 text-slate-500 dark:text-slate-400 text-[10px]">
                  Contoh: <span className="font-semibold">Drs. Budi Santoso, 197501012000031001, Guru Matematika, L, 081234567890</span>
                </p>
              </div>

              <textarea
                rows={6}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Tempel (paste) baris data guru dari Excel di sini..."
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

          {/* Pratinjau Data Guru yang Terbaca */}
          {bulkPreview.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    Pratinjau Data ({bulkPreview.length} Guru)
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
                      <th className="p-2.5">Nama Lengkap</th>
                      <th className="p-2.5">NIP</th>
                      <th className="p-2.5">Posisi</th>
                      <th className="p-2.5">L/P</th>
                      <th className="p-2.5">Username Login</th>
                      <th className="p-2.5">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {bulkPreview.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-white">{item.full_name}</td>
                        <td className="p-2.5 text-slate-500 font-mono text-[11px]">{item.nip || '-'}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{item.position}</td>
                        <td className="p-2.5 text-center font-bold text-blue-600">{item.gender}</td>
                        <td className="p-2.5 font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                          {item.username}
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                          123@Guru
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-500 italic">
                  *Setiap guru akan dibuatkan akun login otomatis dengan username di atas dan password default 123@Guru.
                </p>
                <button
                  type="button"
                  onClick={handleSaveBulk}
                  className="clay-btn-primary text-xs py-2.5 px-5 flex items-center justify-center gap-2 shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Seluruh {bulkPreview.length} Data Guru</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
