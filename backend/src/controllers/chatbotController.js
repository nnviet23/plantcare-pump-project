const SensorData = require('../models/SensorData');
const Settings = require('../models/Settings');
const { askGemini } = require('../services/geminiService');

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung câu hỏi không được để trống' });
    }

    // Lấy thông số cảm biến và cài đặt mới nhất từ CSDL
    const latestSensor = await SensorData.findOne().sort({ createdAt: -1 });
    const currentSettings = await Settings.findOne();

    const contextData = {
      soilHumidity: latestSensor ? `${latestSensor.soilHumidity}%` : 'Chưa có dữ liệu',
      temperature: latestSensor ? `${latestSensor.temperature}°C` : 'Chưa có dữ liệu',
      airHumidity: latestSensor ? `${latestSensor.airHumidity}%` : 'Chưa có dữ liệu',
      lightIntensity: latestSensor ? `${latestSensor.lightIntensity}%` : 'Chưa có dữ liệu',
      waterLevel: latestSensor ? `${latestSensor.waterLevel}%` : 'Chưa có dữ liệu',
      mode: currentSettings ? currentSettings.mode : 'AUTO',
      pumpStatus: currentSettings ? currentSettings.pumpStatus : 'OFF',
    };

    const aiReply = await askGemini(message, contextData);

    return res.status(200).json({
      success: true,
      reply: aiReply,
    });
  } catch (error) {
    console.error('[Chatbot Controller Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Lỗi xử lý hệ thống Chatbot' });
  }
};

module.exports = { handleChat };