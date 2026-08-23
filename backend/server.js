const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const { connectDB } = require('./src/config/services');
const authRoutes = require('./src/routes/authRoutes');
const farmRoutes = require('./src/routes/farmRoutes');
const chatbotRoutes = require('./src/routes/chatbotRoutes');
const { initMQTT } = require('./src/services/mqttService');

const app = express();
const server = http.createServer(app);

// Cau hinh Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// Khoi tao Socket.io Server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Luu doi tuong io vao app de truy cap tu controllers
app.set('io', io);

// Ket noi Co so du lieu Azure Cosmos DB
connectDB();

// Khoi tao MQTT Client va truyen doi tuong WebSockets io
initMQTT(io);

// Dang ky Routes
app.use('/api/auth', authRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Test API Route Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'SmartFarm Backend API is running smoothly.',
    timestamp: new Date()
  });
});

// Socket.io Connection Event
io.on('connection', (socket) => {
  console.log(`[WebSockets] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[WebSockets] Client disconnected: ${socket.id}`);
  });
});

// Khoid chay Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] SmartFarm Backend listening on port ${PORT}`);
});