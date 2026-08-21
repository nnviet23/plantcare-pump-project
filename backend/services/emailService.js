const nodemailer = require('nodemailer');

// Khởi tạo Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // e.g., 'yourfarm@gmail.com'
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng 16 ký tự ở trên
  },
});

// Hàm gửi cảnh báo hết nước
const sendWaterAlert = async (toEmail) => {
  const mailOptions = {
    from: '"SmartFarm System" <yourfarm@gmail.com>',
    to: toEmail,
    subject: '🚨 CẢNH BÁO: Mực nước bể chứa sắp hết!',
    html: `
      <h3>Hệ thống SmartFarm thông báo:</h3>
      <p>Mực nước trong bể chứa hiện tại chỉ còn <strong>xuống dưới 15%</strong>.</p>
      <p>Vui lòng bơm thêm nước vào bể để duy trì hoạt động tưới tự động!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendWaterAlert };