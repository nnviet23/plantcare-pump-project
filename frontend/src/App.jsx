import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Layout dùng chung
import MainLayout from './shared/layouts/MainLayout';

// Import các trang tính năng Auth đã tách
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import VerifyOtpPage from './features/auth/VerifyOtpPage';

// Import các trang tính năng chính của hệ thống
import DashboardPage from './features/dashboard/page';
import ControlPage from './features/control/page';
import HistoryPage from './features/history/page';
import ChatbotPage from './features/chatbot/page';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Nhóm Route Xác Thực (Auth) độc lập --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />

        {/* --- Nhóm Route chính bọc bởi MainLayout (Chỉ vào khi đã đăng nhập) --- */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/control" element={<ControlPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}