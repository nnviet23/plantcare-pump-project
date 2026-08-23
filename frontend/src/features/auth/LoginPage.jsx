import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from './layout';
import { AuthContext } from '../../context/AuthContext';
import styles from './auth.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await login(formData.username, formData.password);
    if (res?.success) {
      navigate('/');
    } else {
      setErrorMessage(res?.message || 'Đăng nhập thất bại');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>
          Vui lòng đăng nhập để truy cập bảng điều khiển SmartFarm
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

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xác thực...' : 'Đăng Nhập'}
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