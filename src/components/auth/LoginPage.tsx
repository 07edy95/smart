import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Lock, ArrowRight, HelpCircle, School, Info, Check, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, schoolSettings } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Counter kesalahan login dan popup peringatan
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      return Number(sessionStorage.getItem('sms_failed_login_count') || '0');
    } catch {
      return 0;
    }
  });

  const [errorPopup, setErrorPopup] = useState<{
    message: string;
    type: 'retry' | 'locked';
    attempts: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(identifier, password);
    setIsLoading(false);

    if (!success) {
      const nextCount = failedAttempts + 1;
      setFailedAttempts(nextCount);
      try {
        sessionStorage.setItem('sms_failed_login_count', String(nextCount));
      } catch {}

      if (nextCount >= 6) {
        setErrorPopup({
          message: " Waduhh, Lupa yaa?, Silahkan hubungi admin aja ya :)",
          type: 'locked',
          attempts: nextCount,
        });
      } else {
        setErrorPopup({
          message: " Maaf ya,, Username atau passwordnya salah, coba lagi yukk !",
          type: 'retry',
          attempts: nextCount,
        });
      }
    } else {
      setFailedAttempts(0);
      try {
        sessionStorage.removeItem('sms_failed_login_count');
      } catch {}
    }
  };

  // 3D sphere gradient styling matching the reference image
  const sphereLargeStyle: React.CSSProperties = {
    background: 'radial-gradient(circle at 35% 30%, #5EA1FF 0%, #2563EB 40%, #1D4ED8 70%, #0A2D75 100%)',
    boxShadow: 'inset -8px -8px 20px rgba(4, 18, 54, 0.65), inset 6px 6px 16px rgba(255, 255, 255, 0.45), 0 20px 40px rgba(10, 30, 80, 0.4)',
  };

  const sphereCornerStyle: React.CSSProperties = {
    background: 'radial-gradient(circle at 35% 30%, #60A5FA 0%, #2563EB 45%, #1E40AF 75%, #0B2560 100%)',
    boxShadow: 'inset -6px -6px 16px rgba(4, 18, 54, 0.6), inset 4px 4px 12px rgba(255, 255, 255, 0.4), 0 16px 32px rgba(10, 30, 80, 0.35)',
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-[#1A5CD6] via-[#1650BE] to-[#0E3BA1] relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      {/* Main Floating Card */}
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[36px] shadow-2xl shadow-blue-950/40 relative overflow-hidden flex flex-col md:flex-row min-h-[540px] border border-white/20">
        
        {/* ================= LEFT SECTION: WELCOME & 3D SPHERES ================= */}
        <div className="w-full md:w-[48%] bg-gradient-to-br from-[#1E5CD6] via-[#1650C2] to-[#0E3BA3] p-8 sm:p-10 lg:p-12 text-white relative flex flex-col justify-between overflow-hidden">
          
          {/* Organic Curved Wave Overlay extending smoothly into the right side */}
          <div className="hidden md:block absolute -top-10 -bottom-10 -right-16 w-36 pointer-events-none z-10">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full fill-white dark:fill-slate-900"
            >
              <path d="M0,0 C55,20 85,45 80,75 C75,95 20,100 0,100 Z" />
            </svg>
          </div>

          {/* 3D Spheres Layer */}
          {/* 1. Large 3D Sphere (Center-Bottom) */}
          <div
            style={sphereLargeStyle}
            className="absolute -bottom-10 right-6 md:-bottom-12 md:right-4 w-44 h-44 sm:w-52 sm:h-52 rounded-full pointer-events-none z-20 transition-transform duration-500 hover:scale-105"
          />

          {/* 2. Bottom-Left Corner Sphere */}
          <div
            style={sphereCornerStyle}
            className="absolute -bottom-12 -left-12 w-32 h-32 sm:w-36 sm:h-36 rounded-full pointer-events-none z-0 opacity-90"
          />

          {/* 3. Top-Right Ambient Dome Glow */}
          <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />

          {/* Hero Content */}
          <div className="relative z-30 space-y-4">
            {/* School Badge & Logo */}
            <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm">
                <img
                  src="/logo.png"
                  alt="Logo SMA Medanggili Ciruas"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-[11px] font-black tracking-wider uppercase text-white leading-tight">
                  SMART
                </p>
                <p className="text-[9px] text-blue-100 font-medium leading-none">
                  Sistem Sekolah Terpadu
                </p>
              </div>
            </div>

            {/* Typography matching reference image */}
            <div className="pt-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-white uppercase drop-shadow-sm">
                WELCOME
              </h1>
              <h2 className="text-sm sm:text-base font-bold text-blue-100 tracking-wide mt-1 uppercase">
                {schoolSettings.school_name || 'SMA MEDANGGILI CIRUAS'}
              </h2>
            </div>

            {/* Sub-headline & Description */}
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-xs font-normal">
              Sistem Manajemen Administrasi Responsif dan Terpadu. Satu pintu layanan digital modern untuk dewan guru, siswa, dan tata kelola sekolah.
            </p>
          </div>

          {/* Footer note inside left hero */}
          <div className="relative z-30 pt-16 md:pt-0">
            <div className="flex items-center gap-2 text-[11px] text-blue-200/80 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>NPSN: {schoolSettings.npsn || '20605358'} • Banten, Indonesia</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SECTION: SIGN IN FORM ================= */}
        <div className="w-full md:w-[52%] p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-slate-900 relative z-20">
          
          {/* Peeking 3D Sphere at the bottom-right corner of the card (matching reference) */}
          <div
            style={sphereCornerStyle}
            className="hidden lg:block absolute -bottom-16 -right-16 w-36 h-36 rounded-full pointer-events-none z-0 opacity-80"
          />

          <div className="max-w-sm w-full mx-auto relative z-10 space-y-6">
            
            {/* Form Header */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                Sign in
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-1.5">
                Silakan masukkan kredensial akun sekolah Anda untuk melanjutkan.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Input: Username */}
              <div className="space-y-1">
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 rounded-xl px-3.5 py-2.5 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800">
                  <User className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="User Name / Email"
                    className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>

              {/* Input: Password */}
              <div className="space-y-1">
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 rounded-xl px-3.5 py-2.5 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 tracking-wider uppercase ml-2 px-1 focus:outline-none transition-colors"
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {/* Options Row: Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#10316B] hover:bg-[#0c2654] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-950/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? 'Memproses...' : 'Sign in'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4 ml-0.5" />}
              </button>

              {/* Divider: Or */}
              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
                <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 font-medium absolute">
                  Or
                </span>
              </div>

              {/* Tombol Sign Up Dinaikkan ke Atas */}
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-800 dark:border-slate-500 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <span>Sign up</span>
              </button>
            </form>

            {/* Bottom Credit */}
            <div className="pt-2 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                aplikasi dibuat oleh @hanumpedia
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Credit Luar Kartu */}
      <p className="text-center text-xs text-blue-100/90 font-medium mt-4 tracking-wide drop-shadow-sm">
        aplikasi dibuat oleh @hanumpedia
      </p>

      {/* ================= MODAL: LUPA KATA SANDI / SIGN UP ================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Bantuan Akun & Kata Sandi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Pendaftaran akun dan reset kata sandi dikelola langsung oleh Operator Tata Usaha Sekolah {schoolSettings.school_name}.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-600/60 space-y-1.5 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">Kontak Operator IT:</p>
              <p className="text-slate-600 dark:text-slate-300">Email: <strong className="text-blue-600 dark:text-blue-400">{schoolSettings.email || 'info@smamedanggilicrs.sch.id'}</strong></p>
              <p className="text-slate-600 dark:text-slate-300">Lokasi: Ruang Tata Usaha (TU) Gedung Utama</p>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#10316B] hover:bg-[#0c2654] text-white font-bold text-xs shadow-md transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: INFO AKUN / SIGN IN WITH OTHER ================= */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Panduan Masuk Akun SMART
                </h3>
                <p className="text-xs text-slate-400">Format akun bawaan sistem</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/60 dark:border-slate-600/50">
                <p className="font-bold text-blue-700 dark:text-blue-300">1. Akun Administrator / Staf TU</p>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5">Username: <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-mono">admin</code> | Sandi: <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-mono">123@Admin</code></p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/60 dark:border-slate-600/50">
                <p className="font-bold text-emerald-700 dark:text-emerald-300">2. Akun Dewan Guru Mapel</p>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5">Username: nama panggilan guru (contoh: <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-mono">huryati</code>) | Sandi: <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-mono">123@Guru</code></p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/60 dark:border-slate-600/50">
                <p className="font-bold text-amber-700 dark:text-amber-300">3. Akun Siswa</p>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5">Username: NIS/NISN atau nama siswa | Sandi: <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-mono">123@Siswa</code></p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#10316B] hover:bg-[#0c2654] text-white font-bold text-xs shadow-md transition-all"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* ================= POPUP MODAL: KESALAHAN LOGIN ================= */}
      {errorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 max-w-sm w-full space-y-5 shadow-2xl border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200 text-center">
            
            {/* Animated / Expressive Icon */}
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
              errorPopup.type === 'locked' 
                ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' 
                : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
            }`}>
              {errorPopup.type === 'locked' ? (
                <HelpCircle className="w-8 h-8 animate-bounce" />
              ) : (
                <AlertCircle className="w-8 h-8" />
              )}
            </div>

            {/* Popup Message */}
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
                {errorPopup.message}
              </h3>
              {errorPopup.type === 'locked' ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Sudah 6 kali percobaan login tidak berhasil. Silakan hubungi Administrator IT Sekolah di Tata Usaha.
                </p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Percobaan ke-{errorPopup.attempts} dari 6 kali batas percobaan
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {errorPopup.type === 'locked' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorPopup(null);
                      setShowForgotModal(true);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <School className="w-4 h-4" />
                    <span>Hubungi Admin / Tata Usaha</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setErrorPopup(null)}
                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-semibold text-xs transition-all"
                  >
                    Tutup
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setErrorPopup(null)}
                  className="w-full py-3 rounded-xl bg-[#10316B] hover:bg-[#0c2654] text-white font-bold text-xs shadow-md shadow-blue-950/20 transition-all active:scale-[0.98]"
                >
                  Coba Lagi Yukk
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
