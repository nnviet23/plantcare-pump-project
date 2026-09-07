const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

require('dotenv').config({
  path: path.join(__dirname, '.env'),
  quiet: true,
});

const { connectDB } = require('./src/config/services');
const { initMQTT, isMQTTConnected } = require('./src/services/mqttService');

const app = express();
const server = http.createServer(app);

// --- 1. CẤU HÌNH CORS ---
const allowedOrigins = [
  'https://nnviet23-plantcare-pump-project.vercel.app',
  ...[process.env.CLIENT_URL, process.env.CORS_ORIGINS]
    .filter(Boolean)
    .flatMap((s) => s.split(','))
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//.test(s)),
];

const origin = (value, callback) => {
  const isAllowed =
    !value ||
    allowedOrigins.includes(value) ||
    (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(value));

  callback(null, isAllowed);
};

app.use(
  cors({
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '32kb' }));

// --- 2. CẤU HÌNH SOCKET.IO & XÁC THỰC JWT ---
const io = new Server(server, {
  cors: {
    origin,
    credentials: true,
  },
});
app.set('io', io);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error('Phiên đăng nhập không hợp lệ.'));
  }
});

// --- 3. MONITORING & HEALTH CHECK ROUTE ---
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const isMqttOk = isMQTTConnected();

  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'success' : 'degraded',
    database: isDbConnected ? 'connected' : 'disconnected',
    mqtt: isMqttOk ? 'connected' : 'disconnected',
    aiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date(),
  });
});

// Chặn request API khi CSDL chưa sẵn sàng (tránh lỗi buffer ngầm)
app.use(['/api/auth', '/api/farm'], (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  return res.status(503).json({
    success: false,
    message: 'Backend chưa kết nối cơ sở dữ liệu. Kiểm tra cấu hình MongoDB và kết nối mạng.',
  });
});

// --- 4. ĐĂNG KÝ CÁC ROUTES DỊCH VỤ ---
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/farm', require('./src/routes/farmRoutes'));
app.use('/api/chatbot', require('./src/routes/chatbotRoutes'));

// --- 5. GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message =
    err.type === 'entity.too.large'
      ? 'Nội dung gửi quá dài.'
      : err.message || 'Yêu cầu không hợp lệ.';

  res.status(status).json({ success: false, message });
});

// --- 6. KHỞI ĐỘNG HTTP SERVER & CÁC DỊCH VỤ NỀN ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
});

async function startServices() {
  // Kết nối MongoDB Atlas
  try {
    await connectDB();
  } catch (error) {
    console.error('[Database Error] Kết nối CSDL thất bại:', error.message);
    setTimeout(startServices, 30000).unref();
    return;
  }

  // Khởi tạo MQTT Broker (Tách biệt khỏi DB để tránh gán nhãn nhầm lỗi)
  try {
    initMQTT(io);
  } catch (error) {
    console.error('[MQTT Error] Khởi tạo MQTT Broker thất bại:', error.message);
  }
}

startServices();