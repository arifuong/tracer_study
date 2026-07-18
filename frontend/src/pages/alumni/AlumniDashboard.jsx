import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAlumniProfile } from '../../services/alumniService';
import { getActiveKuesioner, getSubmissionStatus } from '../../services/kuesionerService';
import { 
  User, ClipboardCheck, AlertCircle, 
  ArrowRight, CheckCircle2, FileClock, Loader2, Lock
} from 'lucide-react';

const AlumniDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [activeKuesioners, setActiveKuesioners] = useState([]);
  const [kuesionerUnavailable, setKuesionerUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Mengambil data dashboard alumni dari server
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileRes = await getAlumniProfile();
        setProfile(profileRes.data);

        if (profileRes.data.profileComplete) {
          try {
            const submissionsRes = await getSubmissionStatus();
            setSubmissions(submissionsRes.data);
          } catch {
            setSubmissions([]);
          }

          try {
            const activeRes = await getActiveKuesioner();
            setActiveKuesioners(activeRes.data);
            setKuesionerUnavailable(false);
          } catch {
            setActiveKuesioners([]);
            setKuesionerUnavailable(true);
          }
        }
      } catch (err) {
        setError('Gagal memuat data dashboard. Silakan muat ulang halaman.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Menentukan kelengkapan data profil alumni sesuai aturan bisnis
  // Indonesian comment: Menggunakan flag kelengkapan profil dari backend.
  const isProfileIncomplete = () => {
    return !profile || !profile.profileComplete;
  };

  const isPasswordDefault = () => {
    return profile && !profile.passwordChanged;
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium">Memuat data dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-4 text-rose-800">
        <AlertCircle className="flex-shrink-0" size={24} />
        <div>
          <h3 className="font-bold text-lg">Error</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const profileLocked = isProfileIncomplete();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/10">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {profile?.namaLengkap || 'Alumni'}!
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base mt-2">
            Membantu almamater meningkatkan mutu akademik melalui partisipasi Anda dalam program Tracer Study.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-xl" />
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-xl" />
      </div>

      {/* Kartu Peringatan untuk Profil Belum Lengkap */}
      {/* Indonesian comment: Menampilkan kartu peringatan jika profil belum lengkap atau password default belum diubah */}
      {profileLocked ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
              <Lock size={24} className="text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Profil Anda belum lengkap.</h3>
              <p className="text-slate-650 text-sm mt-1">
                Lengkapi profil Anda terlebih dahulu sebelum mengisi kuesioner.
              </p>
            </div>
          </div>
          <Link 
            to="/alumni/profile" 
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#1E3B8A] hover:bg-[#1E40AF] text-[#F8FAFC] rounded-[6px] text-sm font-semibold transition-all shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px,_rgba(0,0,0,0.1)_0px_1px_2px_-1px] whitespace-nowrap"
          >
            Lengkapi Profil
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        /* Active Questionnaire Notifications */
        activeKuesioners.length > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
                <ClipboardCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Kuesioner Tracer Study Aktif!</h3>
                <p className="text-slate-600 text-sm mt-0.5">
                  Ada {activeKuesioners.length} kuesioner aktif yang membutuhkan partisipasi Anda.
                </p>
              </div>
            </div>
            <Link 
              to="/alumni/kuesioner" 
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#1E3B8A] hover:bg-[#1E40AF] text-[#F8FAFC] rounded-[6px] text-sm font-medium transition-all shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px,_rgba(0,0,0,0.1)_0px_1px_2px_-1px]"
            >
              Isi Kuesioner Sekarang
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 flex gap-4 items-start">
            <div className="p-3 bg-slate-200 text-slate-600 rounded-xl">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {kuesionerUnavailable ? 'Kuesioner Tidak Tersedia' : 'Belum Ada Kuesioner Baru'}
              </h3>
              <p className="text-slate-600 text-sm mt-0.5">
                {kuesionerUnavailable
                  ? 'Tidak ada kuesioner tersedia.'
                  : 'Tidak ada kuesioner aktif untuk diisi saat ini. Terima kasih telah memantau tracer study.'}
              </p>
            </div>
          </div>
        )
      )}

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-slate-800 text-base">Profil Alumni</h3>
              <User className="text-slate-400" size={20} />
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-xs block">Nama Lengkap</span>
                <span className="text-slate-800 font-semibold text-sm">{profile?.namaLengkap || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">NIM / Program Studi</span>
                <span className="text-slate-800 font-semibold text-sm">{profile?.nim || '-'} / {profile?.prodi || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Jenis Kelamin</span>
                <span className="text-slate-800 font-semibold text-sm">{profile?.jenisKelamin || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Tanggal Yudisium / Lulus</span>
                <span className="text-slate-800 font-semibold text-sm">{profile?.tanggalLulus || '-'}</span>
              </div>
            </div>
          </div>
          <Link 
            to="/alumni/profile" 
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-1.5 mt-6 group"
          >
            Lihat Lengkap 
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Questionnaire History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <h3 className="font-bold text-slate-800 text-base">Riwayat Pengisian Kuesioner</h3>
          <FileClock className="text-slate-400" size={20} />
        </div>
        {submissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm overflow-hidden rounded-xl">
              <thead>
                <tr className="bg-[#1E3B8A] text-white font-semibold">
                  <th className="py-3.5 px-4 rounded-tl-lg">Nama Periode</th>
                  <th className="py-3.5 px-4">Judul Kuesioner</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 rounded-tr-lg">Tanggal Pengisian</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className="py-3.5 pr-4 text-slate-800 font-medium">{sub.namaPeriode}</td>
                    <td className="py-3.5 px-4 text-slate-600">{sub.judulKuesioner}</td>
                    <td className="py-3.5 px-4">
                      {sub.status === 'Sudah Mengisi' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                          <CheckCircle2 size={12} />
                          Sudah Mengisi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/50">
                          <AlertCircle size={12} />
                          Belum Mengisi
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-slate-500">{sub.tanggalIsi || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400">
            <p className="text-sm">Tidak ada riwayat pengisian kuesioner.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniDashboard;
