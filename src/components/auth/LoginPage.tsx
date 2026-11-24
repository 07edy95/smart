import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { School, Lock, User, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, schoolSettings } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(identifier, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#EEF2F6] dark:bg-[#0B132B] relative overflow-hidden">
      {/* Background soft blur shapes */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Claymorphic Card Container */}
        <div className="clay-card p-7 sm:p-9 space-y-6">
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-800 p-2 mx-auto shadow-lg flex items-center justify-center border border-slate-100 dark:border-slate-700">
              <img src="/logo.png" alt="Logo SMA Medanggili Ciruas" className="w-full h-full object-contain" />
            </div>

            <div className="pt-2">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-wider">
                SMART
              </h1>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
                Sistem Manajemen Administrasi Responsif dan Terpadu
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mt-1">
                {schoolSettings.school_name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 italic max-w-xs mx-auto leading-relaxed">
                "Satu Pintu Layanan Digital untuk Guru, Siswa, dan Tata Kelola Sekolah."
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Username atau Email Pengguna
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Masukkan username atau email akun Anda"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kata Sandi (Password)
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="clay-btn-primary w-full py-3 text-sm font-bold mt-2"
            >
              <span>{isLoading ? 'Memproses...' : 'Masuk ke Aplikasi'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-5">
          &copy; {new Date().getFullYear()} SMART — {schoolSettings.school_name}. All rights reserved.
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="clay-card p-6 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Lupa Kata Sandi?</h3>
            <p className="text-xs text-slate-500">
              Silakan hubungi Administrator IT Sekolah di Tata Usaha atau kirim email ke <strong className="text-blue-600">{schoolSettings.email}</strong> untuk mengatur ulang kata sandi akun Anda.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="clay-btn-primary w-full text-xs py-2"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
