import axios from 'axios';
import { io } from 'socket.io-client';
const configured = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
export const API_URL = configured.endsWith('/api') ? configured : `${configured}/api`;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL.replace(/\/api$/, '');
const api = axios.create({ baseURL: API_URL, timeout: 20000, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response=>response,error=>{
  if ([401,403].includes(error.response?.status) && !error.config?.url?.startsWith('/auth/')) {
    window.dispatchEvent(new Event('auth-expired'));
  }
  return Promise.reject(error);
});
export const socket = io(SOCKET_URL, { autoConnect: false, auth: callback => callback({ token: localStorage.getItem('token') }) });
export default api;
