import api from '../api/axios';

export const getMonitoringJawaban = (periodId) => {
  return api.get(`/api/admin/monitoring/${periodId}`);
};

export const getMonitoringJawabanDetail = (periodId, alumniId) => {
  return api.get(`/api/admin/monitoring/${periodId}/alumni/${alumniId}`);
};
