import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Layout & Guard Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import Login from './pages/Login';

// Alumni Pages
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AlumniProfile from './pages/alumni/AlumniProfile';
import ActiveQuestionnaire from './pages/alumni/ActiveQuestionnaire';
import FillQuestionnaire from './pages/alumni/FillQuestionnaire';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AlumniCrud from './pages/admin/AlumniCrud';
import PeriodeCrud from './pages/admin/PeriodeCrud';
import KuesionerCrud from './pages/admin/KuesionerCrud';
import PertanyaanCrud from './pages/admin/PertanyaanCrud';
import MonitoringJawaban from './pages/admin/MonitoringJawaban';
import ReportExport from './pages/admin/ReportExport';

// Pimpinan Pages
import PimpinanDashboard from './pages/pimpinan/PimpinanDashboard';
import ReportViewer from './pages/pimpinan/ReportViewer';

// Root redirect handler
const RootRedirect = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'ALUMNI') return <Navigate to="/alumni/dashboard" replace />;
  if (role === 'PIMPINAN') return <Navigate to="/pimpinan/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Alumni Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ALUMNI']} />}>
          <Route path="/alumni/dashboard" element={<Layout><AlumniDashboard /></Layout>} />
          <Route path="/alumni/profile" element={<Layout><AlumniProfile /></Layout>} />
          <Route path="/alumni/kuesioner" element={<Layout><ActiveQuestionnaire /></Layout>} />
          <Route path="/alumni/kuesioner/fill/:id" element={<Layout><FillQuestionnaire /></Layout>} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<Layout><AdminDashboard /></Layout>} />
          <Route path="/admin/alumni" element={<Layout><AlumniCrud /></Layout>} />
          <Route path="/admin/periode" element={<Layout><PeriodeCrud /></Layout>} />
          <Route path="/admin/kuesioner" element={<Layout><KuesionerCrud /></Layout>} />
          <Route path="/admin/kuesioner/:kuesionerId/questions" element={<Layout><PertanyaanCrud /></Layout>} />
          <Route path="/admin/monitoring" element={<Layout><MonitoringJawaban /></Layout>} />
          <Route path="/admin/reports" element={<Layout><ReportExport /></Layout>} />
        </Route>

        {/* Protected Pimpinan Routes */}
        <Route element={<ProtectedRoute allowedRoles={['PIMPINAN']} />}>
          <Route path="/pimpinan/dashboard" element={<Layout><PimpinanDashboard /></Layout>} />
          <Route path="/pimpinan/monitoring" element={<Layout><MonitoringJawaban /></Layout>} />
          <Route path="/pimpinan/reports" element={<Layout><ReportViewer /></Layout>} />
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
