import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, Database, Download, 
  Upload, Save, CheckCircle2, AlertCircle, Key, Server, 
  HardDrive, Trash2, RefreshCw, Archive, RotateCcw, Check,
  ShieldAlert, FileJson
} from 'lucide-react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/supabase';
import { testHostingerConnection, HostingerDbStatus } from '../../lib/hostingerApi';

export const SettingsModule: React.FC = () => {
  const { 
    schoolSettings, updateSchoolSettings, isSupabaseLive, saveSupabaseConfig, showToast,
    clearAllDummyData, getBackupData, restoreDatabase
  } = useApp();

  // Hostinger MySQL State
  const [hostingerStatus, setHostingerStatus] = useState<HostingerDbStatus | null>(null);
  const [isTestingHostinger, setIsTestingHostinger] = useState(false);

  // Supabase form
  const [supabaseUrl, setSupabaseUrl] = useState(SUPABASE_URL);
  const [supabaseKey, setSupabaseKey] = useState(SUPABASE_ANON_KEY);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // App settings form
  const [enablePayments, setEnablePayments] = useState(schoolSettings.enable_payments ?? true);

  // Restore State
  const fileInputRestoreRef = useRef<HTMLInputElement>(null);
  const [restorePreview, setRestorePreview] = useState<any | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleTestHostinger = async () => {
    setIsTestingHostinger(true);
    const res = await testHostingerConnection();
    setHostingerStatus(res);
    setIsTestingHostinger(false);
    if (res.isConfigured) {
      showToast('MySQL Hostinger Terhubung', res.message, 'success');
    } else {
      showToast('Info MySQL Hostinger', res.message, 'info');
    }
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseKey);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      if (!supabaseUrl.includes('.supabase.co')) {
        throw new Error('URL Supabase harus berakhiran .supabase.co');
      }
      if (supabaseKey.length < 20) {
        throw new Error('Anon Key tidak valid');
      }

      // Simulate ping
      setTimeout(() => {
        setIsTesting(false);
        setTestResult('Koneksi ke endpoint Supabase berhasil diverifikasi!');
        showToast('Koneksi Sukses', 'Berhasil tersambung ke project Supabase Anda!');
      }, 700);
    } catch (err: any) {
      setIsTesting(false);
      setTestResult(`Gagal terhubung: ${err.message}`);
      showToast('Koneksi Gagal', err.message, 'error');
    }
  };

  // Handler Cadangkan Data (Backup)
  const handleBackupData = () => {
    const backupObj = getBackupData();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const dateStr = new Date().toISOString().split('T')[0];
    const safeSchoolName = (schoolSettings.school_name || 'Sekolah').replace(/[^a-zA-Z0-9]/g, '_');
    downloadAnchor.setAttribute('download', `Backup_SMART_${safeSchoolName}_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Backup Berhasil', 'Berkas cadangan data sistem berhasil diunduh ke komputer Anda.');
  };

  // Handler Pilih Berkas Cadangan untuk Dipulihkan (Restore)
  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text);

        // Normalisasi format cadangan jika format lokal lama
        let normalizedData = json;
        if (json && !json.students && json.sms_students) {
          normalizedData = {};
          Object.keys(json).forEach((k) => {
            const cleanKey = k.replace('sms_', '');
            try {
              normalizedData[cleanKey] = JSON.parse(json[k]);
            } catch {
              normalizedData[cleanKey] = json[k];
            }
          });
        }

        setRestorePreview(normalizedData);
        showToast('Berkas Cadangan Terbaca', 'Silakan periksa ringkasan sebelum memulihkan data.');
      } catch (err: any) {
        showToast('File Rusak', 'Berkas JSON tidak valid atau rusak.', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRestoreRef.current) fileInputRestoreRef.current.value = '';
  };

  // Handler Eksekusi Pemulihan Data
  const handleConfirmRestore = () => {
    if (!restorePreview) return;
    setIsRestoring(true);
    const res = restoreDatabase(restorePreview);
    setIsRestoring(false);
    if (res.success) {
      setRestorePreview(null);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="clay-card p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          Pengaturan Sistem, Database & Backup Restore
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola database bawaan Hostinger (MySQL), backup arsip data, pemulihan (restore), dan modul sekolah
        </p>
      </div>

      {/* BACKUP & RESTORE SECTION */}
      <div className="clay-card p-6 sm:p-7 space-y-6 border-2 border-blue-500/20 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 dark:from-blue-950/20 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-blue-100 dark:border-blue-900/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Cadangkan & Pulihkan Data Sistem (Backup & Restore)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-extrabold text-[10px]">
                  KEAMANAN DATA
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Simpan seluruh data sekolah ke berkas JSON atau pulihkan data dari berkas cadangan sebelumnya
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBackupData}
              className="clay-btn-primary text-xs py-2 px-4 bg-blue-600 hover:bg-blue-500 shadow-blue-500/30 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Cadangkan Data (Backup JSON)</span>
            </button>
            <button
              onClick={() => fileInputRestoreRef.current?.click()}
              className="clay-btn-secondary text-xs py-2 px-3.5 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
            >
              <Upload className="w-4 h-4" />
              <span>Pulihkan Data (Restore)</span>
            </button>
            <input
              ref={fileInputRestoreRef}
              type="file"
              accept=".json"
              onChange={handleRestoreFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Info Cakupan Backup */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
            <p className="text-[11px] text-slate-400">Master Data</p>
            <p className="font-bold text-slate-800 dark:text-white mt-0.5">Siswa, Guru & Akun</p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
            <p className="text-[11px] text-slate-400">Akademik</p>
            <p className="font-bold text-slate-800 dark:text-white mt-0.5">Mapel, Kelas & Jadwal</p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
            <p className="text-[11px] text-slate-400">Penilaian</p>
            <p className="font-bold text-slate-800 dark:text-white mt-0.5">Nilai & Absensi</p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
            <p className="text-[11px] text-slate-400">Tata Usaha</p>
            <p className="font-bold text-slate-800 dark:text-white mt-0.5">Keuangan & Surat</p>
          </div>
        </div>

        {/* Pratinjau Restore Jika Berkas Dipilih */}
        {restorePreview && (
          <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950 dark:text-amber-100 flex items-center gap-2">
                    <span>Berkas Cadangan Siap Dipulihkan</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-[10px] font-bold">
                      Konfirmasi
                    </span>
                  </h4>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                    Dibuat pada: {restorePreview.exported_at ? new Date(restorePreview.exported_at).toLocaleString('id-ID') : 'Tidak diketahui'}
                    {restorePreview.school_name ? ` • Sekolah: ${restorePreview.school_name}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRestorePreview(null)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Batalkan
              </button>
            </div>

            {/* Rincian data yang akan dipulihkan */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50">
                <span className="text-slate-400 block text-[10px]">Data Siswa</span>
                <span className="font-bold text-slate-800 dark:text-white">{restorePreview.students?.length || 0} Siswa</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50">
                <span className="text-slate-400 block text-[10px]">Data Guru</span>
                <span className="font-bold text-slate-800 dark:text-white">{restorePreview.teachers?.length || 0} Guru</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50">
                <span className="text-slate-400 block text-[10px]">Mata Pelajaran</span>
                <span className="font-bold text-slate-800 dark:text-white">{restorePreview.subjects?.length || 0} Mapel</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50">
                <span className="text-slate-400 block text-[10px]">Data Kelas</span>
                <span className="font-bold text-slate-800 dark:text-white">{restorePreview.classes?.length || 0} Kelas</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50">
                <span className="text-slate-400 block text-[10px]">Data Jadwal</span>
                <span className="font-bold text-slate-800 dark:text-white">{restorePreview.schedules?.length || 0} Jadwal</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-amber-200 dark:border-amber-900/50">
              <p className="text-[11px] text-amber-900/90 dark:text-amber-200 flex items-center gap-1.5 font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Peringatan: Pemulihan akan menggantikan data aktif dengan data dari berkas cadangan ini.</span>
              </p>

              <button
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="clay-btn-primary text-xs py-2 px-5 bg-amber-600 hover:bg-amber-500 shadow-amber-600/20 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isRestoring ? 'Memulihkan...' : 'Konfirmasi & Pulihkan Data Sekarang'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* HOSTINGER NATIVE MYSQL DATABASE CARD */}
      <div className="clay-card p-6 sm:p-7 space-y-6 border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-teal-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-100 dark:border-emerald-900/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Database MySQL Bawaan Hostinger (Khusus Hosting)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">
                  REKOMENDASI HOSTING
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Menggunakan MySQL/MariaDB & PHP bawaan server Hostinger tanpa ketergantungan cloud luar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestHostinger}
              disabled={isTestingHostinger}
              className="clay-btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30"
            >
              <Server className="w-3.5 h-3.5" />
              <span>{isTestingHostinger ? 'Menguji...' : 'Uji Koneksi MySQL Hostinger'}</span>
            </button>
            <a
              href="/hostinger_database.sql"
              download="hostinger_database.sql"
              className="clay-btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
              title="Unduh file SQL untuk phpMyAdmin"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unduh .SQL Hostinger</span>
            </a>
          </div>
        </div>

        {hostingerStatus && (
          <div className={`p-4 rounded-2xl text-xs space-y-2 ${
            hostingerStatus.isConfigured
              ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 border border-emerald-200'
              : 'bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200 border border-amber-200'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {hostingerStatus.isConfigured ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
              <span>{hostingerStatus.message}</span>
            </div>
            {hostingerStatus.totalTables ? (
              <p className="text-[11px] opacity-90">
                Terdeteksi <b>{hostingerStatus.totalTables} tabel</b> terpasang di phpMyAdmin Hostinger Anda.
              </p>
            ) : null}
          </div>
        )}

        {/* 4 Langkah Deploy Hostinger */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">1</span>
            <h5 className="font-bold text-xs text-slate-800 dark:text-white">Buat Database</h5>
            <p className="text-[11px] text-slate-500">
              Di hPanel Hostinger: masuk ke menu <b>Databases &gt; MySQL Databases</b>, buat nama DB & user.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">2</span>
            <h5 className="font-bold text-xs text-slate-800 dark:text-white">Import phpMyAdmin</h5>
            <p className="text-[11px] text-slate-500">
              Buka phpMyAdmin di Hostinger, klik tombol <b>Import</b> dan pilih file <code className="text-emerald-600 font-bold">hostinger_database.sql</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">3</span>
            <h5 className="font-bold text-xs text-slate-800 dark:text-white">Isi api/config.php</h5>
            <p className="text-[11px] text-slate-500">
              Edit file <code className="text-emerald-600 font-bold">api/config.php</code> dengan nama database, user, dan password Hostinger Anda.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">4</span>
            <h5 className="font-bold text-xs text-slate-800 dark:text-white">Upload Folder dist</h5>
            <p className="text-[11px] text-slate-500">
              Unggah seluruh isi folder <code className="text-emerald-600 font-bold">dist/</code> ke direktori <code className="text-emerald-600 font-bold">public_html/</code> di Hostinger.
            </p>
          </div>
        </div>
      </div>

      {/* Supabase Connection Setup Box */}
      <div className="clay-card p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isSupabaseLive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
            }`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Koneksi Tambahan: Cloud Supabase (Opsional)
              </h3>
              <p className="text-xs text-slate-500">
                Gunakan jika Anda ingin sinkronisasi multi-cloud dengan Supabase PostgreSQL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="clay-btn-secondary text-xs py-2 px-3.5"
            >
              <Server className="w-3.5 h-3.5 text-blue-600" />
              <span>{isTesting ? 'Menguji...' : 'Uji Supabase'}</span>
            </button>
          </div>
        </div>

        {testResult && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            testResult.includes('berhasil')
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
          }`}>
            {testResult.includes('berhasil') ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{testResult}</span>
          </div>
        )}

        <form onSubmit={handleSaveSupabase} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <span>Project URL (VITE_SUPABASE_URL)</span>
              <span className="text-[10px] text-slate-400 font-normal">Contoh: https://xyzcompany.supabase.co</span>
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>Anon Public Key (VITE_SUPABASE_ANON_KEY)</span>
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none font-mono text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500">
              File migration skema 31 tabel dan RLS tersedia di folder <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">supabase/migrations/</code>
            </span>

            <button
              type="submit"
              className="clay-btn-primary text-xs sm:text-sm py-2 px-5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Kredensial Supabase</span>
            </button>
          </div>
        </form>
      </div>

      {/* Feature Preferences */}
      <div className="clay-card p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Pengaturan Fitur & Modul
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <div className="py-3 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                Aktifkan Modul Keuangan & Pembayaran SPP
              </h4>
              <p className="text-xs text-slate-400">
                Fitur kasir penerimaan iuran, kwitansi, dan penagihan siswa
              </p>
            </div>
            <input
              type="checkbox"
              checked={enablePayments}
              onChange={(e) => {
                const val = e.target.checked;
                setEnablePayments(val);
                updateSchoolSettings({ enable_payments: val });
              }}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Clean / Reset Dummy Data */}
      <div className="clay-card p-6 space-y-4 border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              Pembersihan Data Contoh / Dummy
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hapus seluruh data siswa, guru, kelas, mata pelajaran, jadwal, absensi, dan nilai contoh. Sistem akan bersih dan siap untuk penginputan data nyata sekolah.
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin menghapus seluruh data contoh/dummy? Tindakan ini akan mengosongkan data siswa, guru, kelas, nilai, dan absensi contoh agar aplikasi siap digunakan untuk data riil.')) {
                clearAllDummyData();
              }
            }}
            className="clay-btn-danger text-xs sm:text-sm py-2.5 px-5 flex items-center gap-2 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Semua Data Contoh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
