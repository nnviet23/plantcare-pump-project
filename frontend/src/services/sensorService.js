import apiClient from './apiClient';

export const sensorService = {
  // Lấy chỉ số mới nhất (nhiệt độ, độ ẩm đất, mực nước)
  getCurrentData: async () => {
    const response = await apiClient.get('/sensors/latest');
    return response.data;
  },

  // Lấy lịch sử 24h để vẽ biểu đồ AreaChart
  getHistoryData: async (range = '24h') => {
    const response = await apiClient.get(`/sensors/history?range=${range}`);
    return response.data;
  }
};