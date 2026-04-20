import axios from 'axios';

// Local dev: http://localhost:3001/api
// Production: set VITE_API_URL in Vercel frontend env vars
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});


// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401s globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

export const reviewCode = (code, language, userId) =>
  api.post('/review-code', { code, language, userId });

// Demo mode: ESLint + AST only — zero API quota used
export const reviewCodeDemo = (code, language) =>
  api.post('/review-code?demo=true', { code, language });


export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (username, email, password) =>
  api.post('/auth/register', { username, email, password });

export const getMe = () => api.get('/auth/me');

export const getHistory = () => api.get('/history');

export const getReview = (id) => api.get(`/history/${id}`);

export const getLeaderboard = () => api.get('/history/leaderboard/top');

export default api;
