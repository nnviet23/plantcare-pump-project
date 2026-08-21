import apiClient from './apiClient';

export const pumpService = {
  // Gửi lệnh bật/tắt máy bơm
  togglePump: async (status) => {
    const response = await apiClient.post('/pump/control', { status }); // 'ON' hoặc 'OFF'
    return response.data;
  },

  // Cập nhật chế độ tưới
  updateMode: async (mode) => {
    const response = await apiClient.post('/pump/mode', { mode }); // 'AUTO' hoặc 'MANUAL'
    return response.data;
  }
};