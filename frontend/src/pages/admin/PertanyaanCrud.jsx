import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getKuesioner } from '../../services/kuesionerService';
import { getPertanyaan, createPertanyaan, updatePertanyaan, deletePertanyaan } from '../../services/pertanyaanService';
import { 
  ArrowLeft, HelpCircle, Plus, Edit2, Trash2, X, 
  Check, AlertCircle, Loader2, ListOrdered 
} from 'lucide-react';

const PertanyaanCrud = () => {
  const { kuesionerId } = useParams();
  
  const [kuesioner, setKuesioner] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [currentId, setCurrentId] = useState(null); // null if adding

  const [teksPertanyaan, setTeksPertanyaan] = useState('');
  const [tipePertanyaan, setTipePertanyaan] = useState('TEXT');
  const [pilihanRaw, setPilihanRaw] = useState(''); // Comma-separated choice values
  const [orderIndex, setOrderIndex] = useState('0');

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchKuesionerAndQuestions = async () => {
    try {
      const [kuesionerRes, questionsRes] = await Promise.all([
        getKuesioner(kuesionerId),
        getPertanyaan(kuesionerId)
      ]);
      setKuesioner(kuesionerRes.data);
      setQuestions(questionsRes.data);
    } catch (err) {
      setError('Gagal memuat pertanyaan kuesioner. Silakan kembali.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKuesionerAndQuestions();
  }, [kuesionerId]);

  const openAddModal = () => {
    setCurrentId(null);
    setTeksPertanyaan('');
    setTipePertanyaan('TEXT');
    setPilihanRaw('');
    // Auto increment order index based on current questions length
    setOrderIndex(questions.length.toString());
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (q) => {
    setCurrentId(q.id);
    setTeksPertanyaan(q.teksPertanyaan || '');
    setTipePertanyaan(q.tipePertanyaan || 'TEXT');
    
    // Parse JSON array to comma-separated text for input
    let raw = '';
    if (q.pilihan) {
      try {
        const arr = JSON.parse(q.pilihan);
        raw = arr.join(', ');
      } catch (e) {
        raw = q.pilihan;
      }
    }
    setPilihanRaw(raw);
    setOrderIndex((q.orderIndex !== undefined ? q.orderIndex : 0).toString());
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    let pilihanJson = null;
    if (tipePertanyaan === 'CHOICE') {
      if (!pilihanRaw || pilihanRaw.trim() === '') {
        setFormError('Pilihan ganda tidak boleh kosong untuk tipe CHOICE.');
        return;
      }
      // Split by comma, trim whitespace, and stringify to JSON array
      const arr = pilihanRaw.split(',').map(s => s.trim()).filter(s => s !== '');
      pilihanJson = JSON.stringify(arr);
    }

    setSaving(true);

    const payload = {
      teksPertanyaan,
      tipePertanyaan,
      pilihan: pilihanJson,
      orderIndex: parseInt(orderIndex) || 0
    };

    try {
      if (currentId) {
        await updatePertanyaan(currentId, payload);
      } else {
        await createPertanyaan(kuesionerId, payload);
      }
      setIsModalOpen(false);
      fetchKuesionerAndQuestions();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Gagal menyimpan pertanyaan.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePertanyaan(id);
      setConfirmDeleteId(null);
      fetchKuesionerAndQuestions();
    } catch (err) {
      setError('Gagal menghapus pertanyaan.');
    }
  };

  const renderChoices = (choicesStr) => {
    try {
      const arr = JSON.parse(choicesStr);
      return (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {arr.map((choice, i) => (
            <span key={i} className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-md text-[10px] font-semibold">
              {choice}
            </span>
          ))}
        </div>
      );
    } catch (e) {
      return <span className="text-slate-400 text-xs">{choicesStr}</span>;
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium">Memuat daftar pertanyaan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/admin/kuesioner" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
        <ArrowLeft size={16} />
        Kembali ke Kelola Kuesioner
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Pertanyaan Kuesioner
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kuesioner: <strong className="text-slate-700">{kuesioner?.judulKuesioner}</strong> | Periode: <strong className="text-slate-700">{kuesioner?.periodeNama}</strong>
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          Tambah Pertanyaan
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="flex-shrink-0 text-rose-600" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Questions List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {questions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-6 md:p-8 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-xs font-extrabold">
                      {idx + 1}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                      q.tipePertanyaan === 'CHOICE' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {q.tipePertanyaan}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <ListOrdered size={12} />
                      Order: {q.orderIndex}
                    </span>
                  </div>

                  <p className="text-slate-800 font-semibold text-sm pl-8 leading-relaxed">
                    {q.teksPertanyaan}
                  </p>

                  {q.tipePertanyaan === 'CHOICE' && q.pilihan && (
                    <div className="pl-8">
                      {renderChoices(q.pilihan)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pl-8 sm:pl-0">
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Ubah Pertanyaan"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(q.id)}
                    className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Pertanyaan"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 space-y-3 bg-slate-50/50">
            <HelpCircle className="mx-auto text-slate-300" size={32} />
            <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Pertanyaan</h3>
            <p className="text-slate-500 text-xs">Kuesioner ini belum memiliki pertanyaan. Silakan tambahkan pertanyaan baru.</p>
          </div>
        )}
      </div>

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-base">
                {currentId ? 'Edit Pertanyaan' : 'Tambah Pertanyaan Baru'}
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
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Teks Pertanyaan</label>
                <textarea
                  value={teksPertanyaan}
                  onChange={(e) => setTeksPertanyaan(e.target.value)}
                  required
                  rows={3}
                  placeholder="Tuliskan pertanyaan kuesioner..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1.5">Tipe Jawaban</label>
                  <select
                    value={tipePertanyaan}
                    onChange={(e) => setTipePertanyaan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="TEXT">TEXT (Isian Singkat / Deskripsi)</option>
                    <option value="CHOICE">CHOICE (Pilihan Ganda)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1.5">Urutan Tampilan</label>
                  <input
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(e.target.value)}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {tipePertanyaan === 'CHOICE' && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-2">
                  <label className="block text-slate-700 text-xs font-semibold">Pilihan Ganda (Pisahkan dengan Koma)</label>
                  <input
                    type="text"
                    value={pilihanRaw}
                    onChange={(e) => setPilihanRaw(e.target.value)}
                    required={tipePertanyaan === 'CHOICE'}
                    placeholder="Contoh: Sangat Sesuai, Sesuai, Tidak Sesuai"
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 block leading-relaxed">
                    Tuliskan pilihan jawaban dipisahkan dengan tanda koma.
                  </span>
                </div>
              )}

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
                      Simpan Pertanyaan
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
              <h3 className="font-bold text-slate-800 text-base">Hapus Pertanyaan?</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Tindakan ini akan menghapus pertanyaan kuesioner ini beserta seluruh data jawaban alumni terkait secara permanen.
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

export default PertanyaanCrud;
