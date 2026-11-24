/**
 * =========================================================================
 * CLIENT ADAPTER DATABASE MYSQL BAWAAN HOSTINGER
 * SISTEM MANAJEMEN SEKOLAH - SMA MEDANGGILI CIRUAS
 * =========================================================================
 * 
 * Modul ini menghubungkan antarmuka React dengan backend PHP REST API 
 * yang berjalan di hosting Hostinger (/api/data.php, /api/auth.php).
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
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        isConfigured: false,
        message: err.message || `Server merespon dengan status ${res.status}. Pastikan api/config.php sudah diisi.`
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
      message: 'Tidak dapat menjangkau endpoint /api/test.php. (Normal jika sedang berjalan di localhost Vite dev server).'
    };
  }
}

/**
 * Mengambil data tabel dari MySQL Hostinger
 */
export async function fetchFromHostinger(table: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/data.php?table=${encodeURIComponent(table)}`);
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
 * Mengunggah file ke hosting Hostinger (folder /uploads/)
 */
export async function uploadToHostinger(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload.php', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);
    const data = await res.json();
    return data.url || null;
  } catch (e) {
    console.error('[Hostinger Upload] Gagal mengunggah file:', e);
    return null;
  }
}
