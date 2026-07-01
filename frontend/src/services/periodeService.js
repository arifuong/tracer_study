import api from '../api/axios';

export const getAllPeriode = () => {
  return api.get('/api/admin/periode');
};

export const createPeriode = (payload) => {
  return api.post('/api/admin/periode', payload);
};

export const updatePeriode = (id, payload) => {
  return api.put(`/api/admin/periode/${id}`, payload);
};

export const deletePeriode = (id) => {
  return api.delete(`/api/admin/periode/${id}`);
};
