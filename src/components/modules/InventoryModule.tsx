import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { InventoryItem, InventoryLoan } from '../../types/database';
import { formatDate } from '../../utils/helpers';
import { Boxes, Plus, Handshake, CheckCircle2, RotateCcw, Trash2, Edit3 } from 'lucide-react';

export const InventoryModule: React.FC = () => {
  const { 
    inventory, addInventory, updateInventory, deleteInventory, 
    inventoryLoans, addInventoryLoan, returnInventoryLoan, role 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'items' | 'loans'>('items');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // New item form state
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<'Elektronik' | 'Mebel' | 'Alat Peraga' | 'Buku' | 'Olahraga' | 'Lainnya'>('Elektronik');
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState<'baik' | 'rusak_ringan' | 'rusak_berat'>('baik');
  const [location, setLocation] = useState('');
  const [fundingSource, setFundingSource] = useState('BOS Reguler');

  // New Loan form state
  const [loanInventoryId, setLoanInventoryId] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerRole, setBorrowerRole] = useState<'guru' | 'siswa' | 'staf'>('guru');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [loanQty, setLoanQty] = useState(1);

  const isAdmin = role === 'admin';

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      updateInventory(selectedItem.id, {
        item_code: itemCode,
        item_name: itemName,
        category,
        quantity,
        condition,
        location,
        funding_source: fundingSource,
      });
    } else {
      addInventory({
        item_code: itemCode || 'INV-' + Math.floor(100 + Math.random() * 900),
        item_name: itemName,
        category,
        quantity,
        condition,
        location,
        funding_source: fundingSource,
        purchase_date: new Date().toISOString().split('T')[0],
      });
    }
    setIsItemModalOpen(false);
  };

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    addInventoryLoan({
      inventory_id: loanInventoryId || inventory[0]?.id || '',
      borrower_name: borrowerName,
      borrower_role: borrowerRole,
      loan_date: loanDate,
      return_date: returnDate,
      quantity: loanQty,
      status: 'dipinjam',
    });
    setIsLoanModalOpen(false);
    setBorrowerName('');
  };

  const itemColumns: Column<InventoryItem>[] = [
    {
      header: 'Kode & Nama Barang',
      cell: (i) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{i.item_name}</p>
            <p className="text-[11px] text-slate-400">{i.item_code} • {i.category}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Jumlah & Lokasi',
      cell: (i) => (
        <div className="text-xs">
          <p className="font-bold text-slate-800 dark:text-white">{i.quantity} Unit</p>
          <p className="text-slate-400">{i.location}</p>
        </div>
      ),
    },
    {
      header: 'Kondisi Barang',
      cell: (i) => {
        let badge = 'bg-emerald-100 text-emerald-700';
        if (i.condition === 'rusak_ringan') badge = 'bg-amber-100 text-amber-700';
        if (i.condition === 'rusak_berat') badge = 'bg-rose-100 text-rose-700';

        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${badge}`}>
            {i.condition.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      header: 'Sumber Dana',
      accessorKey: 'funding_source',
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (i) => (
        <div className="flex items-center justify-center gap-1.5">
          {isAdmin && (
            <>
              <button
                onClick={() => {
                  setSelectedItem(i);
                  setItemCode(i.item_code);
                  setItemName(i.item_name);
                  setCategory(i.category);
                  setQuantity(i.quantity);
                  setCondition(i.condition);
                  setLocation(i.location);
                  setFundingSource(i.funding_source);
                  setIsItemModalOpen(true);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Hapus barang ${i.item_name}?`)) {
                    deleteInventory(i.id);
                  }
                }}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const loanColumns: Column<InventoryLoan>[] = [
    {
      header: 'Nama Peminjam',
      cell: (l) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{l.borrower_name}</p>
          <span className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400">{l.borrower_role}</span>
        </div>
      ),
    },
    {
      header: 'Barang yang Dipinjam',
      cell: (l) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800 dark:text-white">{l.item_name}</p>
          <span className="text-slate-400">{l.quantity} Unit</span>
        </div>
      ),
    },
    {
      header: 'Periode Pinjam',
      cell: (l) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {formatDate(l.loan_date)} s/d {formatDate(l.return_date)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (l) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
            l.status === 'dikembalikan' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {l.status}
        </span>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (l) => (
        <div>
          {isAdmin && l.status === 'dipinjam' && (
            <button
              onClick={() => returnInventoryLoan(l.id)}
              className="clay-btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 text-emerald-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan</span>
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
            <Boxes className="w-6 h-6 text-indigo-600" />
            Sarana & Prasarana / Inventaris Sekolah
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pencatatan aset sekolah, kondisi barang, lokasi penempatan, dan log peminjaman
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('items')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'items' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Daftar Barang
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'loans' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Log Peminjaman
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                if (activeTab === 'items') {
                  setSelectedItem(null);
                  setItemCode('INV-' + Math.floor(100 + Math.random() * 900));
                  setItemName('');
                  setLocation('Ruang Kelas');
                  setIsItemModalOpen(true);
                } else {
                  setIsLoanModalOpen(true);
                }
              }}
              className="clay-btn-primary text-xs sm:text-sm py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'items' ? 'Tambah Barang' : 'Catat Pinjam'}</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'items' ? (
        <DataTable
          title="Daftar Aset & Barang Inventaris"
          subtitle="Inventarisasi barang milik sekolah dan sumber pendanaan"
          data={inventory}
          columns={itemColumns}
          searchPlaceholder="Cari nama barang, kode, lokasi..."
          searchKeys={['item_name', 'item_code', 'location', 'category']}
        />
      ) : (
        <DataTable
          title="Riwayat Peminjaman Barang"
          subtitle="Catatan peminjaman alat peraga, proyektor, dan sarana"
          data={inventoryLoans}
          columns={loanColumns}
          searchPlaceholder="Cari nama peminjam, barang..."
          searchKeys={['borrower_name', 'item_name']}
        />
      )}

      {/* Add / Edit Item Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={selectedItem ? 'Edit Barang Inventaris' : 'Tambah Aset Inventaris Baru'}
        subtitle="Formulir inventarisasi sarana prasarana"
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Barang *
              </label>
              <input
                type="text"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Barang *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="Elektronik">Elektronik</option>
                <option value="Mebel">Mebel / Perabot</option>
                <option value="Alat Peraga">Alat Peraga Lab</option>
                <option value="Buku">Buku Perpustakaan</option>
                <option value="Olahraga">Olahraga</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Barang / Aset *
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Proyektor Epson / Mikroskop Olympus"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jumlah (Unit) *
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kondisi *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="baik">Baik (Layak)</option>
                <option value="rusak_ringan">Rusak Ringan</option>
                <option value="rusak_berat">Rusak Berat</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sumber Dana
              </label>
              <input
                type="text"
                value={fundingSource}
                onChange={(e) => setFundingSource(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lokasi Penempatan *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lab Komputer / Ruang Guru / Aula"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              className="clay-btn-secondary text-xs py-2 px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              className="clay-btn-primary text-xs py-2 px-5"
            >
              Simpan Barang
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Loan Modal */}
      <Modal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        title="Catat Peminjaman Inventaris"
        subtitle="Formulir sirkulasi barang sekolah"
      >
        <form onSubmit={handleCreateLoan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Barang yang Dipinjam *
            </label>
            <select
              value={loanInventoryId}
              onChange={(e) => setLoanInventoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            >
              {inventory.map((i) => (
                <option key={i.id} value={i.id}>{i.item_name} ({i.quantity} unit tersedia)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Peminjam *
              </label>
              <input
                type="text"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="Nama guru / siswa..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Peran Peminjam *
              </label>
              <select
                value={borrowerRole}
                onChange={(e) => setBorrowerRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="guru">Guru</option>
                <option value="siswa">Siswa</option>
                <option value="staf">Staf TU</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Pinjam
              </label>
              <input
                type="date"
                value={loanDate}
                onChange={(e) => setLoanDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rencana Kembali
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsLoanModalOpen(false)}
              className="clay-btn-secondary text-xs py-2 px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              className="clay-btn-primary text-xs py-2 px-5"
            >
              Catat Pinjaman
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
