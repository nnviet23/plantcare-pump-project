import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout from './shared/layouts/MainLayout';
import ProtectedRoute from './shared/components/ProtectedRoute';

import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import VerifyOtpPage from './features/auth/VerifyOtpPage';

import DashboardPage from './features/dashboard/page';
import ControlPage from './features/control/page';
import HistoryPage from './features/history/page';
import ChatbotPage from './features/chatbot/page';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />

        {/* Protected Dashboard Routes bọc bởi MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/control" element={<ControlPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}