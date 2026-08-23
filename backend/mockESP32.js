const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

// Topics cảm biến (Publish)
const TEMP_HUMI_TOPIC = 'plantcare/group15/temperature_humidity';
const SOIL_LIGHT_TOPIC = 'plantcare/group15/soil_light';
const WATER_LEVEL_TOPIC = 'plantcare/group15/water_level';
const MODE_STATUS_TOPIC = 'plantcare/group15/mode';

// Topics nhận lệnh (Subscribe)
const PUMP_TOPIC_COMMAND = 'plantcare/group15/device/pump';
const MODE_TOPIC_COMMAND = 'plantcare/group15/device/mode';

let autoMode = true;
let pumping = false;

client.on('connect', () => {
  console.log('[Mock ESP32] Kết nối MQTT Broker thành công');

  // Đăng ký nhận lệnh từ Backend
  client.subscribe([PUMP_TOPIC_COMMAND, MODE_TOPIC_COMMAND], (err) => {
    if (!err) {
      console.log('[Mock ESP32] Đã subscribe các topic nhận lệnh thành công');
    }
  });

  // Giả lập bắn dữ liệu định kỳ mỗi 5 giây với tên biến khớp 100% C++ firmware
  setInterval(() => {
    const tempHumiData = {
      temperature: Math.floor(Math.random() * 10) + 25,
      humidity_air: Math.floor(Math.random() * 30) + 50,
    };

    const soilLightData = {
      humidity_soil: Math.floor(Math.random() * 40) + 20,
      light_raw: Math.floor(Math.random() * 50) + 40,
    };

    const waterData = {
      water_level_raw: 2500,
      water_percent: Math.floor(Math.random() * 20) + 70,
      low_water_alert: false,
    };

    const modeData = {
      mode: autoMode ? 'AUTO' : 'MANUAL',
      is_auto: autoMode,
    };

    client.publish(TEMP_HUMI_TOPIC, JSON.stringify(tempHumiData));
    client.publish(SOIL_LIGHT_TOPIC, JSON.stringify(soilLightData));
    client.publish(WATER_LEVEL_TOPIC, JSON.stringify(waterData));
    client.publish(MODE_STATUS_TOPIC, JSON.stringify(modeData));

    console.log('[Mock ESP32] Đã gửi gói tin cảm biến & trạng thái');
  }, 5000);
});

client.on('message', (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());

    if (topic === PUMP_TOPIC_COMMAND) {
      // Nhận lệnh bơm dạng số khớp C++ (1: Bật, 0: Tắt)
      if (payload.pump === 1) {
        pumping = true;
        console.log('[Mock ESP32] >>> LỆNH PUMP: BẬT MÁY BƠM (pump: 1)');
      } else if (payload.pump === 0) {
        pumping = false;
        console.log('[Mock ESP32] >>> LỆNH PUMP: TẮT MÁY BƠM (pump: 0)');
      }
    } else if (topic === MODE_TOPIC_COMMAND) {
      // Nhận lệnh mode dạng chuỗi ("AUTO" / "MANUAL")
      if (payload.mode === 'AUTO') {
        autoMode = true;
        pumping = false;
        console.log('[Mock ESP32] >>> LỆNH MODE: CHUYỂN SANG AUTO');
      } else if (payload.mode === 'MANUAL') {
        autoMode = false;
        console.log('[Mock ESP32] >>> LỆNH MODE: CHUYỂN SANG MANUAL');
      }
    }
  } catch (err) {
    console.error('[Mock ESP32] Lỗi giải mã tin nhắn MQTT:', err);
  }
});