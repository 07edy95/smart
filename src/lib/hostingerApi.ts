/**
 * =========================================================================
 * CLIENT ADAPTER DATABASE MYSQL BAWAAN HOSTINGER
 * SISTEM MANAJEMEN SEKOLAH - SMA MEDANGGILI CIRUAS (NPSN: 20605358)
 * =========================================================================
 * 
 * Modul ini menghubungkan antarmuka React secara langsung dengan backend PHP REST API 
 * yang berjalan di hosting Hostinger (/api/data.php, /api/auth.php, /api/upload.php).
 * Database Tunggal: MySQL Hostinger (u190882518_sekolah).
 */

export interface HostingerDbStatus {
  isConfigured: boolean;
  message: string;
  totalTables?: number;
  tables?: string[];
  dataSummary?: Record<string, any>;
}

/**
 * Memeriksa apakah database MySQL Hostinger aktif dan dapat diakses
 */
export async function testHostingerConnection(): Promise<HostingerDbStatus> {
  try {
    const res = await fetch('/api/test.php', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        isConfigured: false,
        message: err.message || `Server merespon dengan status ${res.status}. Pastikan database MySQL aktif.`
      };
    }

    const data = await res.json();
    if (data.status === 'success') {
      return {
        isConfigured: true,
        message: data.message,
        totalTables: data.environment?.total_tables || 0,
        tables: data.environment?.tables || [],
        dataSummary: data.data_summary || {}
      };
    }

    return {
      isConfigured: false,
      message: data.message || 'Koneksi database belum berhasil.'
    };
  } catch (e: any) {
    return {
      isConfigured: false,
      message: 'Tidak dapat menjangkau endpoint /api/test.php.'
    };
  }
}

/**
 * Mengambil data tabel dari MySQL Hostinger
 */
export async function fetchFromHostinger(table: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/data.php?table=${encodeURIComponent(table)}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.warn(`[Hostinger MySQL] Gagal mengambil data tabel ${table}:`, e);
    return [];
  }
}

/**
 * Menyimpan data baru ke MySQL Hostinger
 */
export async function insertToHostinger(table: string, data: Record<string, any>): Promise<any> {
  try {
    const res = await fetch(`/api/data.php?table=${encodeURIComponent(table)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    console.warn(`[Hostinger MySQL] Gagal menambah data ke tabel ${table}:`, e);
    return null;
  }
}

/**
 * Menyimpan data masal (bulk) ke MySQL Hostinger
 */
export async function insertBulkToHostinger(table: string, dataArray: Record<string, any>[]): Promise<any> {
  try {
    if (!dataArray || dataArray.length === 0) return { status: 'success', count: 0 };
    const res = await fetch(`/api/data.php?table=${encodeURIComponent(table)}&action=bulk_insert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataArray)
    });
    return await res.json();
  } catch (e) {
    console.warn(`[Hostinger MySQL] Gagal bulk insert data ke tabel ${table}:`, e);
    return null;
  }
}

/**
 * Mengupdate data di MySQL Hostinger
 */
export async function updateInHostinger(table: string, id: string, data: Record<string, any>): Promise<any> {
  try {
    const res = await fetch(`/api/data.php?table=${encodeURIComponent(table)}&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    console.warn(`[Hostinger MySQL] Gagal mengupdate data di tabel ${table}:`, e);
    return null;
  }
}

/**
 * Menghapus data dari MySQL Hostinger
 */
export async function deleteFromHostinger(table: string, id: string): Promise<any> {
  try {
    const res = await fetch(`/api/data.php?table=${encodeURIComponent(table)}&id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (e) {
    console.warn(`[Hostinger MySQL] Gagal menghapus data dari tabel ${table}:`, e);
    return null;
  }
}

/**
 * Mengunggah berkas ke server hosting Hostinger (/uploads/)
 */
export async function uploadFile(
  bucketOrPath: string, 
  file: File, 
  _customPath?: string
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', bucketOrPath);

    const res = await fetch('/api/upload.php', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Upload gagal dengan status ${res.status}`);
    }

    const data = await res.json();
    if (data.status === 'success' && data.url) {
      return { url: data.url, error: null };
    }

    throw new Error(data.message || 'Gagal mengunggah berkas.');
  } catch (err: any) {
    console.error('[Hostinger Upload] Kesalahan pengunggahan file:', err);
    // Fallback data URL hanya jika endpoint server tidak dapat dijangkau
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ url: reader.result as string, error: null });
      };
      reader.onerror = () => {
        resolve({ url: null, error: err });
      };
      reader.readAsDataURL(file);
    });
  }
}

export const uploadToHostinger = uploadFile;
