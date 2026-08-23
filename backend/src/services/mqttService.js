const mqtt = require('mqtt');
const SensorData = require('../models/sensorData');
const Settings = require('../models/settings');
const WateringLog = require('../models/wateringLog');

// ----------------------------------------------------------
// CAU HINH MQTT TOPICS VÀ BROKER
// ----------------------------------------------------------
const MQTT_BROKER = process.env.MQTT_BROKER || 'broker.hivemq.com';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

// Topics Nhan du lieu tu ESP32 (Subscribe)
const TEMP_HUMI_TOPIC = 'plantcare/group15/temperature_humidity';
const SOIL_LIGHT_TOPIC = 'plantcare/group15/soil_light';
const WATER_LEVEL_TOPIC = 'plantcare/group15/water_level';
const MODE_STATUS_TOPIC = 'plantcare/group15/mode';

// Topics Gui lenh xuong ESP32 (Publish)
const MODE_TOPIC_COMMAND = 'plantcare/group15/device/mode';
const PUMP_TOPIC_COMMAND = 'plantcare/group15/device/pump';

let client = null;

// Bien tam luu trang thai cam bien gan nhat
let currentSensorState = {
  temperature: 25,
  airHumidity: 60,
  soilHumidity: 50,
  lightIntensity: 70,
  waterLevel: 80,
};

const initMQTT = (io) => {
  const brokerUrl = `mqtt://${MQTT_BROKER}:${MQTT_PORT}`;
  client = mqtt.connect(brokerUrl);

  client.on('connect', () => {
    console.log('[MQTT] Connected to MQTT Broker successfully');

    const topicsToSubscribe = [
      TEMP_HUMI_TOPIC,
      SOIL_LIGHT_TOPIC,
      WATER_LEVEL_TOPIC,
      MODE_STATUS_TOPIC,
    ];

    client.subscribe(topicsToSubscribe, (err) => {
      if (!err) {
        console.log('[MQTT] Subscribed to all PlantCare Group 15 topics');
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());

      // Cap nhat bo nho tam dua tren Topic nhan duoc
      if (topic === TEMP_HUMI_TOPIC) {
        if (payload.temperature !== undefined) currentSensorState.temperature = payload.temperature;
        if (payload.airHumidity !== undefined) currentSensorState.airHumidity = payload.airHumidity;
      } else if (topic === SOIL_LIGHT_TOPIC) {
        if (payload.soilHumidity !== undefined) currentSensorState.soilHumidity = payload.soilHumidity;
        if (payload.lightIntensity !== undefined) currentSensorState.lightIntensity = payload.lightIntensity;
      } else if (topic === WATER_LEVEL_TOPIC) {
        if (payload.waterLevel !== undefined) currentSensorState.waterLevel = payload.waterLevel;
      } else if (topic === MODE_STATUS_TOPIC) {
        if (payload.mode) {
          await Settings.findOneAndUpdate({}, { mode: payload.mode }, { upsert: true });
        }
        return;
      }

      // 1. Luu ban ghi tong hop vao Azure Cosmos DB
      const newSensorData = new SensorData({
        soilHumidity: currentSensorState.soilHumidity,
        airHumidity: currentSensorState.airHumidity,
        temperature: currentSensorState.temperature,
        lightIntensity: currentSensorState.lightIntensity,
        waterLevel: currentSensorState.waterLevel,
      });
      await newSensorData.save();

      // 2. Phat du lieu Realtime qua Socket.io
      io.emit('sensor_update', newSensorData);

      // 3. Kiem tra va xu ly logic che do AUTO
      let currentSettings = await Settings.findOne();
      if (!currentSettings) {
        currentSettings = await Settings.create({});
      }

      if (currentSettings.mode === 'AUTO') {
        if (currentSensorState.soilHumidity < currentSettings.soilThreshold && currentSettings.pumpStatus === 'OFF') {
          currentSettings.pumpStatus = 'ON';
          await currentSettings.save();

          sendPumpCommand('ON');
          io.emit('pump_status_change', { pumpStatus: 'ON', mode: 'AUTO' });

          const newLog = new WateringLog({
            startTime: new Date().toLocaleTimeString('vi-VN'),
            endTime: 'Dang hoat dong...',
            duration: 'Co dinh 30s',
            mode: 'AUTO',
            humidityBefore: `${currentSensorState.soilHumidity}%`,
            reason: `Do am dat (${currentSensorState.soilHumidity}%) thap hon nguong (${currentSettings.soilThreshold}%)`,
          });
          await newLog.save();
        } else if (currentSensorState.soilHumidity >= currentSettings.soilThreshold && currentSettings.pumpStatus === 'ON') {
          currentSettings.pumpStatus = 'OFF';
          await currentSettings.save();

          sendPumpCommand('OFF');
          io.emit('pump_status_change', { pumpStatus: 'OFF', mode: 'AUTO' });
        }
      }
    } catch (error) {
      console.error(`[MQTT Error] Failed to process message on ${topic}: ${error.message}`);
    }
  });

  client.on('error', (error) => {
    console.error(`[MQTT Error] Connection error: ${error.message}`);
  });
};

const sendPumpCommand = (action) => {
  if (client && client.connected) {
    client.publish(PUMP_TOPIC_COMMAND, JSON.stringify({ action }));
  }
};

const sendModeCommand = (mode) => {
  if (client && client.connected) {
    client.publish(MODE_TOPIC_COMMAND, JSON.stringify({ action: mode }));
  }
};

module.exports = { initMQTT, sendPumpCommand, sendModeCommand };