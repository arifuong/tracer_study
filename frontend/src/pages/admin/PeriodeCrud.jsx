import React, { useEffect, useState } from 'react';
import { getAllPeriode, createPeriode, updatePeriode, deletePeriode } from '../../services/periodeService';
import { Calendar, Plus, Edit2, Trash2, X, Check, AlertCircle, Loader2 } from 'lucide-react';

const PeriodeCrud = () => {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [currentId, setCurrentId] = useState(null); // null if adding

  const [namaPeriode, setNamaPeriode] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchPeriods = async () => {
    try {
      const response = await getAllPeriode();
      setPeriods(response.data);
    } catch (err) {
      setError('Gagal memuat periode kuesioner. Silakan muat ulang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const openAddModal = () => {
    setCurrentId(null);
    setNamaPeriode('');
    setTanggalMulai('');
    setTanggalSelesai('');
    setKeterangan('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (period) => {
    setCurrentId(period.id);
    setNamaPeriode(period.namaPeriode || '');
    setTanggalMulai(period.tanggalMulai || '');
    setTanggalSelesai(period.tanggalSelesai || '');
    setKeterangan(period.keterangan || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client-side validation: tanggalSelesai >= tanggalMulai
    if (new Date(tanggalSelesai) < new Date(tanggalMulai)) {
      setFormError('Tanggal selesai tidak boleh kurang dari tanggal mulai.');
      return;
    }

    setSaving(true);

    const payload = {
      namaPeriode,
      tanggalMulai,
      tanggalSelesai,
      keterangan
    };

    try {
      if (currentId) {
        await updatePeriode(currentId, payload);
      } else {
        await createPeriode(payload);
      }
      setIsModalOpen(false);
      fetchPeriods();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Gagal menyimpan periode kuesioner.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePeriode(id);
      setConfirmDeleteId(null);
      fetchPeriods();
    } catch (err) {
      setError('Gagal menghapus periode.');
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium">Memuat periode kuesioner...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Kelola Periode Kuesioner</h1>
          <p className="text-slate-500 text-sm mt-1">Konfigurasi rentang aktif pelaksanaan tracer study bagi responden alumni.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          Buat Periode Baru
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="flex-shrink-0 text-rose-600" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Periods */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {periods.length > 0 ? (
          periods.map((period) => {
            const today = new Date().setHours(0, 0, 0, 0);
            const start = new Date(period.tanggalMulai).setHours(0, 0, 0, 0);
            const end = new Date(period.tanggalSelesai).setHours(0, 0, 0, 0);
            const isActive = today >= start && today <= end;

            return (
              <div key={period.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                {/* Active Indicator */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' 
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {isActive ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{period.namaPeriode}</h3>
                    {period.keterangan && (
                      <p className="text-slate-500 text-xs mt-1.5 leading-relaxed truncate">{period.keterangan}</p>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-100/50 rounded-xl p-3 text-xs space-y-1.5 text-slate-600 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tanggal Mulai:</span>
                      <span>{period.tanggalMulai}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tanggal Selesai:</span>
                      <span>{period.tanggalSelesai}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(period)}
                    className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Ubah Periode"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(period.id)}
                    className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Periode"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3 shadow-sm">
            <Calendar className="mx-auto text-slate-300" size={32} />
            <h3 className="font-bold text-slate-800 text-sm">Belum Ada Periode</h3>
            <p className="text-slate-500 text-xs">Silakan tambahkan periode tracer study pertama Anda.</p>
          </div>
        )}
      </div>

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-base">
                {currentId ? 'Edit Periode Kuesioner' : 'Buat Periode Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {formError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs">
                  <AlertCircle className="flex-shrink-0" size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Nama Periode</label>
                <input
                  type="text"
                  value={namaPeriode}
                  onChange={(e) => setNamaPeriode(e.target.value)}
                  required
                  placeholder="Contoh: Tracer Study 2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Tanggal Mulai</label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Tanggal Selesai</label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Keterangan / Deskripsi</label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  rows={3}
                  placeholder="Catatan tambahan tentang pelaksanaan tracer study..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Simpan Periode
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
              <h3 className="font-bold text-slate-800 text-base">Hapus Periode?</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Tindakan ini akan menghapus periode ini beserta seluruh kuesioner, pertanyaan, dan data pengisian alumni di dalamnya.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
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

export default PeriodeCrud;
