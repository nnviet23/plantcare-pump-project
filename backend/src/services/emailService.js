const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// --- 1. GỬI MÃ OTP ĐĂNG KÝ TÀI KHOẢN ---
const sendOTPEmail = async (toEmail, otpCode) => {
  try {
    await transporter.sendMail({
      from: `"SmartFarm System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'SmartFarm - Mã xác thực OTP đăng ký tài khoản',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f5f0; color: #1b2a3a; border-radius: 8px;">
          <h2 style="color: #1b2a3a;">Xác thực tài khoản SmartFarm</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản. Mã OTP xác thực của bạn là:</p>
          <h1 style="color: #2b6cb0; letter-spacing: 6px; font-size: 32px; margin: 16px 0;">${otpCode}</h1>
          <p>Mã này có hiệu lực trong vòng 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        </div>
      `,
    });
    console.log(`[Email Service] Đã gửi OTP tới: ${toEmail}`);
  } catch (error) {
    console.error(`[Email Service Error] Lỗi gửi OTP: ${error.message}`);
    throw error;
  }
};

// --- 2. GỬI CẢNH BÁO CẠN NƯỚC (CÓ CƠ CHẾ CHỐNG SPAM) ---
let lastAlertSentTime = 0;
const ALERT_COOLDOWN = 15 * 60 * 1000; // Giới hạn: Chỉ gửi tối đa 1 email mỗi 15 phút

const sendLowWaterAlertEmail = async (waterLevel, receiverEmail) => {
  const now = Date.now();
  // Nếu vừa gửi email trong vòng 15 phút trước, tạm thời bỏ qua để không làm nghẽn hộp thư
  if (now - lastAlertSentTime < ALERT_COOLDOWN) {
    return;
  }

  const targetEmail = receiverEmail || process.env.ALERT_RECEIVER || process.env.EMAIL_USER;
  if (!targetEmail) {
    console.warn('[Email Service] Bỏ qua gửi cảnh báo: Chưa cấu hình email người nhận.');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"SmartFarm Cảnh Báo" <${process.env.EMAIL_USER}>`,
      to: targetEmail,
      subject: '⚠️ CẢNH BÁO: Bể chứa nước SmartFarm đang cạn!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff5f5; color: #742a2a; border: 1px solid #feb2b2; border-radius: 8px;">
          <h2 style="color: #c53030; margin-top: 0;">⚠️ CẢNH BÁO CẠN NƯỚC HỆ THỐNG TƯỚI</h2>
          <p>Hệ thống vừa phát hiện mực nước trong bồn chứa đã tụt xuống mức nguy hiểm:</p>
          <div style="font-size: 24px; font-weight: bold; color: #e53e3e; margin: 15px 0;">
            Mực nước hiện tại: ${waterLevel != null ? `${waterLevel}%` : 'Dưới ngưỡng an toàn'}
          </div>
          <p><strong>Hậu quả:</strong></p>
          <ul>
            <li>Toàn bộ lệnh bật máy bơm (Tự động & Thủ công) đã bị tạm khóa để chống cháy động cơ.</li>
            <li>Cây trồng có thể bị thiếu nước nếu không được cấp nước kịp thời.</li>
          </ul>
          <p>Vui lòng kiểm tra bồn chứa và bơm thêm nước để hệ thống tiếp tục vận hành bình thường.</p>
          <hr style="border: none; border-top: 1px solid #fed7d7; margin: 20px 0;" />
          <small style="color: #a0aec0;">Thời gian ghi nhận: ${new Date().toLocaleString('vi-VN')}</small>
        </div>
      `,
    });

    lastAlertSentTime = now;
    console.log(`[Email Service] Đã gửi email cảnh báo cạn nước tới: ${targetEmail}`);
  } catch (error) {
    console.error(`[Email Service Error] Lỗi gửi email cảnh báo: ${error.message}`);
  }
};

module.exports = {
  sendOTPEmail,
  sendLowWaterAlertEmail,
};