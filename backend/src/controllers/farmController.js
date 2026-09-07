const SensorData = require('../models/sensorData');
const Settings = require('../models/settings');
const WateringLog = require('../models/wateringLog');
const { sendPumpCommand, sendModeCommand } = require('../services/mqttService');

// --- HÀM TRỢ GIÚP PHẢN HỒI LỖI ---
function fail(res, error) {
  return res.status(error.status || 500).json({
    success: false,
    message: error.status ? error.message : 'Không xử lý được dữ liệu máy chủ. Vui lòng thử lại.',
  });
}

// --- 1. LẤY DỮ LIỆU CẢM BIẾN MỚI NHẤT ---
const getLatestSensors = async (req, res) => {
  try {
    const data = await SensorData.findOne().sort({ createdAt: -1 });
    return res.json({ success: true, data });
  } catch (e) {
    return fail(res, e);
  }
};

// --- 2. LẤY LỊCH SỬ DỮ LIỆU CẢM BIẾN (20 BẢN GHI GẦN NHẤT) ---
const getSensorHistory = async (req, res) => {
  try {
    const data = await SensorData.find().sort({ createdAt: -1 }).limit(20);
    return res.json({ success: true, data: data.reverse() });
  } catch (e) {
    return fail(res, e);
  }
};

// --- 3. LẤY NHẬT KÝ TƯỚI NƯỚC (50 BẢN GHI GẦN NHẤT) ---
const getWateringLogs = async (req, res) => {
  try {
    const data = await WateringLog.find().sort({ createdAt: -1 }).limit(50);
    return res.json({ success: true, data });
  } catch (e) {
    return fail(res, e);
  }
};

// --- 4. LẤY CẤU HÌNH HỆ THỐNG HIỆN TẠI ---
const getSettings = async (req, res) => {
  try {
    const settings = (await Settings.findOne()) || (await Settings.create({}));
    return res.json({ success: true, data: settings });
  } catch (e) {
    return fail(res, e);
  }
};

// --- 5. BỘ XÁC THỰC THÔNG SỐ NGƯỠNG TỰ ĐỘNG ---
const limits = {
  soilThreshold: [0, 100],
  airThreshold: [0, 100],
  tempThreshold: [0, 60],
  lightThreshold: [0, 100],
};

function validateSettings(body) {
  if (body.mode !== undefined && !['AUTO', 'MANUAL'].includes(body.mode)) {
    return 'Chế độ phải là AUTO hoặc MANUAL.';
  }

  for (const [key, [min, max]] of Object.entries(limits)) {
    if (body[key] !== undefined) {
      if (typeof body[key] !== 'number' || !Number.isFinite(body[key]) || body[key] < min || body[key] > max) {
        return `${key} phải là số từ ${min} đến ${max}.`;
      }
    }
  }

  if (!Object.keys(body).some((k) => k === 'mode' || k in limits)) {
    return 'Chưa có cấu hình để lưu.';
  }

  return '';
}

// Khóa chống xung đột lệnh gửi đồng thời tới thiết bị
let deviceBusy = false;

// --- 6. CẬP NHẬT CẤU HÌNH VÀ CHẾ ĐỘ ---
const updateSettings = async (req, res) => {
  const validation = validateSettings(req.body || {});
  if (validation) {
    return res.status(400).json({ success: false, message: validation });
  }

  if (deviceBusy) {
    return res.status(409).json({ success: false, message: 'Đang gửi lệnh thiết bị khác. Vui lòng thử lại.' });
  }

  deviceBusy = true;
  try {
    const settings = (await Settings.findOne()) || new Settings({});

    // Nếu đổi chế độ -> Bắn lệnh MQTT xuống ESP32
    if (req.body.mode !== undefined) {
      await sendModeCommand(req.body.mode);
      settings.mode = req.body.mode;
    }

    // Cập nhật các ngưỡng đo
    for (const key of Object.keys(limits)) {
      if (req.body[key] !== undefined) {
        settings[key] = req.body[key];
      }
    }

    await settings.save();
    req.app.get('io')?.emit('settings_update', settings);

    return res.json({
      success: true,
      data: settings,
      message: req.body.mode
        ? 'Đã gửi chế độ tới broker MQTT và lưu cấu hình. Chờ thiết bị phản hồi.'
        : 'Đã lưu ngưỡng trên máy chủ.',
    });
  } catch (e) {
    return fail(res, e);
  } finally {
    deviceBusy = false;
  }
};

// --- 7. ĐIỀU KHIỂN BẬT / TẮT MÁY BƠM THỦ CÔNG ---
const controlPump = async (req, res) => {
  const { action } = req.body || {};

  if (!['ON', 'OFF'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Lệnh bơm phải là ON hoặc OFF.' });
  }

  if (deviceBusy) {
    return res.status(409).json({ success: false, message: 'Đang gửi lệnh thiết bị khác. Vui lòng thử lại.' });
  }

  deviceBusy = true;
  try {
    const settings = (await Settings.findOne()) || (await Settings.create({}));

    // Chỉ cho phép can thiệp nút bấm khi ở chế độ MANUAL
    if (action === 'ON' && settings.mode !== 'MANUAL') {
      return res.status(409).json({
        success: false,
        message: 'Hãy chuyển sang chế độ Thủ công (MANUAL) trước khi bật máy bơm.',
      });
    }

    // CHỐT CHẶN AN TOÀN: Kiểm tra mực nước trước khi cho phép bật máy bơm
    if (action === 'ON') {
      const latestSensor = await SensorData.findOne().sort({ createdAt: -1 });
      const currentWaterLevel = latestSensor?.waterLevel;

      if (typeof currentWaterLevel === 'number' && currentWaterLevel <= 15) {
        return res.status(400).json({
          success: false,
          message: `Không thể bật máy bơm! Mực nước bể chứa đang quá thấp (${currentWaterLevel}% <= 15%). Vui lòng châm thêm nước.`,
        });
      }
    }

    const previousStatus = settings.pumpStatus;

    // Gửi lệnh MQTT xuống ESP32
    await sendPumpCommand(action);

    // Cập nhật trạng thái mới vào CSDL
    settings.pumpStatus = action;
    await settings.save();

    // Ghi nhận nhật ký tưới nước
    if (action === 'ON' && previousStatus !== 'ON') {
      const sensor = await SensorData.findOne().sort({ createdAt: -1 });
      await WateringLog.create({
        startTime: new Date().toLocaleTimeString('vi-VN'),
        endTime: 'Đang hoạt động',
        duration: '0 giây',
        mode: settings.mode,
        humidityBefore: sensor?.soilHumidity != null ? `${sensor.soilHumidity}%` : 'Chưa có dữ liệu',
        reason: 'Người dùng bật máy bơm thủ công từ giao diện Web',
        startedAt: new Date(),
        status: 'RUNNING',
      });
    } else if (action === 'OFF') {
      const log = await WateringLog.findOne({ status: 'RUNNING' }).sort({ createdAt: -1 });
      if (log) {
        log.endTime = new Date().toLocaleTimeString('vi-VN');
        const durationSec = Math.max(0, Math.round((Date.now() - new Date(log.startedAt || log.createdAt).getTime()) / 1000));
        log.duration = `${durationSec} giây`;
        log.status = 'COMPLETED';
        await log.save();
      }
    }

    // Phát thông báo thời gian thực tới toàn bộ Client đang mở web
    const io = req.app.get('io');
    io?.emit('pump_status_change', { pumpStatus: action, mode: settings.mode });
    io?.emit('logs_update');

    return res.json({
      success: true,
      pumpStatus: action,
      message: 'Broker MQTT đã nhận lệnh. Trạng thái vật lý cần phản hồi từ ESP32.',
    });
  } catch (e) {
    return fail(res, e);
  } finally {
    deviceBusy = false;
  }
};

module.exports = {
  getLatestSensors,
  getSensorHistory,
  getWateringLogs,
  getSettings,
  updateSettings,
  controlPump,
  validateSettings,
};