const mqtt = require('mqtt');
const SensorData = require('../models/sensorData');
const Settings = require('../models/settings');

let client;
let currentSensorBuffer = {};

const prefix = process.env.MQTT_TOPIC_PREFIX || 'plantcare/group15';

const topics = {
  climate: `${prefix}/temperature_humidity`,
  soil: `${prefix}/soil_light`,
  water: `${prefix}/water_level`,
  mode: `${prefix}/mode`,
};

function isMQTTConnected() {
  return !!client?.connected;
}

function validNumber(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function mergeSensorPayload(buffer, topic, payload) {
  const next = { ...buffer };
  let mappings = [];

  if (topic === topics.climate) {
    mappings = [
      ['temperature', 'temperature', -50, 80],
      ['humidity_air', 'airHumidity', 0, 100],
    ];
  } else if (topic === topics.soil) {
    mappings = [
      ['humidity_soil', 'soilHumidity', 0, 100],
      ['light_percent', 'lightIntensity', 0, 100],
      ['light_raw', 'lightRaw', 0, 65535],
    ];
  } else if (topic === topics.water) {
    mappings = [
      ['water_percent', 'waterLevel', 0, 100],
    ];
  }

  for (const [source, target, min, max] of mappings) {
    if (validNumber(payload[source], min, max)) {
      next[target] = payload[source];
    }
  }

  return next;
}

function publish(topic, payload) {
  if (!isMQTTConnected()) {
    return Promise.reject(
      Object.assign(
        new Error('MQTT chưa kết nối. Kiểm tra broker trước khi gửi lệnh thiết bị.'),
        { status: 503 }
      )
    );
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        Object.assign(
          new Error('MQTT chưa xác nhận nhận lệnh. Vui lòng kiểm tra thiết bị.'),
          { status: 504 }
        )
      );
    }, 8000);

    client.publish(
      topic,
      JSON.stringify(payload),
      { qos: 1, retain: false },
      (error) => {
        clearTimeout(timer);
        if (error) {
          reject(Object.assign(new Error('Không gửi được lệnh MQTT.'), { status: 503 }));
        } else {
          resolve();
        }
      }
    );
  });
}

const sendPumpCommand = (action) =>
  publish(`${prefix}/device/pump`, { pump: action === 'ON' ? 1 : 0 });

const sendModeCommand = (mode) =>
  publish(`${prefix}/device/mode`, { mode });

function initMQTT(io) {
  if (client) return client;

  // Tự động bổ sung giao thức mqtt:// nếu cấu hình .env chỉ điền hostname thuần
  let brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com';
  const hasProtocol = /^(mqtt|mqtts|ws|wss|tcp):\/\//.test(brokerUrl);
  if (!hasProtocol) {
    brokerUrl = `mqtt://${brokerUrl}`;
  }

  client = mqtt.connect(brokerUrl, {
    port: Number(process.env.MQTT_PORT) || 1883,
    reconnectPeriod: 5000,
    connectTimeout: 15000,
    ...(process.env.MQTT_USERNAME
      ? {
          username: process.env.MQTT_USERNAME,
          password: process.env.MQTT_PASSWORD,
        }
      : {}),
  });

  client.on('connect', () => {
    console.log('[MQTT] Connected');
    client.subscribe(Object.values(topics));
  });

  client.on('error', (err) => {
    console.error('[MQTT] Không kết nối được broker:', err?.message || err);
  });

  client.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return;
      }

      // Xử lý gói tin đồng bộ chế độ hoạt động và trạng thái máy bơm từ mạch
      if (topic === topics.mode) {
        const update = {};

        if (['AUTO', 'MANUAL'].includes(payload.mode)) {
          update.mode = payload.mode;
        }
        if ([0, 1].includes(payload.pump)) {
          update.pumpStatus = payload.pump === 1 ? 'ON' : 'OFF';
        }
        if (['ON', 'OFF'].includes(payload.pumpStatus)) {
          update.pumpStatus = payload.pumpStatus;
        }

        if (Object.keys(update).length) {
          const settings = await Settings.findOneAndUpdate({}, update, {
            upsert: true,
            new: true,
            runValidators: true,
          });

          io?.emit('pump_status_change', update);
          io?.emit('settings_update', settings);
        }
        return;
      }

      // Bỏ qua topic không nằm trong danh sách đăng ký
      if (!Object.values(topics).includes(topic)) return;

      currentSensorBuffer = mergeSensorPayload(currentSensorBuffer, topic, payload);

      // Lưu trữ dữ liệu đo đạc thực tế vào CSDL và phát socket thời gian thực
      if (Object.keys(currentSensorBuffer).length) {
        const saved = await SensorData.create(currentSensorBuffer);
        io?.emit('sensor_update', saved);

        // --- BẮT ĐẦU LOGIC QUYẾT ĐỊNH TỰ ĐỘNG TƯỚI (CLOUD AUTOMATION) ---
        const settings = await Settings.findOne({});
        
        if (settings && settings.mode === 'AUTO') {
          const soilMoisture = currentSensorBuffer.soilHumidity;
          const waterLevel = currentSensorBuffer.waterLevel;
          const threshold = settings.soilThreshold || 40;

          // ƯU TIÊN 1 (BẢO VỆ CHỐNG CHÁY): Nếu nước trong bể cạn (<= 15%), cưỡng chế TẮT bơm ngay lập tức
          if (typeof waterLevel === 'number' && waterLevel <= 15) {
            if (settings.pumpStatus !== 'OFF') {
              await sendPumpCommand('OFF');
              await Settings.updateOne({}, { pumpStatus: 'OFF' });
              io?.emit('pump_status_change', { pumpStatus: 'OFF', mode: 'AUTO' });
              console.warn(`[AUTO Cảnh Báo] Mực nước quá thấp (${waterLevel}%). Tự động ngắt bơm bảo vệ động cơ!`);
            }
          }
          // ƯU TIÊN 2: Nước an toàn (> 15%) VÀ đất khô dưới ngưỡng -> Tự động BẬT bơm
          else if (typeof soilMoisture === 'number' && soilMoisture < threshold) {
            const isWaterSafe = typeof waterLevel === 'number' ? waterLevel > 15 : true;
            if (isWaterSafe && settings.pumpStatus !== 'ON') {
              await sendPumpCommand('ON');
              await Settings.updateOne({}, { pumpStatus: 'ON' });
              io?.emit('pump_status_change', { pumpStatus: 'ON', mode: 'AUTO' });
              console.log(`[AUTO] Đất khô (${soilMoisture}% < ${threshold}%). Tự động bật máy bơm.`);
            }
          } 
          // ƯU TIÊN 3: Đất đã đủ ẩm (ngưỡng + 5% để tạo trễ tránh bật tắt liên tục) -> Tự động TẮT bơm
          else if (typeof soilMoisture === 'number' && soilMoisture >= (threshold + 5)) {
            if (settings.pumpStatus !== 'OFF') {
              await sendPumpCommand('OFF');
              await Settings.updateOne({}, { pumpStatus: 'OFF' });
              io?.emit('pump_status_change', { pumpStatus: 'OFF', mode: 'AUTO' });
              console.log(`[AUTO] Đất đã đủ ẩm (${soilMoisture}% >= ${threshold + 5}%). Tự động tắt máy bơm.`);
            }
          }
        }
      }
    } catch {
      console.error('[MQTT] Không thể xử lý hoặc lưu gói tin cảm biến.');
    }
  });

  return client;
}

module.exports = {
  initMQTT,
  sendPumpCommand,
  sendModeCommand,
  isMQTTConnected,
  mergeSensorPayload,
  topics,
};