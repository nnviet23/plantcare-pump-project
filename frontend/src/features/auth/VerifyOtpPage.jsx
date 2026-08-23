import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from './layout';
import { AuthContext } from '../../context/AuthContext';
import styles from './auth.module.css';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP } = useContext(AuthContext);

  const userEmail = location.state?.email || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    setErrorMessage('');

    if (element.value !== '' && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyOTP(userEmail, otpCode);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
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
        <h1 className={styles.title}>Xác Thực OTP</h1>
        <p className={styles.subtitle}>
          Mã xác thực 6 số đã được gửi tới email:<br />
          <strong style={{ color: '#1b2a3a' }}>{userEmail || 'Chưa xác định'}</strong>
        </p>

        {errorMessage && (
          <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {errorMessage}
          </div>
        )}

        {isSuccess ? (
          <div className={styles.successBox}>
            <h3>Tạo tài khoản thành công!</h3>
            <p>Đang tự động chuyển hướng đến trang đăng nhập...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.otpContainer}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className={styles.otpInput}
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Đang xác thực...' : 'Xác Nhận OTP'}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}