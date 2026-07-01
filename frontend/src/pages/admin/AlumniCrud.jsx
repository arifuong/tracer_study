import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getAllAlumni, createAlumni, updateAlumni, deleteAlumni } from '../../services/alumniService';
import { 
  Users, Search, Plus, Edit2, Trash2, 
  X, Check, AlertCircle, Loader2 
} from 'lucide-react';

const AlumniCrud = () => {
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentId, setCurrentId] = useState(null); // null if adding
  
  const [nim, setNim] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [prodi, setProdi] = useState('Teknik Informatika');
  const [tanggalLulus, setTanggalLulus] = useState('');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('');
  const [alamatRumah, setAlamatRumah] = useState('');
  const [password, setPassword] = useState('');

  // Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchAlumni = async () => {
    try {
      const response = await getAllAlumni();
      setAlumniList(response.data);
    } catch (err) {
      setError('Gagal memuat daftar alumni. Silakan muat ulang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const openAddModal = () => {
    setCurrentId(null);
    setNim('');
    setNamaLengkap('');
    setTempatLahir('');
    setTanggalLahir('');
    setProdi('Teknik Informatika');
    setTanggalLulus('');
    setNoHp('');
    setEmail('');
    setJenisKelamin('');
    setAlamatRumah('');
    setPassword('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (alumni) => {
    setCurrentId(alumni.id);
    setNim(alumni.nim || '');
    setNamaLengkap(alumni.namaLengkap || '');
    setTempatLahir(alumni.tempatLahir || '');
    setTanggalLahir(alumni.tanggalLahir || '');
    setProdi(alumni.prodi || 'Teknik Informatika');
    setTanggalLulus(alumni.tanggalLulus || '');
    setNoHp(alumni.noHp || '');
    setEmail(alumni.email || '');
    setJenisKelamin(alumni.jenisKelamin || '');
    setAlamatRumah(alumni.alamatRumah || '');
    setPassword('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    // Client-side validations (Validasi format email jika diisi)
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setFormError('Email tidak valid');
        setSaving(false);
        return;
      }
    }

    // Mengubah string kosong menjadi null agar backend Spring Boot dapat memprosesnya dengan benar
    const payload = {
      nim: nim ? nim.trim() : null,
      namaLengkap: namaLengkap ? namaLengkap.trim() : null,
      tempatLahir: tempatLahir ? tempatLahir.trim() : null,
      tanggalLahir: tanggalLahir || null,
      prodi: prodi || null,
      tanggalLulus: tanggalLulus || null,
      noHp: noHp ? noHp.trim() : null,
      email: email ? email.trim() : null,
      jenisKelamin: jenisKelamin || null,
      alamatRumah: alamatRumah ? alamatRumah.trim() : null,
      password: password || null
    };

    try {
      if (currentId) {
        await updateAlumni(currentId, payload);
      } else {
        await createAlumni(payload);
      }
      setIsModalOpen(false);
      fetchAlumni();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Gagal menyimpan data alumni. Periksa isian Anda.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlumni(id);
      setConfirmDeleteId(null);
      fetchAlumni();
    } catch (err) {
      setError('Gagal menghapus data alumni.');
    }
  };

  // Filtered List
  const filteredAlumni = alumniList.filter(alumni => {
    const query = searchQuery.toLowerCase();
    return (
      alumni.namaLengkap?.toLowerCase().includes(query) ||
      alumni.nim?.toLowerCase().includes(query) ||
      alumni.prodi?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium">Memuat data alumni...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Manajemen Data Alumni</h1>
          <p className="text-slate-500 text-sm mt-1">Tambah, ubah, hapus, dan tinjau rekam karir mahasiswa lulusan.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          Registrasi Alumni Baru
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Cari berdasarkan NIM, Nama, atau Program Studi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm transition-colors"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredAlumni.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#1E3B8A] text-white font-semibold">
                  <th className="py-4 px-6">NIM / Nama</th>
                  <th className="py-4 px-6">Program Studi</th>
                  <th className="py-4 px-6">Tanggal Lulus</th>
                  <th className="py-4 px-6">Kontak</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlumni.map((alumni) => (
                  <tr key={alumni.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{alumni.namaLengkap}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{alumni.nim}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{alumni.prodi}</td>
                    <td className="py-4 px-6 text-slate-500">{alumni.tanggalLulus}</td>
                    <td className="py-4 px-6">
                      <div className="text-slate-600 text-xs">{alumni.email || '-'}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{alumni.noHp || '-'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(alumni)}
                          title="Ubah Profil"
                          className="p-2 text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(alumni.id)}
                          title="Hapus Alumni"
                          className="p-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="mx-auto text-slate-300" size={32} />
            <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Alumni Ditemukan</h3>
            <p className="text-slate-500 text-xs">Silakan periksa kata kunci pencarian Anda atau registrasi alumni baru.</p>
          </div>
        )}
      </div>

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-base">
                {currentId ? 'Ubah Profil Alumni' : 'Registrasi Alumni Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1 bg-white">
              {formError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-[#FF2D20] text-xs font-semibold">
                  <AlertCircle className="flex-shrink-0" size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
                <div>
                  <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">Nomor Induk Mahasiswa (NIM)</label>
                  <input
                    type="text"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    required
                    disabled={!!currentId} // NIM bersifat read-only saat mode edit
                    placeholder="Masukkan NIM"
                    className={`w-full px-4 h-10 border rounded-xl text-sm focus:outline-none transition-all shadow-sm ${
                      currentId 
                        ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' 
                        : 'border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">Program Studi</label>
                  <select
                    value={prodi}
                    onChange={(e) => setProdi(e.target.value)}
                    disabled={!!currentId} // Program studi bersifat read-only saat mode edit
                    className={`w-full px-3 h-10 border rounded-xl text-sm focus:outline-none transition-all shadow-sm ${
                      currentId 
                        ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' 
                        : 'border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                    }`}
                  >
                    <option value="Teknik Informatika">Teknik Informatika</option>
                    <option value="Sistem Informasi">Manajemen Informatika</option>
                    <option value="Teknik Elektro">Komputerisasi Akuntansi</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    required
                    placeholder="Nama lengkap alumni"
                    className="w-full px-4 h-10 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-sm transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">Tempat Lahir</label>
                  <input
                    type="text"
                    value={tempatLahir}
                    onChange={(e) => setTempatLahir(e.target.value)}
                    placeholder="Contoh: Jakarta"
                    className="w-full px-4 h-10 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-sm transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    className="w-full px-4 h-10 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-sm transition-all shadow-sm cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">Tanggal Yudisium / Kelulusan</label>
                  <input
                    type="date"
                    value={tanggalLulus}
                    onChange={(e) => setTanggalLulus(e.target.value)}
                    required
                    className="w-full px-4 h-10 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-sm transition-all shadow-sm cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">Nomor HP</label>
                  <input
                    type="tel"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="Contoh: 0812345678"
                    className="w-full px-4 h-10 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-sm transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-4 h-10 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-sm transition-all shadow-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">Jenis Kelamin</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value)}
                    className="w-full px-3 h-10 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                  >
                    <option value="">Belum diisi</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

               

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">Alamat Rumah</label>
                  <textarea
                    value={alamatRumah}
                    onChange={(e) => setAlamatRumah(e.target.value)}
                    rows={3}
                    placeholder="Alamat lengkap tempat tinggal"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-sm transition-all shadow-sm resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/10 transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Simpan Alumni
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialogue */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Hapus Data Alumni?</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Tindakan ini permanen. Seluruh data profil, akun login, dan jawaban kuesioner terkait akan terhapus sepenuhnya.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniCrud;
