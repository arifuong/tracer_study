import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getAlumniProfile } from '../../services/alumniService';
import { getActiveKuesioner, submitAnswers } from '../../services/kuesionerService';
import { ArrowLeft, Check, AlertCircle, Loader2, Lock, ArrowRight } from 'lucide-react';

const FillQuestionnaire = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [kuesioner, setKuesioner] = useState(null);
  const [profile, setProfile] = useState(null);
  const [answers, setAnswers] = useState({}); // Maps pertanyaanId to jawabanTeks
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Mengambil kuesioner aktif dan profil alumni secara bersamaan
  // Indonesian comment: Memastikan data kuesioner dan profil lengkap dimuat pada awal pemuatan komponen.
  useEffect(() => {
    const fetchQuestionnaireAndProfile = async () => {
      try {
        const [response, profileRes] = await Promise.all([
          getActiveKuesioner(),
          getAlumniProfile()
        ]);
        
        const list = response.data;
        const found = list.find(k => k.id === parseInt(id));
        setProfile(profileRes.data);

        if (found) {
          setKuesioner(found);
          // Initialize answers map
          const initialAnswers = {};
          found.pertanyaan?.forEach(p => {
            initialAnswers[p.id] = '';
          });
          setAnswers(initialAnswers);
        } else {
          setError('Kuesioner tidak ditemukan atau periode sudah ditutup.');
        }
      } catch (err) {
        setError('Gagal memuat kuesioner. Silakan coba kembali.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaireAndProfile();
  }, [id]);

  const handleAnswerChange = (pertanyaanId, text) => {
    setAnswers(prev => ({
      ...prev,
      [pertanyaanId]: text
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation: Make sure all questions are answered
    const unanswered = kuesioner.pertanyaan.filter(p => !answers[p.id] || answers[p.id].trim() === '');
    if (unanswered.length > 0) {
      setError('Harap isi semua pertanyaan kuesioner sebelum men-submit.');
      return;
    }

    setSubmitting(true);

    const payload = {
      jawaban: Object.entries(answers).map(([pId, text]) => ({
        pertanyaanId: parseInt(pId),
        jawabanTeks: text
      }))
    };

    try {
      await submitAnswers(id, payload);
      navigate('/alumni/kuesioner', { replace: true });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal mengirimkan kuesioner. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Menentukan kelengkapan data profil alumni untuk memblokir pengisian kuesioner
  // Indonesian comment: Aturan bisnis melarang pengisian kuesioner jika data profil wajib ada yang kosong.
  const isProfileIncomplete = () => {
    return !profile || 
           !profile.nim || !profile.nim.trim() ||
           !profile.namaLengkap || !profile.namaLengkap.trim() ||
           !profile.email || !profile.email.trim() ||
           !profile.noHp || !profile.noHp.trim() ||
           !profile.prodi || !profile.prodi.trim() ||
           !profile.tanggalLulus ||
           !profile.jenisKelamin || !profile.jenisKelamin.trim() ||
           !profile.alamatRumah || !profile.alamatRumah.trim();
  };

  // Helper to parse JSON choices
  const parseChoices = (choicesStr) => {
    try {
      if (!choicesStr) return [];
      return JSON.parse(choicesStr);
    } catch (e) {
      // In case it's comma separated or invalid
      return choicesStr.split(',').map(s => s.trim().replace(/"/g, ''));
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium">Memuat kuesioner...</p>
      </div>
    );
  }

  const profileLocked = isProfileIncomplete();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link to="/alumni/kuesioner" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
        <ArrowLeft size={16} />
        Batal dan Kembali
      </Link>

      {/* Tampilan Peringatan Jika Profil Belum Lengkap */}
      {/* Indonesian comment: Memblokir formulir pengisian kuesioner jika data profil belum lengkap */}
      {profileLocked ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
              <Lock size={24} className="text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Profil Anda belum lengkap.</h3>
              <p className="text-slate-650 text-sm mt-1">
                Silakan lengkapi profil terlebih dahulu sebelum mengisi kuesioner tracer study.
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
        <>
          {/* Header */}
          <div>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md border border-blue-200/50">
              {kuesioner?.periodeNama}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-3">
              {kuesioner?.judulKuesioner}
            </h1>
            <p className="text-slate-500 text-sm mt-1">{kuesioner?.deskripsi}</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
              <AlertCircle className="flex-shrink-0 text-rose-600" size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Questionnaire Form */}
          {kuesioner && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                {kuesioner.pertanyaan?.map((pertanyaan, idx) => {
                  const choices = pertanyaan.tipePertanyaan === 'CHOICE' ? parseChoices(pertanyaan.pilihan) : [];

                  return (
                    <div key={pertanyaan.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex gap-2.5 items-start">
                        <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <label className="text-slate-800 font-semibold text-sm leading-relaxed">
                          {pertanyaan.teksPertanyaan}
                        </label>
                      </div>

                      {/* Render based on question type */}
                      {pertanyaan.tipePertanyaan === 'CHOICE' ? (
                        <div className="grid grid-cols-1 gap-2.5 pl-8">
                          {choices.map((choice) => (
                            <label 
                              key={choice} 
                              className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer text-sm font-medium transition-all ${
                                answers[pertanyaan.id] === choice
                                  ? 'bg-blue-50/50 border-blue-500 text-blue-800'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`pertanyaan-${pertanyaan.id}`}
                                value={choice}
                                checked={answers[pertanyaan.id] === choice}
                                onChange={() => handleAnswerChange(pertanyaan.id, choice)}
                                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                              />
                              {choice}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="pl-8">
                          <textarea
                            value={answers[pertanyaan.id] || ''}
                            onChange={(e) => handleAnswerChange(pertanyaan.id, e.target.value)}
                            rows={3}
                            placeholder="Tuliskan jawaban Anda di sini..."
                            required
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm transition-colors resize-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                type="submit"
                disabled={submitting}
                className="h-9 px-6 bg-[#1E3B8A] hover:bg-[#1E40AF] active:scale-[0.98] text-[#F8FAFC] font-semibold rounded-[6px] text-sm transition-all shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px,_rgba(0,0,0,0.1)_0px_1px_2px_-1px] flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Mengirimkan...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Kirim Jawaban
                  </>
                )}
              </button>
            </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default FillQuestionnaire;
