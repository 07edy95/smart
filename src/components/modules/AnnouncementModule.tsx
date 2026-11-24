import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Announcement, AcademicEvent } from '../../types/database';
import { formatDate } from '../../utils/helpers';
import { Megaphone, Calendar, Plus, Trash2, Bell, Tag, Sparkles } from 'lucide-react';

export const AnnouncementModule: React.FC = () => {
  const { 
    announcements, addAnnouncement, deleteAnnouncement, 
    events, addEvent, deleteEvent, role, currentUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'announcements' | 'events'>('announcements');
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [targetRole, setTargetRole] = useState<'all' | 'guru' | 'siswa'>('all');

  // Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventType, setEventType] = useState<'akademik' | 'libur' | 'ujian' | 'kegiatan' | 'upacara'>('akademik');

  const isAdmin = role === 'admin';
  const isGuru = role === 'guru';
  const isSiswa = role === 'siswa';

  // Filter announcements for current user's role
  const visibleAnnouncements = announcements.filter((a) => {
    if (a.target_role === 'all') return true;
    if (role === 'admin') return true;
    return a.target_role === role;
  });

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    addAnnouncement({
      title: annTitle,
      content: annContent,
      target_role: targetRole,
      published_date: new Date().toISOString().split('T')[0],
      is_active: true,
    });
    setIsAnnModalOpen(false);
    setAnnTitle('');
    setAnnContent('');
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent({
      title: eventTitle,
      description: eventDesc,
      event_date: eventDate,
      end_date: eventEndDate || undefined,
      event_type: eventType,
    });
    setIsEventModalOpen(false);
    setEventTitle('');
    setEventDesc('');
  };

  const annColumns: Column<Announcement>[] = [
    {
      header: 'Judul Pengumuman',
      cell: (a) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{a.title}</h4>
            <p className="text-[11px] text-slate-500 line-clamp-1">{a.content}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Target Penerima',
      cell: (a) => {
        let badge = 'bg-blue-100 text-blue-700';
        if (a.target_role === 'guru') badge = 'bg-emerald-100 text-emerald-700';
        if (a.target_role === 'siswa') badge = 'bg-purple-100 text-purple-700';

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${badge}`}>
            {a.target_role === 'all' ? 'Semua Warga' : a.target_role}
          </span>
        );
      },
    },
    {
      header: 'Tanggal Terbit',
      cell: (a) => <span className="text-xs text-slate-600 dark:text-slate-300">{formatDate(a.published_date)}</span>,
    },
    {
      header: 'Penulis',
      cell: (a) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{a.author_name}</span>,
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (a) => (
        <div>
          {!isSiswa && (
            <button
              onClick={() => {
                if (window.confirm(`Hapus pengumuman "${a.title}"?`)) {
                  deleteAnnouncement(a.id);
                }
              }}
              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controller */}
      <div className="clay-card p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-500" />
            Pusat Informasi & Kalender Akademik
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Siaran pengumuman resmi sekolah dan agenda kegiatan tahun ajaran
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'announcements' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Pengumuman
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'events' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Agenda Kegiatan
            </button>
          </div>

          {!isSiswa && (
            <button
              onClick={() => {
                if (activeTab === 'announcements') setIsAnnModalOpen(true);
                else setIsEventModalOpen(true);
              }}
              className="clay-btn-primary text-xs sm:text-sm py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'announcements' ? 'Buat Pengumuman' : 'Tambah Agenda'}</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'announcements' ? (
        <DataTable
          title="Papan Pengumuman Sekolah"
          subtitle="Informasi edaran resmi untuk siswa, guru, dan staf"
          data={visibleAnnouncements}
          columns={annColumns}
          searchPlaceholder="Cari pengumuman..."
          searchKeys={['title', 'content', 'author_name']}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((ev) => (
              <div key={ev.id} className="clay-card p-5 space-y-3 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {ev.event_type}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {formatDate(ev.event_date)}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{ev.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">
                    {ev.description || 'Agenda kegiatan resmi satuan pendidikan.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>{ev.end_date ? `s/d ${formatDate(ev.end_date)}` : '1 Hari Kegiatan'}</span>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus agenda "${ev.title}"?`)) deleteEvent(ev.id);
                      }}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Announcement Modal */}
      <Modal
        isOpen={isAnnModalOpen}
        onClose={() => setIsAnnModalOpen(false)}
        title="Buat Pengumuman Baru"
        subtitle="Siarkan pengumuman ke seluruh civitas sekolah"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Judul Pengumuman *
            </label>
            <input
              type="text"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="Pelaksanaan Asesmen Nasional Berbasis Komputer (ANBK)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sasaran Penerima *
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            >
              <option value="all">Semua Warga Sekolah (Umum)</option>
              <option value="guru">Khusus Dewan Guru & Staf</option>
              <option value="siswa">Khusus Peserta Didik (Siswa)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Isi Pesan Pengumuman *
            </label>
            <textarea
              rows={4}
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="Tuliskan isi pengumuman secara rinci..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAnnModalOpen(false)}
              className="clay-btn-secondary text-xs py-2 px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              className="clay-btn-primary text-xs py-2 px-5"
            >
              Publikasikan
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Tambah Agenda Kalender Akademik"
        subtitle="Jadwal kegiatan operasional sekolah"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Kegiatan / Agenda *
            </label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Pentas Seni & Gelar Karya P5"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Jenis Kegiatan *
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            >
              <option value="akademik">Kegiatan Akademik</option>
              <option value="ujian">Ujian & Asesmen</option>
              <option value="libur">Hari Libur Sekolah / Nasional</option>
              <option value="upacara">Upacara Bendera</option>
              <option value="kegiatan">Kegiatan Ekstrakurikuler / Pentas</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Mulai *
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Selesai (Opsional)
              </label>
              <input
                type="date"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
              placeholder="Rincian agenda kegiatan..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="clay-btn-secondary text-xs py-2 px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              className="clay-btn-primary text-xs py-2 px-5"
            >
              Simpan Agenda
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
