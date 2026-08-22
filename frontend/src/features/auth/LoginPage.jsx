import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from './layout';
import styles from './auth.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Logging in:', formData);
    // Gọi API đăng nhập thành công -> chuyển về Trang chủ
    navigate('/');
  };

  return (
    <AuthLayout>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>
          Vui lòng đăng nhập để truy cập bảng điều khiển SmartFarm
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

          <button type="submit" className={styles.submitBtn}>
            Đăng Nhập
          </button>
        </form>

        <div className={styles.toggleMode}>
          <span>Chưa có tài khoản?</span>
          <Link to="/register" className={styles.toggleLink}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}