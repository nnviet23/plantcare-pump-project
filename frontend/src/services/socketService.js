import { io } from 'socket.io-client';

// Lấy URL của Backend Node.js
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  socket = null;

  // 1. Khởi tạo kết nối tới Socket Server ở Backend
  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'], // Ép sử dụng WebSocket trực tiếp cho tốc độ cao nhất
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('🟢 Đã kết nối Real-time Socket! ID:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔴 Đã ngắt kết nối Socket:', reason);
      });
    }
  }

  // 2. Lắng nghe dữ liệu cảm biến thời gian thực (Nhiệt độ, Độ ẩm đất, Mực nước)
  onSensorUpdate(callback) {
    if (this.socket) {
      this.socket.on('sensor:update', (data) => {
        callback(data);
      });
    }
  }

  // 3. Lắng nghe sự thay đổi trạng thái máy bơm (Bật/Tắt)
  onPumpStatusChange(callback) {
    if (this.socket) {
      this.socket.on('pump:status', (data) => {
        callback(data);
      });
    }
  }

  // 4. Hủy lắng nghe sự kiện khi thoát trang (Tránh rò rỉ bộ nhớ / Memory Leak)
  offEvent(eventName) {
    if (this.socket) {
      this.socket.off(eventName);
    }
  }

  // 5. Ngắt hoàn toàn kết nối
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const socketService = new SocketService();
export default socketService;