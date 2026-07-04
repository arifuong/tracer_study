import React, { useEffect, useState } from 'react';
import { getAlumniProfile, updateAlumniProfile } from '../../services/alumniService';
import { User, Mail, Phone, MapPin, Calendar, CheckCircle2, AlertCircle, Loader2, Lock, ShieldCheck, Check } from 'lucide-react';

const AlumniProfile = () => {
  // State Profile Form
  const [formData, setFormData] = useState({
    nim: '',
    namaLengkap: '',
    username: '',
    tempatLahir: '',
    tanggalLahir: '',
    prodi: '',
    tanggalLulus: '',
    noHp: '',
    email: '',
    jenisKelamin: '',
    alamatRumah: ''
  });

  // State Password Form
  const [passwordData, setPasswordData] = useState({
    passwordSaatIni: '',
    passwordBaru: '',
    konfirmasiPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Status Profile Completion
  const [isComplete, setIsComplete] = useState(false);

  // Mengambil data profil alumni saat halaman dimuat
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getAlumniProfile();
        const data = response.data;
        
        setFormData({
          nim: data.nim || '',
          namaLengkap: data.namaLengkap || '',
          username: data.username || '',
          tempatLahir: data.tempatLahir || '',
          tanggalLahir: data.tanggalLahir || '',
          prodi: data.prodi || '',
          tanggalLulus: data.tanggalLulus || '',
          noHp: data.noHp || '',
          email: data.email || '',
          jenisKelamin: data.jenisKelamin || '',
          alamatRumah: data.alamatRumah || ''
        });

        const completeStatus = data.profileComplete;
        setIsComplete(!!completeStatus);
      } catch (err) {
        setProfileError('Gagal memuat profil alumni. Silakan muat ulang halaman.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Handler Simpan Profil
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSavingProfile(true);

    const payload = {
      nim: formData.nim,
      namaLengkap: formData.namaLengkap,
      username: formData.username,
      prodi: formData.prodi,
      tempatLahir: formData.tempatLahir ? formData.tempatLahir.trim() : null,
      tanggalLahir: formData.tanggalLahir || null,
      tanggalLulus: formData.tanggalLulus || null,
      noHp: formData.noHp ? formData.noHp.trim() : null,
      email: formData.email ? formData.email.trim() : null,
      jenisKelamin: formData.jenisKelamin,
      alamatRumah: formData.alamatRumah ? formData.alamatRumah.trim() : null
      // Tidak mengirimkan field password di form Simpan Profil
    };

    try {
      const response = await updateAlumniProfile(payload);
      setProfileSuccess('Profil Anda berhasil diperbarui.');
      
      const data = response.data;
      setFormData({
        nim: data.nim || '',
        namaLengkap: data.namaLengkap || '',
        username: data.username || '',
        tempatLahir: data.tempatLahir || '',
        tanggalLahir: data.tanggalLahir || '',
        prodi: data.prodi || '',
        tanggalLulus: data.tanggalLulus || '',
        noHp: data.noHp || '',
        email: data.email || '',
        jenisKelamin: data.jenisKelamin || '',
        alamatRumah: data.alamatRumah || ''
      });

      const completeStatus = data.profileComplete;
      setIsComplete(!!completeStatus);

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.username) {
        localStorage.setItem('username', data.username);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setProfileError(err.response.data.message);
      } else {
        setProfileError('Gagal memperbarui profil. Periksa data yang Anda masukkan.');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // Handler Ubah Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.passwordSaatIni) {
      setPasswordError('Silakan masukkan password saat ini.');
      return;
    }

    if (passwordData.passwordBaru !== passwordData.konfirmasiPassword) {
      setPasswordError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    if (!passwordData.passwordBaru || passwordData.passwordBaru.length < 8) {
      setPasswordError('Password baru harus memiliki minimal 8 karakter.');
      return;
    }

    setSavingPassword(true);

    const payload = {
      nim: formData.nim,
      namaLengkap: formData.namaLengkap,
      username: formData.username,
      prodi: formData.prodi,
      tempatLahir: formData.tempatLahir ? formData.tempatLahir.trim() : null,
      tanggalLahir: formData.tanggalLahir || null,
      tanggalLulus: formData.tanggalLulus || null,
      noHp: formData.noHp ? formData.noHp.trim() : null,
      email: formData.email ? formData.email.trim() : null,
      jenisKelamin: formData.jenisKelamin,
      alamatRumah: formData.alamatRumah ? formData.alamatRumah.trim() : null,
      currentPassword: passwordData.passwordSaatIni.trim(),
      password: passwordData.passwordBaru.trim(),
      confirmPassword: passwordData.konfirmasiPassword.trim()
    };

    try {
      const response = await updateAlumniProfile(payload);
      setPasswordSuccess('Password berhasil diubah.');
      setPasswordData({
        passwordSaatIni: '',
        passwordBaru: '',
        konfirmasiPassword: ''
      });

      const data = response.data;
      const completeStatus = data.profileComplete;
      setIsComplete(!!completeStatus);

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.username) {
        localStorage.setItem('username', data.username);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setPasswordError(err.response.data.message);
      } else {
        setPasswordError('Gagal mengubah password. Silakan coba lagi.');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium">Memuat profil Anda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Profil & Akun</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola informasi data diri, kontak, alamat, dan keamanan akun Anda.</p>
      </div>

      {/* Section 1: Status Information Card */}
      {isComplete ? (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm flex items-start gap-4 text-emerald-800">
          <CheckCircle2 className="flex-shrink-0 text-emerald-600 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-base tracking-tight">Status Profil: Lengkap</h3>
            <p className="text-sm mt-1">Profil Anda sudah lengkap. Anda dapat mengisi kuesioner tracer study.</p>
          </div>
        </div>
      ) : (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm flex items-start gap-4 text-amber-800">
          <AlertCircle className="flex-shrink-0 text-amber-600 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-base tracking-tight">Status Profil: Belum Lengkap</h3>
            <p className="text-sm mt-1">Lengkapi profil Anda terlebih dahulu sebelum mengisi kuesioner.</p>
          </div>
        </div>
      )}

      {/* Grid Layout for Section 2 and Section 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Section 2: Profil Alumni (Left, lg:col-span-2) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3B8A] flex items-center justify-center flex-shrink-0">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Profil Alumni</h2>
              <p className="text-slate-500 text-xs mt-0.5">Informasi akademik, data pribadi, dan alamat tinggal</p>
            </div>
          </div>

          {/* Alerts */}
          {profileSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
              <Check className="flex-shrink-0 text-emerald-600" size={20} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
              <AlertCircle className="flex-shrink-0 text-rose-600" size={20} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="space-y-6">
              {/* Data Akademik (Read Only) */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* NIM */}
                  <div className="flex flex-col">
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">NIM</label>
                    <input
                      type="text"
                      value={formData.nim}
                      disabled
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-sm font-semibold"
                    />
                  </div>

                  {/* Program Studi */}
                  <div className="flex flex-col">
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Program Studi</label>
                    <input
                      type="text"
                      value={formData.prodi}
                      disabled
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-sm font-semibold"
                    />
                  </div>

                  {/* Tanggal Yudisium */}
                  <div className="flex flex-col">
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Tanggal Yudisium</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Calendar size={16} />
                      </span>
                      <input
                        type="date"
                        value={formData.tanggalLulus}
                        disabled
                        className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  Data akademik tidak dapat diubah .
                </p>
              </div>

              {/* Data Pribadi (Editable) */}
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama Lengkap */}
                  <div className="md:col-span-2 flex flex-col">
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      name="namaLengkap"
                      value={formData.namaLengkap}
                      onChange={handleProfileChange}
                      placeholder="Nama Lengkap Anda"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                    />
                  </div>

                  {/* Username */}
                  <div className="flex flex-col">
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleProfileChange}
                      placeholder="Username Anda"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                    />
                  </div>

                  {/* Tempat Lahir */}
                  <div className="flex flex-col">
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Tempat Lahir</label>
                    <input
                      type="text"
                      name="tempatLahir"
                      value={formData.tempatLahir}
                      onChange={handleProfileChange}
                      placeholder="Contoh: Bandung"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                    />
                  </div>

                  {/* Tanggal Lahir */}
                  <div className="flex flex-col">
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Tanggal Lahir</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Calendar size={16} />
                      </span>
                      <input
                        type="date"
                        name="tanggalLahir"
                        value={formData.tanggalLahir}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                      />
                    </div>
                  </div>

                  {/* Jenis Kelamin */}
                  <div className="flex flex-col">
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Jenis Kelamin</label>
                    <select
                      name="jenisKelamin"
                      value={formData.jenisKelamin}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col">
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Email</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleProfileChange}
                        placeholder="nama@email.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                      />
                    </div>
                  </div>

                  {/* Nomor HP */}
                  <div className="flex flex-col">
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Nomor HP</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Phone size={16} />
                      </span>
                      <input
                        type="tel"
                        name="noHp"
                        value={formData.noHp}
                        onChange={handleProfileChange}
                        placeholder="081234567890"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                      />
                    </div>
                  </div>

                  {/* Alamat */}
                  <div className="md:col-span-2 flex flex-col">
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Alamat</label>
                    <div className="relative">
                      <span className="absolute top-3.5 left-3.5 text-slate-400">
                        <MapPin size={16} />
                      </span>
                      <textarea
                        name="alamatRumah"
                        value={formData.alamatRumah}
                        onChange={handleProfileChange}
                        rows={4}
                        placeholder="Tuliskan alamat lengkap tempat tinggal Anda saat ini"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button Profile */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-3 bg-[#1E3B8A] hover:bg-[#1E40AF] text-white font-semibold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Profil'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Ganti Password (Right, lg:col-span-1) */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 h-fit">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3B8A] flex items-center justify-center flex-shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Ganti Password</h2>
              <p className="text-slate-500 text-xs mt-0.5">Ubah password akun Anda secara berkala</p>
            </div>
          </div>

          {/* Alerts */}
          {passwordSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
              <ShieldCheck className="flex-shrink-0 text-emerald-600" size={20} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
              <AlertCircle className="flex-shrink-0 text-rose-600" size={20} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {/* Password Saat Ini */}
            <div className="flex flex-col">
              <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Password Saat Ini</label>
              <input
                type="password"
                name="passwordSaatIni"
                value={passwordData.passwordSaatIni}
                onChange={handlePasswordChange}
                placeholder="Masukkan password saat ini"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm transition-colors"
              />
            </div>

            {/* Password Baru */}
            <div className="flex flex-col">
              <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Password Baru</label>
              <input
                type="password"
                name="passwordBaru"
                value={passwordData.passwordBaru}
                onChange={handlePasswordChange}
                placeholder="Masukkan password baru"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm transition-colors"
              />
            </div>

            {/* Konfirmasi Password */}
            <div className="flex flex-col">
              <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Konfirmasi Password</label>
              <input
                type="password"
                name="konfirmasiPassword"
                value={passwordData.konfirmasiPassword}
                onChange={handlePasswordChange}
                placeholder="Ulangi password baru"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm transition-colors"
              />
            </div>

            {/* Submit Button Password */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-3 bg-[#1E3B8A] hover:bg-[#1E40AF] text-white font-semibold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Menyimpan...
                  </>
                ) : (
                  'Ubah Password'
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AlumniProfile;
