import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, Database, Download, 
  Upload, CheckCircle2, AlertCircle, Server, 
  HardDrive, Trash2, RefreshCw, Archive, RotateCcw,
  ShieldAlert, FileJson, Check, Activity
} from 'lucide-react';
import { testHostingerConnection, HostingerDbStatus } from '../../lib/hostingerApi';

export const SettingsModule: React.FC = () => {
  const { 
    schoolSettings, updateSchoolSettings, showToast,
    clearAllDummyData, getBackupData, restoreDatabase,
    isDbConnected, isSyncing, syncAllDataToHostinger
  } = useApp();

  // Hostinger MySQL State
  const [hostingerStatus, setHostingerStatus] = useState<HostingerDbStatus | null>(null);
  const [isTestingHostinger, setIsTestingHostinger] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // App settings form
  const [enablePayments, setEnablePayments] = useState(schoolSettings.enable_payments ?? true);

  // Restore State
  const fileInputRestoreRef = useRef<HTMLInputElement>(null);
  const [restorePreview, setRestorePreview] = useState<any | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Cek koneksi awal otomatis
  useEffect(() => {
    handleTestHostinger(false);
  }, []);

  const handleTestHostinger = async (showNotification = true) => {
    setIsTestingHostinger(true);
    const res = await testHostingerConnection();
    setHostingerStatus(res);
    setIsTestingHostinger(false);
    if (showNotification) {
      if (res.isConfigured) {
        showToast('MySQL Hostinger Terhubung', res.message, 'success');
      } else {
        showToast('Status MySQL Hostinger', res.message, 'info');
      }
    }
  };

  const handleManualSync = async () => {
    setIsSyncingAll(true);
    const res = await syncAllDataToHostinger();
    setIsSyncingAll(false);
    if (res.success) {
      handleTestHostinger(false);
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
          <Settings className="w-6 h-6 text-emerald-600" />
          Pengaturan Sistem & Database MySQL Hostinger
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Aplikasi beroperasi secara <b>full online</b> dengan database tunggal MySQL bawaan hosting (Database: <code className="font-semibold text-emerald-600">u190882518_sekolah</code>).
        </p>
      </div>

      {/* HOSTINGER NATIVE MYSQL DATABASE CARD (SINGLE DATABASE) */}
      <div className="clay-card p-6 sm:p-7 space-y-6 border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-teal-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-100 dark:border-emerald-900/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Database Tunggal: MySQL Bawaan Hostinger
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  FULL ONLINE • TERSINKRONISASI
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Semua data guru, siswa, mapel, kelas, nilai, dan absensi tersimpan langsung di server MySQL Hostinger.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncingAll || isSyncing}
              className="clay-btn-primary text-xs py-2 px-4 bg-blue-600 hover:bg-blue-500 shadow-blue-500/30 flex items-center gap-1.5"
              title="Kirim dan sinkronkan seluruh data aplikasi ke MySQL Hostinger sekarang"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Menyinkronkan...' : 'Sinkronkan Semua Data'}</span>
            </button>
            <button
              onClick={() => handleTestHostinger(true)}
              disabled={isTestingHostinger}
              className="clay-btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30 flex items-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5" />
              <span>{isTestingHostinger ? 'Menguji...' : 'Uji Koneksi MySQL'}</span>
            </button>
            <a
              href="/hostinger_database.sql"
              download="hostinger_database.sql"
              className="clay-btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
              title="Unduh file SQL untuk phpMyAdmin Hostinger"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unduh .SQL Hostinger</span>
            </a>
          </div>
        </div>

        {/* Status Koneksi */}
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
                Terdeteksi <b>{hostingerStatus.totalTables} tabel</b> terpasang aktif di phpMyAdmin Hostinger Anda.
              </p>
            ) : null}
          </div>
        )}

        {/* Ringkasan Konfigurasi MySQL */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
            <span className="text-slate-400 block text-[10px] font-semibold">Database Host</span>
            <span className="font-mono font-bold text-slate-800 dark:text-white">localhost (Hostinger)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
            <span className="text-slate-400 block text-[10px] font-semibold">Nama Database</span>
            <span className="font-mono font-bold text-emerald-600">u190882518_sekolah</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
            <span className="text-slate-400 block text-[10px] font-semibold">Username Database</span>
            <span className="font-mono font-bold text-slate-800 dark:text-white">u190882518_admin</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
            <span className="text-slate-400 block text-[10px] font-semibold">Status Sinkronisasi</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Aktif & Terhubung
            </span>
          </div>
        </div>

        {/* 4 Langkah Panduan Deploy Hostinger */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">1</span>
            <h5 className="font-bold text-xs text-slate-800 dark:text-white">Database MySQL</h5>
            <p className="text-[11px] text-slate-500">
              Database di Hostinger hPanel sudah terpasang: <b>u190882518_sekolah</b>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">2</span>
            <h5 className="font-bold text-xs text-slate-800 dark:text-white">Import phpMyAdmin</h5>
            <p className="text-[11px] text-slate-500">
              Jika tabel belum ada, buka phpMyAdmin lalu Import <code className="text-emerald-600 font-bold">hostinger_database.sql</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">3</span>
            <h5 className="font-bold text-xs text-slate-800 dark:text-white">Koneksi Otomatis</h5>
            <p className="text-[11px] text-slate-500">
              File <code className="text-emerald-600 font-bold">api/config.php</code> sudah terisi kredensial database Anda.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">4</span>
            <h5 className="font-bold text-xs text-slate-800 dark:text-white">Sinkronisasi Realtime</h5>
            <p className="text-[11px] text-slate-500">
              Setiap input guru, siswa, mapel, nilai, dll. otomatis tersimpan langsung ke MySQL Hostinger.
            </p>
          </div>
        </div>
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
