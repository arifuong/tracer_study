import api from '../api/axios';

// Admin operations
export const getAllAlumni = () => {
  return api.get('/api/admin/alumni');
};

export const createAlumni = (payload) => {
  return api.post('/api/admin/alumni', payload);
};

export const updateAlumni = (id, payload) => {
  return api.put(`/api/admin/alumni/${id}`, payload);
};

export const deleteAlumni = (id) => {
  return api.delete(`/api/admin/alumni/${id}`);
};

// Alumni operations
export const getAlumniProfile = () => {
  return api.get('/api/alumni/profile');
};

export const updateAlumniProfile = (payload) => {
  return api.put('/api/alumni/profile', payload);
};
