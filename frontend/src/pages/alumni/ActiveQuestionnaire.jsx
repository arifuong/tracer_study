import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { ClipboardCheck, CheckCircle2, AlertCircle, Play, Loader2, Lock, ArrowRight } from 'lucide-react';

const ActiveQuestionnaire = () => {
  const [activeKuesioners, setActiveKuesioners] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Mengambil data kuesioner, status pengisian, dan profil alumni
  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const profileRes = await api.get('/api/alumni/profile');
        setProfile(profileRes.data);

        // Sebelum mengambil data kuesioner:
        if (!profileRes.data.profileComplete) {
          navigate('/alumni/profile');
          return;
        }

        const [activeRes, submissionsRes] = await Promise.all([
          api.get('/api/alumni/kuesioner/active'),
          api.get('/api/alumni/pengisian/status')
        ]);
        setActiveKuesioners(activeRes.data);
        setSubmissions(submissionsRes.data);
      } catch (err) {
        setError('Gagal memuat kuesioner aktif. Silakan muat ulang halaman.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaires();
  }, [navigate]);

  const getStatus = (kuesionerId) => {
    const sub = submissions.find(s => s.kuesionerId === kuesionerId);
    return sub ? sub.status : 'Belum Mengisi';
  };

  // Menentukan kelengkapan profil alumni untuk memblokir pengisian kuesioner
  const isProfileIncomplete = () => {
    return !profile || !profile.profileComplete;
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium">Memuat kuesioner aktif...</p>
      </div>
    );
  }

  const profileLocked = isProfileIncomplete();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Kuesioner Tracer Study</h1>
        <p className="text-slate-500 text-sm mt-1">Isi kuesioner pada periode yang aktif untuk evaluasi program studi.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="flex-shrink-0 text-rose-600" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Tampilan Peringatan Jika Profil Belum Lengkap */}
      {profileLocked ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
              <Lock size={24} className="text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Profil Anda belum lengkap.</h3>
              <p className="text-slate-600 text-sm mt-1">
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
        /* Active Questionnaires List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeKuesioners.length > 0 ? (
            activeKuesioners.map((kuesioner) => {
              const status = getStatus(kuesioner.id);
              const isSubmitted = status === 'Sudah Mengisi';

              return (
                <div 
                  key={kuesioner.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* Accent border */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${isSubmitted ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md border border-slate-200/50">
                        {kuesioner.periodeNama}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        isSubmitted 
                           ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' 
                          : 'bg-amber-50 text-amber-700 border-amber-200/50'
                      }`}>
                        {isSubmitted ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800 text-base">{kuesioner.judulKuesioner}</h3>
                      <p className="text-slate-500 text-xs mt-2 leading-relaxed">{kuesioner.deskripsi || 'Tidak ada deskripsi.'}</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">
                      Jumlah: {kuesioner.pertanyaan?.length || 0} pertanyaan
                    </span>

                    {isSubmitted ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-400 font-medium rounded-xl text-xs cursor-not-allowed"
                      >
                        Sudah Dikirim
                      </button>
                    ) : (
                      <Link
                        to={`/alumni/kuesioner/fill/${kuesioner.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3B8A] hover:bg-[#1E40AF] text-[#F8FAFC] font-semibold rounded-[6px] text-xs transition-all shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px,_rgba(0,0,0,0.1)_0px_1px_2px_-1px]"
                      >
                        <Play size={12} />
                        Isi Sekarang
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <ClipboardCheck size={22} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Kuesioner Aktif</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Saat ini tidak ada periode tracer study yang sedang berlangsung. Kami akan mengabari Anda jika periode pengisian baru telah dibuka.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveQuestionnaire;
