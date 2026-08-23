import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from './layout';
import { AuthContext } from '../../context/AuthContext';
import styles from './auth.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(formData.username, formData.email, formData.password);
      if (res.success) {
        navigate('/verify-otp', { state: { email: formData.email } });
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>
          Tạo tài khoản mới để bắt đầu quản lý hệ thống tưới
        </p>

        {errorMessage && (
          <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {errorMessage}
          </div>
        )}

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

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Tiếp tục (Nhận mã OTP)'}
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