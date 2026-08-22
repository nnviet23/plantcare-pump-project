const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../services/emailService');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ten dang nhap hoac email da duoc su dung',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      otpCode,
      otpExpires,
    });

    await newUser.save();
    await sendOTPEmail(email, otpCode);

    return res.status(201).json({
      success: true,
      message: 'Dang ky thanh cong. Vui long kiem tra email de nhan ma OTP',
      email,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Khong tim thay nguoi dung' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Tai khoan da duoc xac thuc tu truoc' });
    }

    if (user.otpCode !== otpCode || new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'Ma OTP khong chinh xac hoac da het han' });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Xac thuc OTP thanh cong. Tai khoan da san sang dang nhap',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Ten dang nhap hoac mat khau khong dung' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Tai khoan chua duoc xac thuc OTP qua email',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Ten dang nhap hoac mat khau khong dung' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Dang nhap thanh cong',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, verifyOTP, login };