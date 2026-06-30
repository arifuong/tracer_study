import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { 
  FileSpreadsheet, FileText, Calendar, Check, AlertCircle, Loader2 
} from 'lucide-react';

const ReportViewer = () => {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [reportName, setReportName] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPeriods = async () => {
    try {
      const periodRes = await api.get('/api/admin/periode');
      setPeriods(periodRes.data);
      if (periodRes.data.length > 0) {
        setSelectedPeriodId(periodRes.data[0].id.toString());
        setReportName(`Laporan Tracer Study ${periodRes.data[0].namaPeriode}`);
      }
    } catch (err) {
      setError('Gagal memuat data periode.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handlePeriodChange = (e) => {
    const periodId = e.target.value;
    setSelectedPeriodId(periodId);
    const p = periods.find(item => item.id.toString() === periodId);
    if (p) {
      setReportName(`Laporan Tracer Study ${p.namaPeriode}`);
    }
  };

  const handleExport = async (format) => {
    if (!selectedPeriodId) {
      setError('Harap pilih periode terlebih dahulu.');
      return;
    }
    setError('');
    setSuccess('');
    setExporting(true);

    try {
      const endpoint = format === 'pdf' ? '/api/laporan/export/pdf' : '/api/laporan/export/excel';
      const fileExt = format === 'pdf' ? 'pdf' : 'xlsx';
      
      const response = await api.post(endpoint, {
        periodeId: parseInt(selectedPeriodId),
        namaLaporan: reportName || 'Laporan Tracer Study'
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const cleanName = (reportName || 'Laporan_Tracer_Study').trim().replace(/ /g, '_');
      link.setAttribute('download', `${cleanName}.${fileExt}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(`Dokumen ${format.toUpperCase()} berhasil di-generate dan diunduh.`);
    } catch (err) {
      setError('Gagal mengekspor laporan. Silakan coba kembali.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium">Memuat konfigurasi laporan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Unduh Laporan Tracer Study</h1>
        <p className="text-slate-500 text-sm mt-1">Generate dokumen penelusuran karir lulusan dalam format PDF atau Excel.</p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
          <Check className="flex-shrink-0 text-emerald-600" size={20} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="flex-shrink-0 text-rose-600" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Export Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base mb-6 border-b border-slate-100 pb-2">Generate Laporan</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">Pilih Periode Kuesioner</label>
            <select
              value={selectedPeriodId}
              onChange={handlePeriodChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-sm transition-colors"
            >
              <option value="" disabled>Pilih Periode</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>{p.namaPeriode}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">Nama Laporan</label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-sm transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-slate-100 justify-end">
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting || periods.length === 0}
            className={`px-5 py-3 border rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              exporting || periods.length === 0
                ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50'
            }`}
          >
            {exporting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <FileSpreadsheet size={16} />
            )}
            Download Excel
          </button>
          
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting || periods.length === 0}
            className={`px-5 py-3 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${
              exporting || periods.length === 0
                ? 'bg-slate-300 shadow-none cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            {exporting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <FileText size={16} />
            )}
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;
