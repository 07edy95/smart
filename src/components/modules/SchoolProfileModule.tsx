import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { School, Save, Building, MapPin, Mail, Phone, Globe, UserCheck, Shield } from 'lucide-react';

export const SchoolProfileModule: React.FC = () => {
  const { schoolSettings, updateSchoolSettings, role } = useApp();
  const [formData, setFormData] = useState({ ...schoolSettings });
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateSchoolSettings(formData);
      setIsSaving(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="clay-card p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <School className="w-6 h-6 text-blue-600" />
              Profil & Identitas Sekolah
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Data induk kelembagaan satuan pendidikan dan nomor registrasi resmi
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="clay-btn-primary text-xs sm:text-sm py-2.5 px-5 self-start sm:self-auto"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Main Info */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-500" />
              Informasi Umum Kelembagaan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Resmi Sekolah *
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.school_name}
                  onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  NPSN (Nomor Pokok Sekolah Nasional) *
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.npsn}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  NSS (Nomor Statistik Sekolah)
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.nss || ''}
                  onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jenjang Pendidikan
                </label>
                <select
                  disabled={!isAdmin}
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="SMA">SMA</option>
                  <option value="SMK">SMK</option>
                  <option value="MA">MA</option>
                  <option value="SMP">SMP</option>
                  <option value="MTs">MTs</option>
                  <option value="SD">SD</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status Sekolah
                </label>
                <select
                  disabled={!isAdmin}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="Negeri">Negeri</option>
                  <option value="Swasta">Swasta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Kepala Sekolah *
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.headmaster_name}
                  onChange={(e) => setFormData({ ...formData, headmaster_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location & Address */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              Alamat & Lokasi Sekolah
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alamat Jalan Lengkap *
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kelurahan / Desa
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.village || ''}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kecamatan
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.district || ''}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kabupaten / Kota
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.regency || ''}
                  onChange={(e) => setFormData({ ...formData, regency: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Provinsi
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.province || ''}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kode Pos
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.postal_code || ''}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Contact & Media */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-500" />
              Kontak & Saluran Resmi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Resmi Sekolah
                </label>
                <input
                  type="email"
                  disabled={!isAdmin}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Website Sekolah
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
