const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendOTPEmail = async (toEmail, otpCode) => {
  try {
    await transporter.sendMail({
      from: '"SmartFarm System" <no-reply@smartfarm.com>',
      to: toEmail,
      subject: 'SmartFarm - Ma xac thuc OTP dang ky tai khoan',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f5f0; color: #1b2a3a;">
          <h2>Xac thuc tai khoan SmartFarm</h2>
          <p>Cam on ban da dang ky tai khoan. Ma OTP xac thuc cua ban la:</p>
          <h1 style="color: #1b2a3a; letter-spacing: 6px; font-size: 32px;">${otpCode}</h1>
          <p>Ma nay co hieu luc trong vong 10 phut. Vui long khong chia se ma nay voi bat ky ai.</p>
        </div>
      `,
    });
    console.log(`[Email Service] Sent OTP email to: ${toEmail}`);
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email: ${error.message}`);
    throw error;
  }
};

module.exports = { sendOTPEmail };