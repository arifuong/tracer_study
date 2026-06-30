import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect role-specific defaults to prevent dead-ends
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'ALUMNI') return <Navigate to="/alumni/dashboard" replace />;
    if (role === 'PIMPINAN') return <Navigate to="/pimpinan/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
