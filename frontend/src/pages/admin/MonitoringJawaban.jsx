import React, { useEffect, useState } from 'react';
import { getAllPeriode } from '../../services/periodeService';
import { getMonitoringJawaban, getMonitoringJawabanDetail } from '../../services/monitoringService';
import { BarChart3, Search, Calendar, CheckCircle2, AlertCircle, Loader2, Eye, X, User, BookOpen } from 'lucide-react';

const MonitoringJawaban = () => {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [monitoringData, setMonitoringData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Detail State
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [answersData, setAnswersData] = useState(null);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [modalError, setModalError] = useState('');

  // Fetch initial periods list
  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const response = await getAllPeriode();
        setPeriods(response.data);
        if (response.data.length > 0) {
          setSelectedPeriodId(response.data[0].id.toString());
        }
      } catch (err) {
        setError('Gagal mengambil data periode.');
      } finally {
        setLoading(false);
      }
    };

    fetchPeriods();
  }, []);

  // Fetch monitoring list whenever selectedPeriodId changes
  useEffect(() => {
    if (!selectedPeriodId) return;

    const fetchMonitoringList = async () => {
      setLoadingList(true);
      try {
        const response = await getMonitoringJawaban(selectedPeriodId);
        setMonitoringData(response.data);
      } catch (err) {
        setError('Gagal memuat status pengisian alumni.');
      } finally {
        setLoadingList(false);
      }
    };

    fetchMonitoringList();
  }, [selectedPeriodId]);

  const handlePeriodChange = (e) => {
    setSelectedPeriodId(e.target.value);
  };

  const handleViewAnswers = async (alumni) => {
    setSelectedAlumni(alumni);
    setLoadingAnswers(true);
    setModalError('');
    setAnswersData(null);

    try {
      const response = await getMonitoringJawabanDetail(selectedPeriodId, alumni.alumniId);
      setAnswersData(response.data);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Gagal memuat detail jawaban alumni.');
    } finally {
      setLoadingAnswers(false);
    }
  };

  const closeModal = () => {
    setSelectedAlumni(null);
    setAnswersData(null);
  };

  const filteredData = monitoringData.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.namaAlumni?.toLowerCase().includes(query) ||
      item.nim?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium">Memuat konfigurasi monitoring...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Monitoring Jawaban Alumni</h1>
        <p className="text-slate-500 text-sm mt-1">Pantau status pengisian dan lihat detail jawaban kuesioner tracer study alumni.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="flex-shrink-0 text-rose-600" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Period Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        {/* Period Selection */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pilih Periode Tracer Study</label>
          <div className="relative">
            <select
              value={selectedPeriodId}
              onChange={handlePeriodChange}
              className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-sm transition-colors"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>{p.namaPeriode}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="md:col-span-2 flex flex-col">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cari Alumni (NIM / Nama)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan NIM atau Nama Alumni..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loadingList ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-2.5">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <p className="text-xs font-medium">Memuat status pengisian...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#1E3B8A] text-white font-semibold">
                  <th className="py-4 px-6">Nama Alumni</th>
                  <th className="py-4 px-6">NIM</th>
                  <th className="py-4 px-6">Status Pengisian</th>
                  <th className="py-4 px-6">Tanggal Pengisian</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-slate-800 font-bold">{item.namaAlumni}</td>
                    <td className="py-4 px-6 text-slate-500 font-medium">{item.nim}</td>
                    <td className="py-4 px-6">
                      {item.status === 'Sudah Mengisi' ? (
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
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {item.tanggalIsi || '-'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {item.status === 'Sudah Mengisi' ? (
                        <button
                          onClick={() => handleViewAnswers(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0E7490] hover:bg-[#0E7490]/90 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                        >
                          <Eye size={14} />
                          Lihat Detail
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Belum tersedia</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <BarChart3 className="mx-auto text-slate-300" size={32} />
            <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Alumni Ditemukan</h3>
            <p className="text-slate-500 text-xs">Belum ada alumni terdaftar, atau pencarian Anda tidak cocok.</p>
          </div>
        )}
      </div>

      {/* Modal Detail Jawaban */}
      {selectedAlumni && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#1E3B8A] text-white p-6 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Detail Jawaban Kuesioner Alumni</h2>
                <p className="text-white/80 text-xs mt-1">Mode Read-Only • Tidak ada fitur edit</p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              {loadingAnswers ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-3">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                  <p className="text-sm font-medium">Memuat rincian jawaban alumni...</p>
                </div>
              ) : modalError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
                  <AlertCircle className="flex-shrink-0 text-rose-600" size={20} />
                  <span>{modalError}</span>
                </div>
              ) : answersData ? (
                <>
                  {/* Alumni Info Summary */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <User size={20} />
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Nama & NIM</span>
                        <span className="font-bold text-slate-800 block">{answersData.namaAlumni} ({answersData.nim})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Program Studi</span>
                        <span className="font-bold text-slate-800 block">{answersData.prodi || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Questionnaire Answers List */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-sm tracking-tight">{answersData.judulKuesioner}</h3>
                      <span className="text-xs text-slate-500 font-medium">Disubmit: {answersData.tanggalIsi}</span>
                    </div>

                    <div className="space-y-3">
                      {answersData.answers?.map((q, qIdx) => (
                        <div key={q.questionId} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm space-y-2">
                          <p className="text-xs font-bold text-slate-700 leading-normal">
                            {qIdx + 1}. {q.questionText}
                          </p>
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-[#0E7490]">
                            {q.answerText}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex justify-end flex-shrink-0">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringJawaban;
