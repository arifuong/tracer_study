import api from '../api/axios';

export const login = (username, password) => {
  return api.post('/api/auth/login', { username, password });
};

export const logout = () => {
  return api.post('/api/auth/logout');
};
