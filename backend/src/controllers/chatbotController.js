const SensorData = require('../models/sensorData');
const Settings = require('../models/settings');
const { askGemini } = require('../services/geminiService');

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Noi dung cau hoi khong duoc de trong' });
    }

    const latestSensor = await SensorData.findOne().sort({ createdAt: -1 });
    const currentSettings = await Settings.findOne();

    const contextData = {
      soilHumidity: latestSensor ? latestSensor.soilHumidity : 'N/A',
      temperature: latestSensor ? latestSensor.temperature : 'N/A',
      airHumidity: latestSensor ? latestSensor.airHumidity : 'N/A',
      lightIntensity: latestSensor ? latestSensor.lightIntensity : 'N/A',
      waterLevel: latestSensor ? latestSensor.waterLevel : 'N/A',
      mode: currentSettings ? currentSettings.mode : 'AUTO',
      pumpStatus: currentSettings ? currentSettings.pumpStatus : 'OFF',
    };

    const aiReply = await askGemini(message, contextData);

    return res.status(200).json({
      success: true,
      reply: aiReply,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { handleChat };