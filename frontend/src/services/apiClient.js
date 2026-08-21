import axios from 'axios';

const apiClient = axios.create({
  // Khi deploy lên Azure sẽ đổi thành URL thật
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;