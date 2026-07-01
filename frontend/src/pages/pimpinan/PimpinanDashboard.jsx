import React, { useEffect, useState } from 'react';
import { getAllPeriode } from '../../services/periodeService';
import { getPimpinanDashboard } from '../../services/dashboardService';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Users, Loader2, AlertCircle, ClipboardCheck,
  BarChart3, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';

const PimpinanDashboard = () => {
  const [stats, setStats] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAcademic, setShowAcademic] = useState(false);

  // Fetch periods on mount
  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const res = await getAllPeriode();
        setPeriods(res.data);
      } catch (err) {
        console.error('Gagal memuat daftar periode kuesioner', err);
      }
    };
    fetchPeriods();
  }, []);

  // Fetch stats when period changes
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await getPimpinanDashboard(selectedPeriod);
        setStats(response.data);
      } catch (err) {
        setError('Gagal memuat ringkasan dashboard pimpinan. Silakan muat ulang.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedPeriod]);

  if (loading && !stats) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium">Memuat ringkasan eksekutif...</p>
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

  // Predefined colors for charts (Menggunakan palet warna tema STMIK-MI)
  const CHART_COLORS = ['#1E40AF', '#2563EB', '#60A5FA', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Categorize questions into Main and Academic
  let mainQuestions = [];
  let academicQuestions = [];

  if (stats && stats.questionAnalytics) {
    mainQuestions = stats.questionAnalytics.filter(qa => {
      const text = qa.questionText.toLowerCase();
      return text.includes('aktivitas utama') ||
             text.includes('memperoleh pekerjaan pertama') ||
             text.includes('sesuai pekerjaan') ||
             text.includes('status pekerjaan');
    });
    academicQuestions = []; // Do not generate charts for the remaining questions.
  }

  const renderChartCard = (qa) => {
    const chartData = qa.answers.map(a => ({
      name: a.answer,
      value: a.total,
      percentage: a.percentage
    }));

    const isPie = qa.answers.length <= 5;

    return (
      <div key={qa.questionId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
        <div className="space-y-3">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight leading-snug min-h-[40px] flex items-center">{qa.questionText}</h3>
            <p className="text-slate-400 text-[11px] mt-0.5">Distribusi respon kuesioner</p>
          </div>

          {/* Insight Box */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-[11px] leading-relaxed">
            <div className="border-r border-slate-200 last:border-0 px-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Jawaban Terbanyak</span>
              <span className="text-slate-800 font-bold block mt-0.5 truncate" title={qa.mostSelectedAnswer}>{qa.mostSelectedAnswer}</span>
            </div>
            <div className="border-r border-slate-200 last:border-0 px-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Jumlah</span>
              <span className="text-slate-800 font-bold block mt-0.5">{qa.mostSelectedCount} Responden</span>
            </div>
            <div className="px-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Persentase</span>
              <span className="text-slate-800 font-bold block mt-0.5">{qa.mostSelectedPercentage}%</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center min-h-[200px] mt-4">
          {chartData.length > 0 ? (
            isPie ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value} Alumni (${props.payload.percentage}%)`, 'Jumlah']} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value, name, props) => [`${value} Alumni (${props.payload.percentage}%)`, 'Jumlah']} />
                  <Bar dataKey="value" fill="#1E40AF" radius={[4, 4, 0, 0]} maxBarSize={35}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          ) : (
            <p className="text-xs text-slate-400">Belum ada tanggapan untuk pertanyaan ini</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header with Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Ringkasan Eksekutif Tracer Study</h1>
          <p className="text-slate-500 text-sm mt-1">Laporan berkala hasil penyerapan lulusan dan kualitas kurikulum.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="period-filter" className="text-sm font-semibold text-slate-600 whitespace-nowrap">Filter Periode:</label>
          <select
            id="period-filter"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="">Semua Periode</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>{p.namaPeriode}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 w-fit animate-pulse">
          <Loader2 className="animate-spin" size={14} />
          Memperbarui laporan eksekutif...
        </div>
      )}

      {/* KPI Cards Grid (4 Cards) */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Alumni */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Users size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block truncate">Total Alumni</span>
              <span className="text-xl font-black text-slate-800 block truncate">{stats.totalAlumni}</span>
            </div>
          </div>

          {/* Total Responden */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ClipboardCheck size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block truncate">Total Responden</span>
              <span className="text-xl font-black text-slate-800 block truncate">{stats.totalResponden}</span>
            </div>
          </div>

          {/* Belum Mengisi */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center flex-shrink-0">
              <HelpCircle size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block truncate">Belum Mengisi</span>
              <span className="text-xl font-black text-slate-800 block truncate">{stats.belumMengisi}</span>
            </div>
          </div>

          {/* Response Rate */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <BarChart3 size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block truncate">Response Rate</span>
              <span className="text-xl font-black text-slate-800 block truncate">{stats.responseRate}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Analytics Charts (Desktop: 2 per row, Mobile: 1 per row) */}
      {stats && mainQuestions.length > 0 ? (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Analitik Utama</h2>
            <p className="text-slate-400 text-xs mt-0.5">Metrik utama tracer study penyerapan alumni di dunia kerja.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mainQuestions.map((qa) => renderChartCard(qa))}
          </div>
        </div>
      ) : (
        stats && !loading && (
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
            <p className="font-semibold text-sm">Tidak ada pertanyaan kuesioner utama aktif / terjawab pada periode yang dipilih.</p>
          </div>
        )
      )}

      {/* Academic Analytics Section (Collapsible) */}
      {stats && academicQuestions.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Analitik Akademik</h2>
              <p className="text-slate-400 text-xs mt-0.5">Grafik evaluasi kualitas dosen dan kurikulum perkuliahan.</p>
            </div>
            <button
              onClick={() => setShowAcademic(!showAcademic)}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <span>{showAcademic ? 'Sembunyikan Analitik Akademik' : 'Lihat Analitik Akademik'}</span>
              {showAcademic ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {showAcademic && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-500 ease-in-out">
              {academicQuestions.map((qa) => renderChartCard(qa))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PimpinanDashboard;
