# Cấu trúc thư mục Frontend

Frontend được xây dựng bằng **ReactJS** với **Vite**, tổ chức theo kiến trúc hướng tính năng (Feature-based Architecture) để dễ mở rộng và bảo trì.

## Cây thư mục

```bash
smartfarm-frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── logo.svg
│   ├── components/
│   │   ├── Layout.jsx              # Khung bọc Header, Navigation & Footer
│   │   └── Layout.module.css
│   ├── context/
│   │   └── AuthContext.jsx         # Quản lý trạng thái Đăng nhập / Token
│   ├── features/
│   │   ├── auth/                   # Đăng nhập & Đăng ký (LoginPage.jsx, RegisterPage.jsx)
│   │   ├── dashboard/              # Trang Chủ & Biểu đồ (DashboardPage.jsx)
│   │   ├── control/                # Trang Điều khiển & Cài đặt (ControlPage.jsx)
│   │   ├── history/                # Trang Nhật ký & Thống kê (HistoryPage.jsx)
│   │   └── chatbot/                # Trang Trợ lý AI (ChatbotPage.jsx)
│   ├── services/
│   │   └── realtimeApi.js          # Gộp chung Axios REST API & Socket.io Client
│   ├── App.jsx                     # Định tuyến ứng dụng (React Router)
│   ├── main.jsx                    # Entry point React
│   └── index.css                   # CSS toàn cục
├── .env
├── index.html
├── package.json
└── vite.config.js 
```

## Chi tiết các tệp

### 1. Tệp cấu hình gốc

- `index.html`: Tệp HTML duy nhất của SPA, chứa `div#root` để React mount giao diện.
- `vite.config.js`: Cấu hình React plugin, cổng `5173` và alias đường dẫn cho Vite.
- `package.json`: Quản lý React, React Router, Lucide Icons, Socket.io Client, Google Charts và các script `npm run dev`, `npm run build`.
- `.env`: Lưu URL của Backend API và Socket URL phía Client.
- `.gitignore`: Loại bỏ `node_modules`, `.env` và `dist` khỏi Git.
- `README.md`: Hướng dẫn cài đặt và khởi chạy Frontend.

### 2. Thư mục `src/`

- `main.jsx`: Khởi tạo React Root và bọc `App` trong các Context Provider.
- `App.jsx`: Định tuyến các trang `/login`, `/register`, `/`, `/control`, `/history` và `/chatbot`.
- `index.css`: Định nghĩa CSS toàn cục, biến màu và font chữ của ứng dụng.

### 3. Thư mục `src/assets/`

- `logo.svg`: Logo mầm cây của dự án SmartFarm.
- `default-avatar.png`: Ảnh đại diện mặc định trên Header.

### 4. Thư mục `src/components/`

- `Layout/Layout.jsx` và `Layout.module.css`: Khung bao toàn trang, gồm Navbar, nội dung chính và Footer.
- `Navbar/Navbar.jsx` và `Navbar.module.css`: Thanh điều hướng, logo, liên kết trang và thông tin tài khoản.
- `Footer/Footer.jsx` và `Footer.module.css`: Chân trang, bản quyền và thông tin Trường/Khoa.

### 5. Thư mục `src/context/`

- `AuthContext.jsx`: Lưu User Token, User Info và cung cấp các hàm `login()` và `logout()` trên toàn ứng dụng.

### 6. Thư mục `src/features/`

- `auth/`: Trang đăng nhập, đăng ký và CSS Module tương ứng.
- `dashboard/`: Hiển thị thông số thời gian thực và biểu đồ độ ẩm đất.
- `control/`: Bật/tắt máy bơm, chuyển chế độ AUTO/MANUAL và cài đặt ngưỡng.
- `history/`: Hiển thị thống kê, bộ lọc ngày và bảng lịch sử tưới.
- `chatbot/`: Khung chat Gemini AI và các gợi ý câu hỏi nhanh.

### 7. Thư mục `src/services/`

- `api.js`: Cấu hình Axios Instance và tự động đính kèm JWT Token khi gọi REST API.
- `socket.js`: Kết nối `socket.io-client` để nhận sự kiện `sensor:update` theo thời gian thực