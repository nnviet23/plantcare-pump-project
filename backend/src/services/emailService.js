const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('[Email Service] Lỗi cấu hình Gmail SMTP:', error.message);
  } else {
    console.log('[Email Service] Kết nối Gmail SMTP thành công.');
  }
});

// 1. GỬI MÃ OTP ĐĂNG KÝ
const sendOTPEmail = async (toEmail, otpCode) => {
  try {
    await transporter.sendMail({
      from: `"SmartFarm System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'SmartFarm - Mã xác thực OTP đăng ký tài khoản',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f5f0; color: #1b2a3a; border-radius: 8px;">
          <h2>Xác thực tài khoản SmartFarm</h2>
          <p>Mã OTP xác thực của bạn là:</p>
          <h1 style="color: #2b6cb0; letter-spacing: 6px; font-size: 32px; margin: 16px 0;">${otpCode}</h1>
          <p>Mã này có hiệu lực trong vòng 10 phút.</p>
        </div>
      `,
    });
    console.log(`[Email Service] Đã gửi OTP tới: ${toEmail}`);
  } catch (error) {
    console.error(`[Email Service Error] Lỗi gửi OTP: ${error.message}`);
    throw error;
  }
};

// 2. GỬI CẢNH BÁO CẠN NƯỚC (CHỐNG SPAM & KHÓA ĐỒNG THỜI)
let lastAlertSentTime = 0;
let isSendingAlert = false; // Khóa tránh gửi đồng thời khi mạng chậm
const ALERT_COOLDOWN = 15 * 60 * 1000; // 15 phút cooldown

const sendLowWaterAlertEmail = async (waterLevel, receiverEmail) => {
  const now = Date.now();

  // Chặn ngay lập tức nếu đang gửi dở hoặc chưa hết 15 phút cooldown
  if (isSendingAlert || (now - lastAlertSentTime < ALERT_COOLDOWN)) {
    return;
  }

  let toList = Array.isArray(receiverEmail) ? receiverEmail.filter(Boolean).join(', ') : receiverEmail;
  if (!toList || toList.trim() === '') {
    toList = process.env.ALERT_RECEIVER || process.env.EMAIL_USER;
  }

  if (!toList) {
    console.warn('[Email Service] Không tìm thấy email người nhận hợp lệ.');
    return;
  }

  // KHÓA NGAY LẬP TỨC TRƯỚC KHI GỬI
  isSendingAlert = true;
  lastAlertSentTime = now;

  try {
    await transporter.sendMail({
      from: `"SmartFarm Cảnh Báo" <${process.env.EMAIL_USER}>`,
      to: toList,
      subject: '⚠️ CẢNH BÁO: Bể chứa nước SmartFarm đang cạn!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff5f5; color: #742a2a; border: 1px solid #feb2b2; border-radius: 8px;">
          <h2 style="color: #c53030; margin-top: 0;">⚠️ CẢNH BÁO CẠN NƯỚC HỆ THỐNG TƯỚI</h2>
          <p>Hệ thống phát hiện mực nước trong bồn chứa đã xuống mức nguy hiểm:</p>
          <div style="font-size: 24px; font-weight: bold; color: #e53e3e; margin: 15px 0;">
            Mực nước hiện tại: ${waterLevel != null ? `${waterLevel}%` : 'Dưới 15%'}
          </div>
          <p><strong>Hành động của hệ thống:</strong></p>
          <ul>
            <li>Toàn bộ hoạt động bơm nước đã bị cưỡng chế dừng để chống cháy động cơ.</li>
            <li>Hệ thống sẽ tự động hoạt động trở lại sau khi bồn được châm thêm nước (> 20%).</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #fed7d7; margin: 20px 0;" />
          <small style="color: #a0aec0;">Thời gian ghi nhận: ${new Date().toLocaleString('vi-VN')}</small>
        </div>
      `,
    });

    console.log(`[Email Service] Đã gửi email cảnh báo cạn nước thành công tới: ${toList}`);
  } catch (error) {
    console.error(`[Email Service Error] Lỗi gửi email cảnh báo: ${error.message}`);
  } finally {
    isSendingAlert = false; // Mở khóa sau khi hoàn tất lượt gửi
  }
};

module.exports = {
  sendOTPEmail,
  sendLowWaterAlertEmail,
};