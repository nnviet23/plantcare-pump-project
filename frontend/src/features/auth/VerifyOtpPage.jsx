import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from './layout';
import styles from './auth.module.css';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = location.state?.email || 'email của bạn';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSuccess, setIsSuccess] = useState(false);

  // Xử lý tự động chuyển ô input khi gõ số OTP
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Tự động focus sang ô tiếp theo
    if (element.value !== '' && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      alert('Vui lòng nhập đủ 6 chữ số OTP!');
      return;
    }

    console.log('Verifying OTP code:', otpCode);
    // Giả lập xác thực OTP thành công
    setIsSuccess(true);

    // Chờ 2 giây hiển thị thông báo thành công rồi chuyển hướng về Đăng nhập
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <AuthLayout>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Xác Thực OTP</h1>
        <p className={styles.subtitle}>
          Mã xác thực 6 số đã được gửi tới email:<br />
          <strong style={{ color: '#1b2a3a' }}>{userEmail}</strong>
        </p>

        {isSuccess ? (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>🎉</div>
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

            <button type="submit" className={styles.submitBtn}>
              Xác Nhận OTP
            </button>
          </form>
        )}

        {!isSuccess && (
          <div className={styles.toggleMode}>
            <span>Chưa nhận được mã?</span>
            <span
              className={styles.toggleLink}
              onClick={() => alert('Đã gửi lại mã OTP!')}
            >
              Gửi lại mã
            </span>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}