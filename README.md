# SISTEM MANAJEMEN SEKOLAH (School Management System)

Aplikasi web modern, profesional, responsif, dan aman berbasis **React.js + TypeScript**, **Tailwind CSS (Modern Soft 3D / Soft UI)**, dan backend cloud **Supabase PostgreSQL & Storage**.

---

## 🌟 FITUR UTAMA & ARSITEKTUR

### 1. Desain & Tampilan (Modern Soft UI / Soft 3D)
- **Soft 3D / Claymorphic Aesthetic**: Menggabungkan warna Navy Blue (`#0B2240`, `#1E4A80`, `#2563EB`), putih bersih, aksen biru muda, dan palet pastel lembut.
- **Kartu Statistik Interaktif**: Efek embos lembut (*soft shadows & inner glows*), rounded squircle (`rounded-3xl`).
- **Grafik Interaktif Recharts**: Grafik distribusi siswa per kelas, komposisi gender (Donut chart), dan tren absensi bulanan (Area chart).
- **Responsive Penuh**: Optimal di layar Desktop, Laptop, Tablet, hingga Smartphone.
- **Dark Mode & Light Mode**: Peralihan instan tema gelap dan terang dengan tombol toggle di Topbar.
- **Notifikasi Toast**: Umpan balik langsung untuk setiap aksi CRUD, validasi, dan login/logout.

### 2. Tiga Tingkatan Peran & Hak Akses (RBAC)
1. **ADMINISTRATOR**
   - Akses penuh ke seluruh fitur dan master data.
   - Manajemen Profil Sekolah, Pengguna, Dewan Guru, Peserta Didik, Rombel/Kelas, Mata Pelajaran, Tahun Ajaran & Semester.
   - Manajemen Jadwal Pelajaran (dengan validasi bentrok guru dan kelas).
   - Manajemen Presensi (Siswa & Guru), Leger Nilai, Tugas, Ujian, Pengumuman, Inventaris, Surat Masuk/Keluar, Pembayaran SPP, dan Pengaturan Sistem.
2. **DEWAN GURU**
   - Dashboard Guru dengan ringkasan jam mengajar hari ini dan tugas yang perlu diperiksa.
   - Input dan rekap presensi siswa per kelas dan mata pelajaran.
   - Input nilai formatif/sumatif dan pengaturan bobot.
   - Pembuatan tugas, modul pengayaan, dan pemeriksaan tugas siswa dengan nilai & feedback.
   - Manajemen jadwal ujian dan pengumuman kelas.
3. **PESERTA DIDIK (SISWA)**
   - Dashboard Siswa dengan ringkasan kehadiran, rata-rata nilai, dan status tugas.
   - Jadwal pelajaran kelas harian.
   - Pengumpulan tugas online (upload berkas dokumen/gambar ke Supabase Storage).
   - Pengunduhan materi belajar dan informasi pengumuman.
   - Cek riwayat tagihan dan kwitansi pembayaran SPP.

---

## 🗄️ STRUKTUR BASIS DATA SUPABASE (31 TABEL)

Skrip SQL lengkap tersedia di file: `supabase/migrations/20260101_init_school_system.sql` dan data awal di `supabase/seed.sql`.

1. `profiles`: Profil pengguna, autentikasi & role.
2. `school_settings`: Identitas kelembagaan sekolah, NPSN, logo, kontak.
3. `academic_years`: Periode tahun ajaran & status arsip.
4. `semesters`: Semester Ganjil & Genap.
5. `classes`: Rombongan belajar, wali kelas, kapasitas.
6. `teachers`: Biodata dewan guru, NIP, NUPTK, status kepegawaian.
7. `students`: Buku induk siswa, NIS, NISN, data orang tua.
8. `subjects`: Mata pelajaran, kategori wajib/peminatan, jam pelajaran.
9. `class_subjects`: Relasi pembagian mapel ke kelas dan guru.
10. `teacher_assignments`: Penugasan mengajar guru.
11. `schedules`: Jadwal KBM mingguan (Hari, Jam, Ruang, Guru, Mapel).
12. `student_attendance`: Presensi harian siswa (Hadir, Sakit, Izin, Alpa, Dispen).
13. `teacher_attendance`: Presensi kehadiran dewan guru (Masuk, Pulang).
14. `grade_components`: Komponen penilaian (Tugas, Formatif, PTS, PAS, Bobot %).
15. `grades`: Nilai siswa per komponen dan mata pelajaran.
16. `assignments`: Penugasan pembelajaran dari guru.
17. `assignment_submissions`: Berkas tugas yang dikumpulkan siswa & skor guru.
18. `learning_materials`: Modul belajar, slide, video, latihan.
19. `exams`: Jadwal asesmen, PTS, PAS, ruang ujian.
20. `exam_participants`: Kartu peserta ujian & berita acara nilai.
21. `announcements`: Siaran pengumuman sekolah & target penerima.
22. `academic_events`: Kalender agenda kegiatan tahunan.
23. `inventory`: Buku inventaris sarana dan prasarana.
24. `inventory_loans`: Log sirkulasi peminjaman barang inventaris.
25. `incoming_letters`: Buku agenda surat masuk & digitalisasi dokumen.
26. `outgoing_letters`: Buku agenda surat keluar dinas resmi.
27. `payment_types`: Pos tarif pembayaran sekolah (SPP, Gedung, Seragam).
28. `student_bills`: Tagihan iuran siswa per bulan/periode.
29. `payment_transactions`: Mutasi penerimaan kas & nomor kwitansi resmi.
30. `notifications`: Notifikasi realtime untuk pengguna.
31. `activity_logs`: Jejak audit aktivitas keamanan dan perubahan data.

---

## 🚀 CARA MENJALANKAN APLIKASI

### Prasyarat
- Node.js versi 18+ (disarankan Node.js 20+)
- npm atau yarn / pnpm

### Langkah Instalasi
```bash
# 1. Masuk ke direktori project
cd "d:\Website\sistem manajemen sekolah"

# 2. Install dependensi
npm install

# 3. Jalankan server lokal
npm run dev
```
Aplikasi akan aktif di: **`http://localhost:3000`**

---

## ⚡ CARA MENGHUBUNGKAN KE SUPABASE (CLOUD)

1. Buka dashboard [Supabase](https://supabase.com) dan buat project baru.
2. Buka menu **SQL Editor** di Supabase.
3. Buka file `supabase/migrations/20260101_init_school_system.sql`, salin seluruh isinya, dan klik **Run**.
4. (Opsional) Salin isi `supabase/seed.sql` dan klik **Run** untuk memasukkan data contoh awal.
5. Di Supabase, buat Storage Buckets:
   - `assignments` (Public)
   - `submissions` (Public / Authenticated)
   - `materials` (Public)
   - `letters` (Public / Private)
6. Masukkan Project URL dan Anon Public Key ke file `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   *Atau langsung masukkan melalui menu **Pengaturan Sistem > Konfigurasi Supabase** di dalam aplikasi.*

---

## 🔑 AKUN PENGUJIAN DEMO

Aplikasi dilengkapi tombol **1-Click Login** di halaman login untuk mempermudah evaluasi:

| Peran (Role) | Email Login | Password | Keterangan |
|---|---|---|---|
| **Admin** | `admin@sekolah.sch.id` | `password123` | Akses penuh seluruh master data & pengaturan |
| **Guru** | `guru.budi@sekolah.sch.id` | `password123` | Akses jadwal, kelas ampu, presensi, nilai, tugas |
| **Siswa** | `siswa.ahmad@sekolah.sch.id` | `password123` | Akses jadwal kelas, nilai, tugas, materi, tagihan |

---

## 📄 FITUR EKSPOR & CETAK
- **Ekspor Excel (.xlsx)**: Tersedia di modul Siswa, Guru, Kelas, Presensi, Nilai, Inventaris, dan Laporan.
- **Cetak Laporan PDF**: Otomatis menghasilkan berkas PDF berheader resmi sekolah.
- **Cetak Kwitansi Resmi**: Menghasilkan bukti pembayaran SPP ukuran A6 dengan nomor kwitansi unik.
- **Cetak Leger Nilai**: Matriks rekapitulasi nilai formatif, sumatif, bobot, dan predikat seluruh siswa.
