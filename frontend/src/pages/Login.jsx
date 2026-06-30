import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { token, role, username: resUser } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', resUser);

      // Membaca status profil untuk alumni saat masuk sistem
      // Mengalihkan pengguna ke dashboard yang sesuai setelah login sukses.
      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'ALUMNI') {
        navigate('/alumni/dashboard');
      } else if (role === 'PIMPINAN') {
        navigate('/pimpinan/dashboard');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal masuk ke sistem. Silakan periksa koneksi Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Login Card (Auth Card: White, padding 40px 32px, border-radius 8px, 1px solid #E2E8F0, box-shadow) */}
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-lg p-[40px_32px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] relative z-10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-all duration-300">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-[#020817] tracking-tight uppercase">Tracer Study</h2>
          <span className="text-[10px] uppercase font-semibold tracking-widest text-[#1E3B8A] block mt-1">STMIK MARDIRA INDONESIA</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-[#FF2D20] text-sm">
            <AlertCircle className="flex-shrink-0 mt-0.5 text-[#FF2D20]" size={18} />
            <div className="font-medium">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="flex flex-col">
            <label className="block text-[#020817] text-xs font-semibold uppercase tracking-wider mb-1">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-[#757575]">
                <User size={18} />
              </span>
              {/* Rounded bordered input: border #E2E8F0, focus #3498DB, height 40px */}
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Masukkan NIM atau username"
                className="w-full pl-8 pr-3 bg-white border border-[#E2E8F0] rounded-[6px] text-[#020817] placeholder-[#64748B] focus:outline-none focus:border-[#3498DB] transition-all text-sm h-[40px]"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block text-[#020817] text-xs font-semibold uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-[#757575]">
                <Lock size={18} />
              </span>
              {/* Rounded bordered input: border #E2E8F0, focus #3498DB, height 40px */}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Masukkan sandi Anda"
                className="w-full pl-8 pr-3 bg-white border border-[#E2E8F0] rounded-[6px] text-[#020817] placeholder-[#64748B] focus:outline-none focus:border-[#3498DB] transition-all text-sm h-[40px]"
              />
            </div>
          </div>

          {/* Primary Button: #1E3B8A background, #F8FAFC text, 6px border-radius, hover #1E40AF */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 bg-[#1E3B8A] hover:bg-[#1E40AF] active:scale-[0.98] text-[#F8FAFC] font-semibold rounded-[6px] text-sm transition-all shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px,_rgba(0,0,0,0.1)_0px_1px_2px_-1px] flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Memproses masuk...
              </>
            ) : (
              'Masuk Sistem'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
