const SensorData = require('../models/sensorData');
const Settings = require('../models/settings');
const WateringLog = require('../models/wateringLog');
const { sendPumpCommand } = require('../services/mqttService');

const getLatestSensors = async (req, res) => {
  try {
    const latestData = await SensorData.findOne().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: latestData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSensorHistory = async (req, res) => {
  try {
    const history = await SensorData.find().sort({ createdAt: -1 }).limit(20);
    return res.status(200).json({ success: true, data: history.reverse() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const controlPump = async (req, res) => {
  try {
    const { action } = req.body; // 'ON' hoac 'OFF'
    if (!['ON', 'OFF'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Hanh dong khong hop le' });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    settings.pumpStatus = action;
    await settings.save();

    // Gui lenh qua MQTT cho ESP32
    sendPumpCommand(action);

    // Phat tin hieu cap nhat xuong Frontend qua WebSockets
    const io = req.app.get('io');
    io.emit('pump_status_change', { pumpStatus: action, mode: settings.mode });

    // Neu bat thu cong, ghi vao nhat ky
    if (action === 'ON') {
      const latestSensor = await SensorData.findOne().sort({ createdAt: -1 });
      const currentHumidity = latestSensor ? `${latestSensor.soilHumidity}%` : 'N/A';

      const newLog = new WateringLog({
        startTime: new Date().toLocaleTimeString('vi-VN'),
        endTime: 'Dang hoat dong...',
        duration: 'Thu cong',
        mode: 'MANUAL',
        humidityBefore: currentHumidity,
        reason: 'Nguoi dung kich hoat thu cong qua Website',
      });
      await newLog.save();
    }

    return res.status(200).json({
      success: true,
      message: `Da gui lenh ${action} may bom thanh cong`,
      pumpStatus: action,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { mode, soilThreshold, airThreshold, tempThreshold, lightThreshold } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    if (mode) settings.mode = mode;
    if (soilThreshold !== undefined) settings.soilThreshold = soilThreshold;
    if (airThreshold !== undefined) settings.airThreshold = airThreshold;
    if (tempThreshold !== undefined) settings.tempThreshold = tempThreshold;
    if (lightThreshold !== undefined) settings.lightThreshold = lightThreshold;

    await settings.save();

    return res.status(200).json({
      success: true,
      message: 'Cap nhat cai dat thanh cong',
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getWateringLogs = async (req, res) => {
  try {
    const logs = await WateringLog.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLatestSensors,
  getSensorHistory,
  controlPump,
  getSettings,
  updateSettings,
  getWateringLogs,
};