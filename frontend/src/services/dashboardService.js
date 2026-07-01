import api from '../api/axios';

export const getDashboard = (periodeId) => {
  const url = periodeId ? `/api/admin/dashboard?periodeId=${periodeId}` : '/api/admin/dashboard';
  return api.get(url);
};

export const getPimpinanDashboard = (periodeId) => {
  const url = periodeId ? `/api/pimpinan/dashboard?periodeId=${periodeId}` : '/api/pimpinan/dashboard';
  return api.get(url);
};
