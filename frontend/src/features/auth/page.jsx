import React, { useState } from 'react';
import AuthLayout from './layout';
import styles from './auth.module.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log('Logging in:', { username: formData.username, password: formData.password });
    } else {
      console.log('Registering:', formData);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.authCard}>
        <h1 className={styles.title}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className={styles.subtitle}>
          {isLogin 
            ? 'Vui lòng đăng nhập để truy cập bảng điều khiển SmartFarm' 
            : 'Tạo tài khoản mới để bắt đầu quản lý hệ thống tưới'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              className={styles.input}
              placeholder="e.g. namviet"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Địa chỉ Email</label>
              <input
                type="email"
                name="email"
                className={styles.input}
                placeholder="student@vnu.edu.vn"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Mật khẩu</label>
            <input
              type="password"
              name="password"
              className={styles.input}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                className={styles.input}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" className={styles.submitBtn}>
            {isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
          </button>
        </form>

        <div className={styles.toggleMode}>
          <span>{isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}</span>
          <span 
            className={styles.toggleLink}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </span>
        </div>
      </div>
    </AuthLayout>
  );
}