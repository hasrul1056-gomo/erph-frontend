import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Attach JWT token pada setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('erph_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — token tamat / tidak sah
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('erph_token');
      localStorage.removeItem('erph_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
