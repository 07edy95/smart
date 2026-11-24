import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, KeyRound, Save, ShieldCheck, Mail, Phone } from 'lucide-react';

export const ProfileModule: React.FC = () => {
  const { currentUser, updateCurrentUserProfile, showToast } = useApp();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      full_name: fullName,
      phone,
      avatar_url: avatarUrl,
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('Gagal', 'Password baru minimal harus 6 karakter', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Gagal', 'Konfirmasi password baru tidak cocok', 'error');
      return;
    }

    showToast('Sukses', 'Kata sandi Anda berhasil diperbarui.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="clay-card p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Profil Pengguna & Keamanan Akun
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Perbarui informasi kontak pribadi dan kata sandi login Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="clay-card p-6 space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <img
              src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-md"
            />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{currentUser?.full_name}</h3>
              <p className="text-xs text-slate-400">{currentUser?.email}</p>
              <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                Peran: {currentUser?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email (Akun Tetap)
              </label>
              <input
                type="email"
                disabled
                value={currentUser?.email}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp / HP
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL Foto Avatar Profil
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="clay-btn-primary w-full text-xs sm:text-sm py-2.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil</span>
            </button>
          </form>
        </div>

        {/* Password Card */}
        <div className="clay-card p-6 space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-500" />
              Perbarui Kata Sandi
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Amankan akun Anda dengan kata sandi berkala
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi Saat Ini
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi Baru *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Konfirmasi Kata Sandi Baru *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="clay-btn-secondary w-full text-xs sm:text-sm py-2.5 font-bold"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Ganti Kata Sandi</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
