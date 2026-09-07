const mongoose = require('mongoose');
const dns = require('node:dns');

// Vô hiệu hóa tính năng đệm lệnh khi Mongoose mất kết nối
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const uri = process.env.COSMOSDB_URI;

  if (!uri) {
    throw new Error('Biến môi trường COSMOSDB_URI chưa được cấu hình.');
  }

  // Cấu hình DNS tùy chỉnh cho các mạng chặn bản ghi SRV của MongoDB Atlas
  if (process.env.MONGODB_DNS_SERVERS) {
    const servers = process.env.MONGODB_DNS_SERVERS
      .split(',')
      .map((server) => server.trim())
      .filter(Boolean);

    dns.setServers(servers);
  }

  // Kết nối Database với cấu hình giới hạn thời gian chờ (10s)
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  console.log('[Database] Connected');
};

module.exports = {
  connectDB,
};