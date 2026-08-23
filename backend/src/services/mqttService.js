const mqtt = require('mqtt');
const SensorData = require('../models/SensorData');
const Settings = require('../models/Settings');

// Kết nối MQTT Broker
const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

// Topics
const TEMP_HUMI_TOPIC = 'plantcare/group15/temperature_humidity';
const SOIL_LIGHT_TOPIC = 'plantcare/group15/soil_light';
const WATER_LEVEL_TOPIC = 'plantcare/group15/water_level';
const MODE_STATUS_TOPIC = 'plantcare/group15/mode';

const PUMP_TOPIC_COMMAND = 'plantcare/group15/device/pump';
const MODE_TOPIC_COMMAND = 'plantcare/group15/device/mode';

// Biến bộ nhớ tạm để gom dữ liệu cảm biến trước khi lưu
let currentSensorBuffer = {
  temperature: 25,
  airHumidity: 60,
  soilHumidity: 50,
  lightIntensity: 70,
  waterLevel: 80,
};

// Hàm khởi tạo MQTT và lắng nghe dữ liệu từ ESP32
const initMQTT = (io) => {
  client.on('connect', () => {
    console.log('[MQTT Service] Đã kết nối MQTT Broker thành công');
    client.subscribe([
      TEMP_HUMI_TOPIC,
      SOIL_LIGHT_TOPIC,
      WATER_LEVEL_TOPIC,
      MODE_STATUS_TOPIC,
    ]);
  });

  client.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());

      // 1. Ánh xạ Topic Nhiệt độ & Độ ẩm không khí
      if (topic === TEMP_HUMI_TOPIC) {
        currentSensorBuffer.temperature = payload.temperature ?? currentSensorBuffer.temperature;
        currentSensorBuffer.airHumidity = payload.humidity_air ?? currentSensorBuffer.airHumidity;
      }

      // 2. Ánh xạ Topic Độ ẩm đất & Ánh sáng
      else if (topic === SOIL_LIGHT_TOPIC) {
        currentSensorBuffer.soilHumidity = payload.humidity_soil ?? currentSensorBuffer.soilHumidity;
        currentSensorBuffer.lightIntensity = payload.light_raw ?? currentSensorBuffer.lightIntensity;
      }

      // 3. Ánh xạ Topic Mực nước & Lưu CSDL
      else if (topic === WATER_LEVEL_TOPIC) {
        currentSensorBuffer.waterLevel = payload.water_percent ?? currentSensorBuffer.waterLevel;

        // Lưu vào CSDL MongoDB
        const savedData = await SensorData.create(currentSensorBuffer);

        // Bắn dữ liệu Realtime về cho Frontend WebSockets
        if (io) {
          io.emit('sensor_update', savedData);
        }
      }

      // 4. Nhận phản hồi trạng thái Chế độ
      else if (topic === MODE_STATUS_TOPIC) {
        if (payload.mode) {
          await Settings.findOneAndUpdate({}, { mode: payload.mode }, { upsert: true });
          if (io) {
            io.emit('pump_status_change', { mode: payload.mode });
          }
        }
      }
    } catch (error) {
      console.error('[MQTT Service] Lỗi xử lý dữ liệu MQTT:', error.message);
    }
  });
};

// Hàm gửi lệnh BẬT/TẮT BƠM (Dạng JSON { pump: 1/0 } cho C++)
const sendPumpCommand = (action) => {
  const pumpValue = action === 'ON' ? 1 : 0;
  const payload = JSON.stringify({ pump: pumpValue });
  client.publish(PUMP_TOPIC_COMMAND, payload);
};

// Hàm gửi lệnh CHUYỂN MODE (Dạng JSON { mode: "AUTO"/"MANUAL" })
const sendModeCommand = (mode) => {
  const payload = JSON.stringify({ mode });
  client.publish(MODE_TOPIC_COMMAND, payload);
};

module.exports = {
  initMQTT,
  sendPumpCommand,
  sendModeCommand,
};