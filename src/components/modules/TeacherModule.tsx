import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Teacher } from '../../types/database';
import { formatDate, generateUsername, getDefaultPassword } from '../../utils/helpers';
import { UserCheck, Eye, Edit3, Trash2, Mail, Phone, BookOpen, Key, Copy, Check } from 'lucide-react';

export const TeacherModule: React.FC = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher, role, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    </div>
  );
};
