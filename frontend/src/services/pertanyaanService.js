import api from '../api/axios';

export const getPertanyaan = (kuesionerId) => {
  return api.get(`/api/admin/kuesioner/${kuesionerId}/pertanyaan`);
};

export const createPertanyaan = (kuesionerId, payload) => {
  return api.post(`/api/admin/kuesioner/${kuesionerId}/pertanyaan`, payload);
};

export const updatePertanyaan = (id, payload) => {
  return api.put(`/api/admin/pertanyaan/${id}`, payload);
};

export const deletePertanyaan = (id) => {
  return api.delete(`/api/admin/pertanyaan/${id}`);
};
