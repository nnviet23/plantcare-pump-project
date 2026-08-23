import React, { createContext, useState, useEffect } from 'react';
import api, { socket } from '../services/realtimeApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      socket.connect();
    } else {
      socket.disconnect();
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        socket.connect();
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Dang nhap thất bai',
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Dang ky that bai');
    }
  };

  const verifyOTP = async (email, otpCode) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otpCode });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Xac thuc OTP thap bai');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, verifyOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
};