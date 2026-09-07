const mqtt = require('mqtt');
const SensorData = require('../models/sensorData');
const Settings = require('../models/settings');
const WateringLog = require('../models/wateringLog');
const User = require('../models/user');
const { sendLowWaterAlertEmail } = require('./emailService');

let client;
let currentSensorBuffer = {};

// Cờ kiểm soát chỉ gửi 1 mail duy nhất cho mỗi đợt cạn nước
let hasSentLowWaterAlert = false;

// --- BỘ QUẢN LÝ CHU KỲ TƯỚI TỰ ĐỘNG (30S TƯỚI - 15S NGHỈ) ---
const autoCycle = {
  isWatering: false,
  isResting: false,
  wateringTimer: null,
  restingTimer: null,
  runningLogId: null,
  startedAt: null,
};

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

async function cancelAutoWateringEmergency(reasonText, io) {
  if (autoCycle.wateringTimer) {
    clearTimeout(autoCycle.wateringTimer);
    autoCycle.wateringTimer = null;
  }
  if (autoCycle.restingTimer) {
    clearTimeout(autoCycle.restingTimer);
    autoCycle.restingTimer = null;
  }

  if (autoCycle.isWatering && autoCycle.runningLogId) {
    const durationSec = Math.max(1, Math.round((Date.now() - autoCycle.startedAt.getTime()) / 1000));
    await WateringLog.findByIdAndUpdate(autoCycle.runningLogId, {
      endTime: new Date().toLocaleTimeString('vi-VN'),
      duration: `${durationSec} giây (Ngắt: ${reasonText})`,
      status: 'COMPLETED',
    });
    io?.emit('logs_update');
  }

  autoCycle.isWatering = false;
  autoCycle.isResting = false;
  autoCycle.runningLogId = null;
  autoCycle.startedAt = null;
}

async function finish30sWateringCycle(io) {
  console.log('[AUTO] Đã tưới đủ 30 giây. Ngắt bơm và chuyển sang nghỉ 15 giây.');

  await sendPumpCommand('OFF');
  await Settings.updateOne({}, { pumpStatus: 'OFF' });
  io?.emit('pump_status_change', { pumpStatus: 'OFF', mode: 'AUTO' });

  if (autoCycle.runningLogId) {
    await WateringLog.findByIdAndUpdate(autoCycle.runningLogId, {
      endTime: new Date().toLocaleTimeString('vi-VN'),
      duration: '30 giây',
      status: 'COMPLETED',
    });
    io?.emit('logs_update');
  }

  autoCycle.isWatering = false;
  autoCycle.runningLogId = null;
  autoCycle.startedAt = null;
  autoCycle.wateringTimer = null;

  autoCycle.isResting = true;
  autoCycle.restingTimer = setTimeout(() => {
    autoCycle.isResting = false;
    autoCycle.restingTimer = null;
    console.log('[AUTO] Hết 15 giây nghỉ. Cho phép chu kỳ tưới tiếp theo.');
  }, 15000);
}

function initMQTT(io) {
  if (client) return client;

  let brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com';
  const hasProtocol = /^(mqtt|mqtts|ws|wss|tcp):\/\//.test(brokerUrl);
  if (!hasProtocol) {
    brokerUrl = `mqtt://${brokerUrl}`;
  }

  client = mqtt.connect(brokerUrl, {
    port: Number(process.env.MQTT_PORT) || 1883,
    reconnectPeriod: 5000,
    connectTimeout: 15000,
    ...(process.env.EMAIL_USER && process.env.MQTT_USERNAME
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

      if (topic === topics.mode) {
        const update = {};
        if (['AUTO', 'MANUAL'].includes(payload.mode)) {
          update.mode = payload.mode;
          if (payload.mode === 'MANUAL') {
            await cancelAutoWateringEmergency('Chuyển sang chế độ thủ công', io);
          }
        }
        if ([0, 1].includes(payload.pump)) update.pumpStatus = payload.pump === 1 ? 'ON' : 'OFF';
        if (['ON', 'OFF'].includes(payload.pumpStatus)) update.pumpStatus = payload.pumpStatus;

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

      if (!Object.values(topics).includes(topic)) return;

      currentSensorBuffer = mergeSensorPayload(currentSensorBuffer, topic, payload);

      if (Object.keys(currentSensorBuffer).length) {
        const saved = await SensorData.create(currentSensorBuffer);
        io?.emit('sensor_update', saved);

        const soilMoisture = currentSensorBuffer.soilHumidity;
        const waterLevel = currentSensorBuffer.waterLevel;

        // --- CƠ CHẾ GỬI CẢNH BÁO NƯỚC THẤP ĐÚNG 1 LẦN (EDGE-TRIGGER) ---
        if (typeof waterLevel === 'number') {
          if (waterLevel <= 15) {
            // Chỉ gửi đúng 1 lần khi bắt đầu tụt xuống <= 15%
            if (!hasSentLowWaterAlert) {
              hasSentLowWaterAlert = true;
              try {
                const users = await User.find({}, 'email');
                const emailList = users.map((u) => u.email).filter(Boolean);
                sendLowWaterAlertEmail(waterLevel, emailList);
              } catch (e) {
                sendLowWaterAlertEmail(waterLevel);
              }
            }
          } else if (waterLevel > 20) {
            // Khi nước đã được châm đầy (> 20%), reset lại cờ để sẵn sàng cho lần cạn tiếp theo
            if (hasSentLowWaterAlert) {
              hasSentLowWaterAlert = false;
              console.log('[AUTO] Nước đã được châm đầy trở lại. Reset cờ cảnh báo.');
            }
          }
        }

        const settings = await Settings.findOne({});
        if (settings && settings.mode === 'AUTO') {
          const threshold = settings.soilThreshold || 40;

          // ƯU TIÊN 1: NƯỚC THẤP (<= 15%) -> CƯỠNG CHẾ NGẮT BƠM
          if (typeof waterLevel === 'number' && waterLevel <= 15) {
            if (settings.pumpStatus !== 'OFF' || autoCycle.isWatering) {
              await sendPumpCommand('OFF');
              await Settings.updateOne({}, { pumpStatus: 'OFF' });
              await cancelAutoWateringEmergency('Bể hết nước', io);
              io?.emit('pump_status_change', { pumpStatus: 'OFF', mode: 'AUTO' });
              console.warn(`[AUTO] Bể cạn nước (${waterLevel}%). Ngắt bơm khẩn cấp!`);
            }
            return;
          }

          // ƯU TIÊN 2: BẮT ĐẦU CHU KỲ TƯỚI 30S (KÈM KHÓA NGHỈ 15S)
          const isWaterSafe = typeof waterLevel === 'number' ? waterLevel > 15 : true;
          const isSoilDry = typeof soilMoisture === 'number' && soilMoisture < threshold;

          if (isWaterSafe && isSoilDry) {
            if (!autoCycle.isWatering && !autoCycle.isResting) {
              autoCycle.isWatering = true;
              autoCycle.startedAt = new Date();

              await sendPumpCommand('ON');
              await Settings.updateOne({}, { pumpStatus: 'ON' });
              io?.emit('pump_status_change', { pumpStatus: 'ON', mode: 'AUTO' });

              const newLog = await WateringLog.create({
                startTime: autoCycle.startedAt.toLocaleTimeString('vi-VN'),
                endTime: 'Đang hoạt động',
                duration: '0 giây',
                mode: 'AUTO',
                humidityBefore: `${soilMoisture}%`,
                reason: `Tự động tưới (30s): Độ ẩm đất (${soilMoisture}%) dưới ngưỡng (${threshold}%)`,
                startedAt: autoCycle.startedAt,
                status: 'RUNNING',
              });
              autoCycle.runningLogId = newLog._id;
              io?.emit('logs_update');

              console.log(`[AUTO] Bắt đầu chu kỳ tưới 30s. Độ ẩm: ${soilMoisture}% < ${threshold}%`);

              autoCycle.wateringTimer = setTimeout(async () => {
                await finish30sWateringCycle(io);
              }, 30000);
            }
          }
        }
      }
    } catch {
      console.error('[MQTT] Không thể xử lý gói tin cảm biến hoặc cập nhật log.');
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