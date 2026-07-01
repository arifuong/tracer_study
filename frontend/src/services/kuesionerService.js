import api from '../api/axios';

// Admin operations
export const getAllKuesioner = () => {
  return api.get('/api/admin/kuesioner');
};

export const getKuesioner = (id) => {
  return api.get(`/api/admin/kuesioner/${id}`);
};

export const createKuesioner = (payload) => {
  return api.post('/api/admin/kuesioner', payload);
};

export const updateKuesioner = (id, payload) => {
  return api.put(`/api/admin/kuesioner/${id}`, payload);
};

export const deleteKuesioner = (id) => {
  return api.delete(`/api/admin/kuesioner/${id}`);
};

// Alumni operations
export const getActiveKuesioner = () => {
  return api.get('/api/alumni/kuesioner/active');
};

export const getSubmissionStatus = () => {
  return api.get('/api/alumni/pengisian/status');
};

export const submitAnswers = (kuesionerId, payload) => {
  return api.post(`/api/alumni/kuesioner/${kuesionerId}/isi`, payload);
};
