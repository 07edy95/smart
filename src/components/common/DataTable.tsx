import React, { useState, useMemo } from 'react';
import { 
  Search, Download, FileSpreadsheet, FileText, ChevronLeft, 
  ChevronRight, Plus, Filter, Trash2, CheckSquare, Square 
} from 'lucide-react';
import { exportToExcel, exportToPdf } from '../../utils/helpers';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  onAddClick?: () => void;
  addButtonLabel?: string;
  onBulkDelete?: (selectedIds: string[]) => void;
  getRowId?: (row: T) => string;
  filterComponent?: React.ReactNode;
  extraActions?: React.ReactNode;
}

export function DataTable<T extends { id?: string }>({
  data,
  columns,
  title,
  subtitle,
  searchPlaceholder = 'Cari data...',
  searchKeys,
  onAddClick,
  addButtonLabel = 'Tambah Data',
  onBulkDelete,
  getRowId = (row) => (row as any).id || '',
  filterComponent,
  extraActions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((item) => {
      if (searchKeys && searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const val = item[k];
          return val ? String(val).toLowerCase().includes(term) : false;
        });
      }
      return Object.values(item).some((val) =>
        val ? String(val).toLowerCase().includes(term) : false
      );
    });
  }, [data, searchTerm, searchKeys]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Bulk selection
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedData.map(getRowId));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Export handlers
  const handleExportExcel = () => {
    exportToExcel(filteredData, title.toLowerCase().replace(/\s+/g, '_'));
  };

  const handleExportPdf = () => {
    const headers = columns.map((c) => c.header);
    const rows = filteredData.map((item) =>
      columns.map((c) => {
        if (c.accessorKey) return String(item[c.accessorKey] || '-');
        return '-';
      })
    );
    exportToPdf(title, headers, rows, title.toLowerCase().replace(/\s+/g, '_'));
  };

  return (
    <div className="clay-card p-5 sm:p-7 space-y-5">
      {/* Table Top Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle} (Total: {data.length})
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onBulkDelete && selectedIds.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm(`Hapus ${selectedIds.length} data terpilih?`)) {
                  onBulkDelete(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="clay-btn-danger text-xs sm:text-sm py-2 px-3"
            >
              <Trash2 className="w-4 h-4" />
              Hapus ({selectedIds.length})
            </button>
          )}

          <button
            onClick={handleExportExcel}
            className="clay-btn-secondary text-xs sm:text-sm py-2 px-3.5"
            title="Unduh format Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="clay-btn-secondary text-xs sm:text-sm py-2 px-3.5"
            title="Unduh laporan PDF"
          >
            <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {extraActions}

          {onAddClick && (
            <button
              onClick={onAddClick}
              className="clay-btn-primary text-xs sm:text-sm py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>{addButtonLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>

        {filterComponent && (
          <div className="flex items-center gap-2">
            {filterComponent}
          </div>
        )}
      </div>

      {/* Modern Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-xs uppercase font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {onBulkDelete && (
                <th className="p-3.5 w-10 text-center">
                  <button onClick={handleSelectAll} className="text-slate-500 hover:text-blue-600">
                    {selectedIds.length === paginatedData.length && paginatedData.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
              )}
              <th className="p-3.5 w-12 text-center">No</th>
              {columns.map((col, idx) => (
                <th key={idx} className={`p-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => {
                const id = getRowId(row);
                const isSelected = selectedIds.includes(id);

                return (
                  <tr
                    key={id || rowIdx}
                    className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors ${
                      isSelected ? 'bg-blue-50/70 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    {onBulkDelete && (
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleRow(id)}
                          className="text-slate-400 hover:text-blue-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="p-3.5 text-center text-xs text-slate-400 font-medium">
                      {(currentPage - 1) * pageSize + rowIdx + 1}
                    </td>
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`p-3.5 ${col.className || ''}`}>
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                          ? String(row[col.accessorKey] ?? '-')
                          : '-'}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (onBulkDelete ? 2 : 1)}
                  className="p-10 text-center text-slate-400 dark:text-slate-500"
                >
                  <p className="font-medium text-base mb-1">Tidak ada data ditemukan</p>
                  <p className="text-xs">Silakan periksa kata kunci pencarian atau tambahkan data baru.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>Menampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>dari {filteredData.length} data</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-semibold text-slate-800 dark:text-slate-200">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
