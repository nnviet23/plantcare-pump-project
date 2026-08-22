# Cấu trúc thư mục Backend

Backend được xây dựng bằng **Node.js** và **ExpressJS**, áp dụng kiến trúc MVC kết hợp với các dịch vụ truyền dữ liệu thời gian thực qua MQTT và WebSocket.

## Cây thư mục

```bash
backend/
├── src/
│   ├── config/
│   │   └── services.js             # Kết nối Azure Cosmos DB & MQTT Broker
│   ├── controllers/
│   │   ├── authController.js       # Xử lý Đăng ký / Đăng nhập
│   │   ├── farmController.js       # Xử lý Cảm biến, Máy bơm, Ngưỡng & Lịch sử
│   │   └── chatbotController.js    # Xử lý Chatbot Gemini AI
│   ├── middlewares/
│   │   └── authMiddleware.js       # Xác thực JWT Token & Xử lý lỗi
│   ├── models/
│   │   ├── User.js                 # Schema Người dùng
│   │   ├── SensorData.js           # Schema Chỉ số cảm biến
│   │   └── WateringLog.js          # Schema Lịch sử tưới & Cấu hình ngưỡng
│   ├── routes/
│   │   ├── authRoutes.js           # Route xác thực
│   │   ├── farmRoutes.js           # Route quản lý trạm SmartFarm
│   │   └── chatbotRoutes.js        # Route Chatbot
│   └── services/
│       ├── socketService.js        # Phát WebSockets Realtime xuống Web
│       ├── emailService.js         # Gửi Email cảnh báo (Nodemailer)
│       └── geminiService.js        # Gọi Google Gemini AI API
├── .env
├── package.json
└── server.js                       # Điểm khởi chạy duy nhất (Express + Socket.io)
```

## Chi tiết các tệp

### 1. Tệp cấu hình gốc

- `server.js`: Khởi tạo HTTP Server, tích hợp Socket.io, lắng nghe cổng `5000` và kết nối Azure Cosmos DB.
- `package.json`: Khai báo các thư viện Backend như Express, Mongoose, MQTT, Socket.io, Nodemailer, Gemini, JWT và Bcrypt.
- `.env`: Lưu các biến môi trường bảo mật như URI cơ sở dữ liệu, JWT Secret, MQTT Broker, mật khẩu ứng dụng Google và Gemini API Key.
- `.gitignore`: Loại bỏ `node_modules` và `.env` khỏi Git.
- `README.md`: Hướng dẫn cấu hình môi trường và chạy Backend Server.

### 2. Thư mục `src/`

- `app.js`: Khởi tạo ứng dụng Express, cấu hình CORS và JSON Parser, sau đó gắn các tuyến API `/api/...`.

### 3. Thư mục `src/config/`

- `db.js`: Thiết lập kết nối Node.js với Azure Cosmos DB thông qua Mongoose.
- `mqtt.js`: Khởi tạo MQTT Client để trao đổi tin nhắn với ESP32 qua HiveMQ hoặc EMQX.

### 4. Thư mục `src/models/`

- `User.js`: Mô hình người dùng gồm họ tên, email, tên đăng nhập và mật khẩu đã băm.
- `SensorData.js`: Lưu độ ẩm đất, nhiệt độ, độ ẩm không khí, ánh sáng, mực nước và thời gian đo.
- `WateringLog.js`: Lưu thời gian tưới, thời lượng, chế độ, độ ẩm trước tưới và nguyên nhân kích hoạt.
- `Settings.js`: Lưu các ngưỡng bật/tắt bơm, giới hạn nhiệt độ và thời gian tưới.

### 5. Thư mục `src/controllers/`

- `authController.js`: Xử lý đăng ký bằng Bcrypt và đăng nhập bằng JWT.
- `sensorController.js`: Lấy chỉ số mới nhất hoặc dữ liệu chuỗi thời gian để hiển thị biểu đồ.
- `pumpController.js`: Xử lý lệnh bật/tắt bơm thủ công và cập nhật ngưỡng tưới.
- `historyController.js`: Truy vấn nhật ký tưới theo ngày và tính toán thống kê.
- `chatbotController.js`: Nhận câu hỏi từ người dùng và trả lời thông qua Gemini AI.

### 6. Thư mục `src/middlewares/`

- `authMiddleware.js`: Xác thực JWT trước khi cho phép truy cập API cần bảo vệ.
- `errorMiddleware.js`: Chuẩn hóa và trả về phản hồi khi API phát sinh lỗi.

### 7. Thư mục `src/routes/`

Mỗi tệp route ánh xạ một nhóm endpoint đến controller tương ứng: xác thực, cảm biến, máy bơm, lịch sử và chatbot.

### 8. Thư mục `src/services/`

- `mqttService.js`: Gửi và nhận dữ liệu giữa Backend và ESP32.
- `socketService.js`: Phát sự kiện cập nhật cảm biến theo thời gian thực đến Frontend.
- `emailService.js`: Gửi email, chẳng hạn như thông báo hoặc xác nhận tài khoản.
- `geminiService.js`: Đóng gói việc gọi Gemini AI cho chức năng chatbot