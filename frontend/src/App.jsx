import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Kiểm tra lại đúng đường dẫn này:
import MainLayout from './shared/layouts/MainLayout';
import AuthPage from './features/auth/page';
import DashboardPage from './features/dashboard/page';
import ControlPage from './features/control/page';
import HistoryPage from './features/history/page';
import ChatbotPage from './features/chatbot/page';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route Auth độc lập */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* Route bọc bởi MainLayout */}
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