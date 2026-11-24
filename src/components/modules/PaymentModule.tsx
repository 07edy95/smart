import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { StudentBill, PaymentTransaction, PaymentType } from '../../types/database';
import { formatRupiah, formatDate } from '../../utils/helpers';
import { 
  CreditCard, Plus, Receipt, Printer, CheckCircle2, 
  Clock, DollarSign, Wallet, ArrowUpRight 
} from 'lucide-react';
import jsPDF from 'jspdf';

export const PaymentModule: React.FC = () => {
  const { 
    studentBills, transactions, paymentTypes, recordTransaction, 
    addPaymentType, addStudentBill, students, role, 
    currentUser, studentProfile, schoolSettings 
  } = useApp();

  const isAdmin = role === 'admin';
  const isSiswa = role === 'siswa';

  // Filter bills & transactions strictly for the logged in student
  const filteredBills = isSiswa
    ? studentBills.filter(b => (studentProfile && b.student_id === studentProfile.id) || b.student_name === currentUser?.full_name)
    : studentBills;

  const filteredTransactions = isSiswa
    ? transactions.filter(t => (studentProfile && t.student_id === studentProfile.id) || filteredBills.some(b => b.id === t.student_bill_id))
    : transactions;

  const [activeTab, setActiveTab] = useState<'bills' | 'transactions' | 'types'>('bills');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<StudentBill | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);

  // Pay form
  const [payAmount, setPayAmount] = useState<number>(350000);
  const [payMethod, setPayMethod] = useState<'Tunai' | 'Transfer Bank' | 'Qris' | 'Virtual Account'>('Tunai');
  const [payNotes, setPayNotes] = useState('');

  // New Type form
  const [typeName, setTypeName] = useState('');
  const [typeAmount, setTypeAmount] = useState<number>(350000);
  const [typePeriod, setTypePeriod] = useState<'bulanan' | 'tahunan' | 'sekali'>('bulanan');

  const handleOpenPay = (bill: StudentBill) => {
    setSelectedBill(bill);
    setPayAmount(bill.amount - bill.paid_amount);
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    const receiptNo = 'KW-' + new Date().toISOString().replace(/\D/g, '').substring(0, 14);
    recordTransaction({
      student_bill_id: selectedBill.id,
      student_id: selectedBill.student_id,
      amount: payAmount,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: payMethod,
      receipt_number: receiptNo,
      notes: payNotes,
    });

    setIsPayModalOpen(false);
  };

  const handleCreateType = (e: React.FormEvent) => {
    e.preventDefault();
    addPaymentType({
      name: typeName,
      amount: typeAmount,
      period: typePeriod,
      is_active: true,
    });
    setIsTypeModalOpen(false);
    setTypeName('');
  };

  // Print Official PDF Receipt
  const handlePrintReceipt = (trx: PaymentTransaction) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [148, 105] }); // A6 landscape receipt
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolSettings.school_name.toUpperCase(), 10, 12);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(schoolSettings.address, 10, 17);
    doc.line(10, 20, 138, 20);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('BUKTI PEMBAYARAN / KWITANSI RESMI', 45, 27);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nomor Kwitansi : ${trx.receipt_number}`, 10, 35);
    doc.text(`Tanggal Bayar  : ${formatDate(trx.payment_date)}`, 10, 40);
    doc.text(`Nama Siswa     : ${trx.student_name}`, 10, 45);
    doc.text(`Metode Bayar   : ${trx.payment_method}`, 10, 50);
    doc.text(`Keterangan     : ${trx.notes || 'Pembayaran Tagihan Sekolah'}`, 10, 55);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Jumlah Bayar   : ${formatRupiah(trx.amount)}`, 10, 65);
    doc.text('STATUS: LUNAS', 10, 72);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Penerima / Bendahara,', 100, 72);
    doc.text(trx.receiver_name || 'Tata Usaha', 100, 90);

    doc.save(`kwitansi_${trx.receipt_number}.pdf`);
  };

  const billColumns: Column<StudentBill>[] = [
    {
      header: 'Nama Siswa & NIS',
      cell: (b) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{b.student_name}</p>
          <p className="text-[11px] text-slate-400">{b.bill_month || 'Tahun Ajaran 2025/2026'}</p>
        </div>
      ),
    },
    {
      header: 'Jenis Tagihan',
      cell: (b) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {b.payment_type_name}
        </span>
      ),
    },
    {
      header: 'Nominal Tagihan',
      cell: (b) => (
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {formatRupiah(b.amount)}
        </span>
      ),
    },
    {
      header: 'Terbayar',
      cell: (b) => (
        <span className="text-xs font-bold text-emerald-600">
          {formatRupiah(b.paid_amount)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (b) => {
        let badge = 'bg-emerald-100 text-emerald-700';
        if (b.status === 'belum_lunas') badge = 'bg-rose-100 text-rose-700';
        if (b.status === 'sebagian') badge = 'bg-amber-100 text-amber-700';

        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${badge}`}>
            {b.status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (b) => (
        <div className="flex items-center justify-center gap-1.5">
          {isAdmin && b.status !== 'lunas' && (
            <button
              onClick={() => handleOpenPay(b)}
              className="clay-btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <CreditCard className="w-3 h-3" />
              <span>Bayar</span>
            </button>
          )}
          {b.status === 'lunas' && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
            </span>
          )}
        </div>
      ),
    },
  ];

  const trxColumns: Column<PaymentTransaction>[] = [
    {
      header: 'No. Kwitansi',
      cell: (t) => (
        <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">{t.receipt_number}</span>
      ),
    },
    {
      header: 'Nama Siswa',
      cell: (t) => <span className="font-semibold text-xs text-slate-900 dark:text-white">{t.student_name}</span>,
    },
    {
      header: 'Tanggal & Metode',
      cell: (t) => (
        <div className="text-xs">
          <p className="font-medium">{formatDate(t.payment_date)}</p>
          <span className="text-[10px] text-slate-400">{t.payment_method}</span>
        </div>
      ),
    },
    {
      header: 'Nominal',
      cell: (t) => <span className="font-bold text-emerald-600 text-xs">{formatRupiah(t.amount)}</span>,
    },
    {
      header: 'Penerima',
      cell: (t) => <span className="text-xs text-slate-500">{t.receiver_name}</span>,
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (t) => (
        <button
          onClick={() => handlePrintReceipt(t)}
          className="clay-btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 text-blue-600"
          title="Cetak Kwitansi Resmi PDF"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Kwitansi</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controller */}
      <div className="clay-card p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600" />
            Pembayaran Sekolah & Manajemen SPP
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekap tagihan iuran bulanan, kwitansi cetak otomatis, dan riwayat mutasi kas
          </p>
        </div>

        <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('bills')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'bills' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            Tagihan Siswa
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'transactions' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            Riwayat Pembayaran
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('types')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'types' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Jenis Iuran
            </button>
          )}
        </div>
      </div>

      {activeTab === 'bills' && (
        <DataTable
          title={isSiswa ? "Tagihan SPP & Iuran Sekolah Anda" : "Daftar Tagihan Iuran Siswa"}
          subtitle={isSiswa ? "Informasi status kewajiban administrasi iuran sekolah" : "Status pembayaran per siswa dan bulan aktif"}
          data={filteredBills}
          columns={billColumns}
          searchPlaceholder="Cari siswa, bulan tagihan..."
          searchKeys={['student_name', 'payment_type_name', 'bill_month']}
        />
      )}

      {activeTab === 'transactions' && (
        <DataTable
          title={isSiswa ? "Riwayat Kwitansi Pembayaran Anda" : "Riwayat Kwitansi & Transaksi Pembayaran"}
          subtitle={isSiswa ? "Daftar bukti pembayaran sah yang telah diverifikasi" : "Daftar mutasi penerimaan pembayaran resmi"}
          data={filteredTransactions}
          columns={trxColumns}
          searchPlaceholder="Cari nomor kwitansi, siswa..."
          searchKeys={['receipt_number', 'student_name', 'payment_method']}
        />
      )}

      {activeTab === 'types' && (
        <div className="clay-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Jenis & Pos Tagihan Sekolah</h3>
            <button
              onClick={() => setIsTypeModalOpen(true)}
              className="clay-btn-primary text-xs py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pos Tagihan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paymentTypes.map((pt) => (
              <div key={pt.id} className="clay-inset p-4 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  {pt.period}
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{pt.name}</h4>
                <p className="text-lg font-extrabold text-emerald-600">{formatRupiah(pt.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {selectedBill && (
        <Modal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          title="Pencatatan Pembayaran Siswa"
          subtitle={`Tagihan: ${selectedBill.payment_type_name} - ${selectedBill.student_name}`}
        >
          <form onSubmit={handleConfirmPayment} className="space-y-4">
            <div className="clay-inset p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Tagihan:</span>
                <span className="font-bold">{formatRupiah(selectedBill.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sudah Dibayar:</span>
                <span className="font-bold text-emerald-600">{formatRupiah(selectedBill.paid_amount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1 font-bold text-blue-600">
                <span>Sisa Tagihan:</span>
                <span>{formatRupiah(selectedBill.amount - selectedBill.paid_amount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nominal Pembayaran (Rp) *
              </label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Metode Pembayaran *
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="Tunai">Tunai di Kasir / Tata Usaha</option>
                <option value="Transfer Bank">Transfer Bank Mandiri / BCA / BNI</option>
                <option value="Qris">QRIS Standar Indonesia</option>
                <option value="Virtual Account">Virtual Account</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Transaksi
              </label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="Pembayaran lunas via transfer..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="clay-btn-secondary text-xs py-2 px-4"
              >
                Batal
              </button>
              <button
                type="submit"
                className="clay-btn-primary text-xs py-2 px-5"
              >
                Proses & Terbitkan Kwitansi
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* New Payment Type Modal */}
      <Modal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        title="Tambah Pos Tagihan Sekolah"
        subtitle="Master konfigurasi iuran"
      >
        <form onSubmit={handleCreateType} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Pos Tagihan *
            </label>
            <input
              type="text"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              placeholder="SPP Bulanan, Uang Gedung, dll"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nominal Tarif (Rp) *
              </label>
              <input
                type="number"
                value={typeAmount}
                onChange={(e) => setTypeAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Periode Penagihan *
              </label>
              <select
                value={typePeriod}
                onChange={(e) => setTypePeriod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="bulanan">Bulanan</option>
                <option value="tahunan">Tahunan</option>
                <option value="sekali">Sekali Bayar</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsTypeModalOpen(false)}
              className="clay-btn-secondary text-xs py-2 px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              className="clay-btn-primary text-xs py-2 px-5"
            >
              Simpan Pos Tagihan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
