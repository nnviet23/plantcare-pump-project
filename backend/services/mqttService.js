const mqtt = require('mqtt');

// Kết nối tới MQTT Broker
const client = mqtt.connect(process.env.MQTT_BROKER_URL, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASSWORD,
});

client.on('connect', () => {
  console.log('🟢 Đã kết nối thành công tới MQTT Broker!');
  
  // Đăng ký nhận dữ liệu từ các Topic
  client.subscribe(['smartfarm/telemetry', 'smartfarm/pump/status'], (err) => {
    if (!err) {
      console.log('📡 Đã Subscribe các topics: smartfarm/telemetry & smartfarm/pump/status');
    }
  });
});

// Lắng nghe dữ liệu đổ về từ ESP32
client.on('message', (topic, message) => {
  const payload = JSON.parse(message.toString());

  if (topic === 'smartfarm/telemetry') {
    // 1. Lưu payload vào Database (MongoDB / PostgreSQL)
    // 2. Bắn dữ liệu qua Socket.io lên React Frontend
  }
});

// Hàm gửi lệnh bật/tắt máy bơm xuống ESP32
const sendPumpCommand = (status) => {
  const commandPayload = JSON.stringify({ action: status }); // { action: "ON" } hoặc { action: "OFF" }
  client.publish('smartfarm/pump/command', commandPayload);
};

module.exports = { sendPumpCommand };