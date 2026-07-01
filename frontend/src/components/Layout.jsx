import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { getAlumniProfile } from '../services/alumniService';
import { 
  User, FileText, LayoutDashboard, Users, Calendar, 
  Layers, BarChart3, LogOut, Menu, X, ClipboardCheck, FileSpreadsheet, Lock
} from 'lucide-react';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username') || 'User';
  const role = localStorage.getItem('role') || '';

  // Memeriksa kelengkapan profil jika pengguna login sebagai alumni
  // Indonesian comment: Memastikan pengguna mengisi semua data profil wajib dan mengubah password default sebelum mengakses kuesioner.
  useEffect(() => {
    if (role === 'ALUMNI') {
      getAlumniProfile()
        .then(res => {
          const data = res.data;
          const complete = data.profileComplete;
          setProfileComplete(!!complete);
        })
        .catch(err => {
          console.error("Gagal memuat status profil untuk validasi", err);
        });
    }
  }, [role, location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Define sidebar navigation items based on role
  const getNavLinks = () => {
    if (role === 'ALUMNI') {
      return [
        { to: '/alumni/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { to: '/alumni/profile', label: 'Profil Saya', icon: <User size={20} /> },
        { 
          to: profileComplete ? '/alumni/kuesioner' : '#', 
          label: 'Isi Kuesioner', 
          icon: profileComplete ? <ClipboardCheck size={20} /> : <Lock size={20} />,
          locked: !profileComplete
        },
      ];
    } else if (role === 'ADMIN') {
      return [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { to: '/admin/alumni', label: 'Kelola Alumni', icon: <Users size={20} /> },
        { to: '/admin/periode', label: 'Kelola Periode', icon: <Calendar size={20} /> },
        { to: '/admin/kuesioner', label: 'Kelola Kuesioner', icon: <Layers size={20} /> },
        { to: '/admin/monitoring', label: 'Monitoring Jawaban', icon: <BarChart3 size={20} /> },
        { to: '/admin/reports', label: 'Cetak Laporan', icon: <FileSpreadsheet size={20} /> },
      ];
    } else if (role === 'PIMPINAN') {
      return [
        { to: '/pimpinan/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { to: '/pimpinan/monitoring', label: 'Monitoring Jawaban', icon: <BarChart3 size={20} /> },
        { to: '/pimpinan/reports', label: 'Laporan', icon: <FileText size={20} /> },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <div className="h-screen bg-[#F8FAFC] flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component (Deep Navy background #1E3B8A) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1E3B8A] text-slate-100 border-r border-[#1E3B8A] flex flex-col transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
          <div className="flex flex-col">
    <span className="text-sm font-bold text-white">
        Tracer Study Alumni
    </span>

    <span className="text-[11px] text-blue-200">
        STMIK MARDIRA INDONESIA
    </span>
</div>
          <button 
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            if (link.locked) {
              return (
                <div
                  key={link.label}
                  title="Lengkapi profil terlebih dahulu"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#CBD5E1]/60 bg-white/5 cursor-not-allowed border border-dashed border-white/10"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </div>
              );
            }
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300
                  ${isActive 
                    ? 'bg-[#0E7490] text-white shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px,_rgba(0,0,0,0.1)_0px_1px_2px_-1px]' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1'}
                `}
              >
                {link.icon}
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-200 hover:bg-rose-900/20 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center px-6 sticky top-0 z-30 gap-4 flex-shrink-0">
          <button 
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3 text-[#020817]">
            <span className="text-lg font-semibold text-[#020817]">
    Tracer Study Alumni
</span>
            <span className="hidden lg:inline text-[#E2E8F0]">|</span>
           <span className="text-sm text-slate-500">
    STMIK MARDIRA INDONESIA
</span>
          </div>
        </header>

        {/* Main Content Wrapper */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
