import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { IncomingLetter, OutgoingLetter } from '../../types/database';
import { formatDate, exportToPdf } from '../../utils/helpers';
import { uploadFile } from '../../lib/supabase';
import { Mail, Send, Inbox, Plus, Trash2, Printer, Download, FileText } from 'lucide-react';

export const LetterModule: React.FC = () => {
  const { 
    incomingLetters, addIncomingLetter, deleteIncomingLetter, 
    outgoingLetters, addOutgoingLetter, deleteOutgoingLetter, role 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [isIncomingModalOpen, setIsIncomingModalOpen] = useState(false);
  const [isOutgoingModalOpen, setIsOutgoingModalOpen] = useState(false);

  // Incoming letter form
  const [incNumber, setIncNumber] = useState('');
  const [incDate, setIncDate] = useState(new Date().toISOString().split('T')[0]);
  const [incReceived, setIncReceived] = useState(new Date().toISOString().split('T')[0]);
  const [incSubject, setIncSubject] = useState('');
  const [incSender, setIncSender] = useState('');
  const [incRecipient, setIncRecipient] = useState('Kepala Sekolah');
  const [incNotes, setIncNotes] = useState('');
  const [incFile, setIncFile] = useState<File | null>(null);

  // Outgoing letter form
  const [outNumber, setOutNumber] = useState('');
  const [outDate, setOutDate] = useState(new Date().toISOString().split('T')[0]);
  const [outSubject, setOutSubject] = useState('');
  const [outRecipient, setOutRecipient] = useState('');
  const [outSigner, setOutSigner] = useState('Dr. H. Bambang Subagyo, M.Pd.');
  const [outNotes, setOutNotes] = useState('');
  const [outFile, setOutFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const isAdmin = role === 'admin';

  const handleSaveIncoming = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let fileUrl = '';
    if (incFile) {
      const res = await uploadFile('letters', incFile);
      if (res.url) fileUrl = res.url;
    }

    addIncomingLetter({
      letter_number: incNumber,
      letter_date: incDate,
      received_date: incReceived,
      subject: incSubject,
      sender: incSender,
      recipient: incRecipient,
      notes: incNotes,
      file_url: fileUrl || undefined,
    });

    setIsUploading(false);
    setIsIncomingModalOpen(false);
    setIncNumber('');
    setIncSubject('');
    setIncSender('');
  };

  const handleSaveOutgoing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let fileUrl = '';
    if (outFile) {
      const res = await uploadFile('letters', outFile);
      if (res.url) fileUrl = res.url;
    }

    addOutgoingLetter({
      letter_number: outNumber,
      letter_date: outDate,
      subject: outSubject,
      recipient: outRecipient,
      signer: outSigner,
      notes: outNotes,
      file_url: fileUrl || undefined,
    });

    setIsUploading(false);
    setIsOutgoingModalOpen(false);
    setOutNumber('');
    setOutSubject('');
    setOutRecipient('');
  };

  const incomingColumns: Column<IncomingLetter>[] = [
    {
      header: 'No. Surat & Tanggal',
      cell: (l) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{l.letter_number}</p>
          <p className="text-[11px] text-slate-400">Surat: {formatDate(l.letter_date)} • Diterima: {formatDate(l.received_date)}</p>
        </div>
      ),
    },
    {
      header: 'Perihal Surat',
      cell: (l) => (
        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-2">{l.subject}</span>
      ),
    },
    {
      header: 'Pengirim & Tujuan',
      cell: (l) => (
        <div className="text-xs">
          <p className="font-medium text-slate-700 dark:text-slate-300">Dari: {l.sender}</p>
          <p className="text-slate-400">Kepada: {l.recipient}</p>
        </div>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (l) => (
        <div className="flex items-center justify-center gap-1.5">
          {l.file_url ? (
            <a
              href={l.file_url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Unduh Scan Surat"
            >
              <Download className="w-4 h-4" />
            </a>
          ) : (
            <span className="text-xs text-slate-400">-</span>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                if (window.confirm(`Hapus arsip surat ${l.letter_number}?`)) {
                  deleteIncomingLetter(l.id);
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

  const outgoingColumns: Column<OutgoingLetter>[] = [
    {
      header: 'No. Surat & Tanggal',
      cell: (l) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{l.letter_number}</p>
          <p className="text-[11px] text-slate-400">Tanggal Terbit: {formatDate(l.letter_date)}</p>
        </div>
      ),
    },
    {
      header: 'Perihal Surat',
      cell: (l) => (
        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-2">{l.subject}</span>
      ),
    },
    {
      header: 'Tujuan & Penandatangan',
      cell: (l) => (
        <div className="text-xs">
          <p className="font-medium text-slate-700 dark:text-slate-300">Kepada: {l.recipient}</p>
          <p className="text-slate-400">Ttd: {l.signer}</p>
        </div>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (l) => (
        <div className="flex items-center justify-center gap-1.5">
          {l.file_url ? (
            <a
              href={l.file_url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Unduh Scan Surat"
            >
              <Download className="w-4 h-4" />
            </a>
          ) : (
            <span className="text-xs text-slate-400">-</span>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                if (window.confirm(`Hapus surat keluar ${l.letter_number}?`)) {
                  deleteOutgoingLetter(l.id);
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
            <Mail className="w-6 h-6 text-blue-600" />
            Administrasi Tata Usaha & Kearsipan Surat
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Buku agenda surat masuk, penerbitan surat dinas keluar, dan digitalisasi berkas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'incoming' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Surat Masuk</span>
            </button>
            <button
              onClick={() => setActiveTab('outgoing')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'outgoing' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Surat Keluar</span>
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                if (activeTab === 'incoming') setIsIncomingModalOpen(true);
                else setIsOutgoingModalOpen(true);
              }}
              className="clay-btn-primary text-xs sm:text-sm py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'incoming' ? 'Catat Surat Masuk' : 'Terbitkan Surat'}</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'incoming' ? (
        <DataTable
          title="Buku Agenda Surat Masuk"
          subtitle="Arsip digital surat kedinasan eksternal yang diterima"
          data={incomingLetters}
          columns={incomingColumns}
          searchPlaceholder="Cari nomor surat, pengirim, perihal..."
          searchKeys={['letter_number', 'subject', 'sender', 'recipient']}
        />
      ) : (
        <DataTable
          title="Buku Agenda Surat Keluar"
          subtitle="Arsip surat resmi yang diterbitkan satuan pendidikan"
          data={outgoingLetters}
          columns={outgoingColumns}
          searchPlaceholder="Cari nomor surat, perihal, tujuan..."
          searchKeys={['letter_number', 'subject', 'recipient', 'signer']}
        />
      )}

      {/* Add Incoming Modal */}
      <Modal
        isOpen={isIncomingModalOpen}
        onClose={() => setIsIncomingModalOpen(false)}
        title="Catat Surat Masuk Baru"
        subtitle="Registrasi nomor agenda dan arsip"
      >
        <form onSubmit={handleSaveIncoming} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Surat *
              </label>
              <input
                type="text"
                value={incNumber}
                onChange={(e) => setIncNumber(e.target.value)}
                placeholder="421/089/Disdik/2025"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pengirim Surat *
              </label>
              <input
                type="text"
                value={incSender}
                onChange={(e) => setIncSender(e.target.value)}
                placeholder="Dinas Pendidikan DKI"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Perihal Surat *
            </label>
            <input
              type="text"
              value={incSubject}
              onChange={(e) => setIncSubject(e.target.value)}
              placeholder="Undangan Koordinasi Asesmen Nasional"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Surat
              </label>
              <input
                type="date"
                value={incDate}
                onChange={(e) => setIncDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Diterima
              </label>
              <input
                type="date"
                value={incReceived}
                onChange={(e) => setIncReceived(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Unggah Scan Dokumen Surat (PDF / Gambar)
            </label>
            <input
              type="file"
              onChange={(e) => setIncFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsIncomingModalOpen(false)}
              className="clay-btn-secondary text-xs py-2 px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="clay-btn-primary text-xs py-2 px-5"
            >
              {isUploading ? 'Menyimpan...' : 'Simpan Surat Masuk'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Outgoing Modal */}
      <Modal
        isOpen={isOutgoingModalOpen}
        onClose={() => setIsOutgoingModalOpen(false)}
        title="Terbitkan Surat Keluar"
        subtitle="Registrasi nomor surat dinas resmi"
      >
        <form onSubmit={handleSaveOutgoing} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Surat Keluar *
              </label>
              <input
                type="text"
                value={outNumber}
                onChange={(e) => setOutNumber(e.target.value)}
                placeholder="005/SMA-NM/XI/2025"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tujuan / Kepada Yth *
              </label>
              <input
                type="text"
                value={outRecipient}
                onChange={(e) => setOutRecipient(e.target.value)}
                placeholder="Badan Narkotika Nasional"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Perihal Surat *
            </label>
            <input
              type="text"
              value={outSubject}
              onChange={(e) => setOutSubject(e.target.value)}
              placeholder="Permohonan Narasumber Sosialisasi Bahaya Narkoba"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Surat
              </label>
              <input
                type="date"
                value={outDate}
                onChange={(e) => setOutDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Penandatangan Surat
              </label>
              <input
                type="text"
                value={outSigner}
                onChange={(e) => setOutSigner(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Unggah File Arsip Surat Keluar (PDF)
            </label>
            <input
              type="file"
              onChange={(e) => setOutFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsOutgoingModalOpen(false)}
              className="clay-btn-secondary text-xs py-2 px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="clay-btn-primary text-xs py-2 px-5"
            >
              {isUploading ? 'Menyimpan...' : 'Terbitkan Surat Keluar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
