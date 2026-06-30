import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Layers, Plus, Edit2, Trash2, HelpCircle, X, Check, AlertCircle, Loader2 } from 'lucide-react';

const KuesionerCrud = () => {
  const [kuesioners, setKuesioners] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [currentId, setCurrentId] = useState(null); // null if adding

  const [periodeId, setPeriodeId] = useState('');
  const [judulKuesioner, setJudulKuesioner] = useState('');
  const [deskripsi, setDeskripsi] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchKuesionersAndPeriods = async () => {
    try {
      const [kuesionerRes, periodRes] = await Promise.all([
        api.get('/api/admin/kuesioner'),
        api.get('/api/admin/periode')
      ]);
      setKuesioners(kuesionerRes.data);
      setPeriods(periodRes.data);
      if (periodRes.data.length > 0) {
        setPeriodeId(periodRes.data[0].id.toString());
      }
    } catch (err) {
      setError('Gagal memuat data kuesioner. Silakan muat ulang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKuesionersAndPeriods();
  }, []);

  const openAddModal = () => {
    setCurrentId(null);
    if (periods.length > 0) {
      setPeriodeId(periods[0].id.toString());
    } else {
      setPeriodeId('');
    }
    setJudulKuesioner('');
    setDeskripsi('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (kuesioner) => {
    setCurrentId(kuesioner.id);
    setPeriodeId(kuesioner.periodeId ? kuesioner.periodeId.toString() : '');
    setJudulKuesioner(kuesioner.judulKuesioner || '');
    setDeskripsi(kuesioner.deskripsi || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!periodeId) {
      setFormError('Harap pilih periode kuesioner terlebih dahulu.');
      return;
    }

    setSaving(true);

    const payload = {
      periodeId: parseInt(periodeId),
      judulKuesioner,
      deskripsi
    };

    try {
      if (currentId) {
        await api.put(`/api/admin/kuesioner/${currentId}`, payload);
      } else {
        await api.post('/api/admin/kuesioner', payload);
      }
      setIsModalOpen(false);
      fetchKuesionersAndPeriods();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Gagal menyimpan kuesioner.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/kuesioner/${id}`);
      setConfirmDeleteId(null);
      fetchKuesionersAndPeriods();
    } catch (err) {
      setError('Gagal menghapus kuesioner.');
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium">Memuat data kuesioner...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Kelola Kuesioner</h1>
          <p className="text-slate-500 text-sm mt-1">Buat instrumen pertanyaan kuesioner tracer study per periode.</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={periods.length === 0}
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-white rounded-xl text-sm font-medium transition-colors shadow-lg ${
            periods.length === 0 
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
          }`}
        >
          <Plus size={18} />
          Buat Kuesioner Baru
        </button>
      </div>

      {periods.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 text-sm">
          <AlertCircle className="flex-shrink-0 text-amber-600" size={20} />
          <span>Anda harus membuat <strong>Periode Kuesioner</strong> terlebih dahulu sebelum membuat kuesioner.</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="flex-shrink-0 text-rose-600" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Kuesioner List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kuesioners.length > 0 ? (
          kuesioners.map((kuesioner) => (
            <div key={kuesioner.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
              {/* Accent top border */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500" />

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md border border-slate-200/50">
                    {kuesioner.periodeNama}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <HelpCircle size={14} className="text-slate-400" />
                    {kuesioner.pertanyaan?.length || 0} Pertanyaan
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-base">{kuesioner.judulKuesioner}</h3>
                  {kuesioner.deskripsi && (
                    <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-3">{kuesioner.deskripsi}</p>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/admin/kuesioner/${kuesioner.id}/questions`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Kelola Pertanyaan &rarr;
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(kuesioner)}
                    className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Ubah Kuesioner"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(kuesioner.id)}
                    className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Kuesioner"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3 shadow-sm">
            <Layers className="mx-auto text-slate-300" size={32} />
            <h3 className="font-bold text-slate-800 text-sm">Belum Ada Kuesioner</h3>
            <p className="text-slate-500 text-xs font-medium">Buat kuesioner tracer study pertama Anda.</p>
          </div>
        )}
      </div>

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-base">
                {currentId ? 'Edit Kuesioner' : 'Buat Kuesioner Baru'}
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
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Periode Pelaksanaan</label>
                <select
                  value={periodeId}
                  onChange={(e) => setPeriodeId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="" disabled>Pilih Periode</option>
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>{p.namaPeriode}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Judul Kuesioner</label>
                <input
                  type="text"
                  value={judulKuesioner}
                  onChange={(e) => setJudulKuesioner(e.target.value)}
                  required
                  placeholder="Contoh: Kuesioner Tracer Study Lulusan 2025"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Deskripsi / Tujuan</label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  rows={4}
                  placeholder="Deskripsikan tujuan pelaksanaan survei kuesioner ini..."
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
                      Simpan Kuesioner
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
              <h3 className="font-bold text-slate-800 text-base">Hapus Kuesioner?</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Tindakan ini akan menghapus kuesioner ini beserta seluruh daftar pertanyaan dan data pengisian alumni di dalamnya secara permanen.
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

export default KuesionerCrud;
