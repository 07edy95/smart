import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Menu, Sun, Moon, Bell, Database, CheckCircle2, 
  User, Shield, LogOut, ChevronDown, Sparkles, RefreshCw 
} from 'lucide-react';
import { UserRole } from '../../types/database';
import { formatDateTime } from '../../utils/helpers';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileSidebar,
  onOpenSettings,
  onOpenProfile,
}) => {
  const { 
    currentUser, role, logout, theme, 
    toggleTheme, schoolSettings, 
    academicYears, semesters, notifications, markNotificationRead,
    isSyncing, refreshDataFromHostinger
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const activeAcademicYear = academicYears.find(a => a.is_active);
  const activeSemester = semesters.find(s => s.is_active);
  const unreadNotifs = notifications.filter(n => !n.is_read);

  return (
    <header className="h-20 bg-white/80 dark:bg-[#1C2541]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & School Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="font-extrabold text-sm sm:text-lg text-slate-800 dark:text-white tracking-tight truncate max-w-[200px] sm:max-w-md">
            {schoolSettings.school_name}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="hidden sm:inline">TA {activeAcademicYear?.name || '2025/2026'}</span>
            <span className="hidden sm:inline">•</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 font-semibold text-[10px]">
              Semester {activeSemester?.name || 'Ganjil'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Locked Role Badge, Database Status, Theme Toggle, Notification & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Locked Active Role Badge (Peran Terkunci Sesuai Akun Login) */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shadow-sm select-none">
          <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{role === 'admin' ? 'Administrator' : role === 'guru' ? 'Guru Pengajar' : 'Siswa'}</span>
        </div>

        {/* MySQL Database Hostinger Status & Refresh Pill (Full Online) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenSettings}
            title="Status: Terhubung langsung ke Database MySQL Hostinger (Klik untuk Pengaturan)"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800 shadow-sm"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>MySQL Hostinger</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            onClick={() => refreshDataFromHostinger()}
            disabled={isSyncing}
            title="Segarkan data terbaru dari database server MySQL Hostinger"
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-1 text-xs font-semibold shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">{isSyncing ? 'Menyinkronkan...' : 'Segarkan Data'}</span>
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 clay-card p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">Notifikasi</h4>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  {unreadNotifs.length} Belum Dibaca
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto mt-2">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 rounded-xl transition-colors cursor-pointer ${
                        n.is_read ? 'opacity-60 hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{n.title}</p>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {formatDateTime(n.created_at).split(' ')[1]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-slate-400">Tidak ada notifikasi saat ini.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60 transition-all"
          >
            <img
              src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt="User"
              className="w-7 h-7 rounded-full object-cover border border-white dark:border-slate-700"
            />
            <span className="hidden md:inline text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
              {currentUser?.full_name?.split(' ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 clay-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.full_name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenProfile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <User className="w-4 h-4 text-blue-500" />
                <span>Profil & Password</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Database MySQL Hostinger</span>
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
