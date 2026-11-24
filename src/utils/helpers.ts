import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Format Date as DD-MM-YYYY
export function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return '-';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '-';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Format DateTime
export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  
  const formattedDate = formatDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${formattedDate} ${hours}:${minutes} WIB`;
}

// Format Currency IDR
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Generate username dari nama lengkap (nama tanpa spasi, huruf kecil semua)
export function generateUsername(fullName: string): string {
  if (!fullName) return '';
  // Ambil nama sebelum gelar (contoh "Budi Santoso, M.Pd." -> "Budi Santoso")
  const baseName = fullName.split(',')[0].trim();
  // Hilangkan spasi dan tanda baca, jadikan huruf kecil semua
  return baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Default password berdasarkan peran pengguna
export function getDefaultPassword(role: 'admin' | 'guru' | 'siswa'): string {
  if (role === 'guru') return '123@Guru';
  if (role === 'siswa') return '123@Siswa';
  return '123@Admin';
}

// Export data to Excel (.xlsx)
export function exportToExcel(data: any[], fileName: string, sheetName: string = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}_${formatDate(new Date())}.xlsx`);
}

// Export data to PDF report
export function exportToPdf(
  title: string, 
  headers: string[], 
  rows: (string | number)[][], 
  fileName: string,
  schoolName: string = 'SMA Medanggili Ciruas'
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header banner
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(schoolName.toUpperCase(), 14, 15);

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`LAPORAN: ${title.toUpperCase()}`, 14, 22);
  doc.setFontSize(9);
  doc.text(`Dicetak pada: ${formatDateTime(new Date().toISOString())}`, 14, 28);
  
  // Separator line
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 31, 196, 31);

  // Table
  autoTable(doc, {
    startY: 35,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138], // Navy Blue #1E3A8A
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  doc.save(`${fileName}_${formatDate(new Date())}.pdf`);
}

// Parse Excel file to JSON
export async function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}
