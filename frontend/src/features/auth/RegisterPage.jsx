import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from './layout';
import styles from './auth.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
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
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    console.log('Registering user, sending OTP to:', formData.email);
    // Kích hoạt API gửi OTP về Email, đồng thời chuyển hướng sang trang Verify OTP
    navigate('/verify-otp', { state: { email: formData.email } });
  };

  return (
    <AuthLayout>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>
          Tạo tài khoản mới để bắt đầu quản lý hệ thống tưới
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

          <button type="submit" className={styles.submitBtn}>
            Tiếp tục (Nhận mã OTP)
          </button>
        </form>

        <div className={styles.toggleMode}>
          <span>Đã có tài khoản?</span>
          <Link to="/login" className={styles.toggleLink}>
            Đăng nhập
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}