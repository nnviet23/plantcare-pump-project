const mqtt = require('mqtt');
const SensorData = require('../models/sensorData');
const Settings = require('../models/settings');
let client;
let currentSensorBuffer = {};
const prefix = process.env.MQTT_TOPIC_PREFIX || 'plantcare/group15';
const topics = { climate: `${prefix}/temperature_humidity`, soil: `${prefix}/soil_light`, water: `${prefix}/water_level`, mode: `${prefix}/mode` };
function isMQTTConnected() { return !!client?.connected; }
function validNumber(value, min, max) { return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max; }
function mergeSensorPayload(buffer, topic, payload) {
  const next = {...buffer};
  const mappings = topic === topics.climate ? [['temperature','temperature',-50,80],['humidity_air','airHumidity',0,100]]
    : topic === topics.soil ? [['humidity_soil','soilHumidity',0,100],['light_percent','lightIntensity',0,100],['light_raw','lightRaw',0,65535]]
    : topic === topics.water ? [['water_percent','waterLevel',0,100]] : [];
  for (const [source,target,min,max] of mappings) if(validNumber(payload[source],min,max)) next[target]=payload[source];
  return next;
}
function initMQTT(io) {
  if (client) return client;
  client = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com', {
    port: Number(process.env.MQTT_PORT) || 1883, reconnectPeriod: 5000, connectTimeout: 15000,
    ...(process.env.MQTT_USERNAME ? {username:process.env.MQTT_USERNAME,password:process.env.MQTT_PASSWORD} : {}),
  });
  client.on('connect', () => { console.log('[MQTT] Connected'); client.subscribe(Object.values(topics)); });
  client.on('error', () => console.error('[MQTT] Không kết nối được broker.'));
  client.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return;
      if (topic === topics.mode) {
        const update = {};
        if (['AUTO','MANUAL'].includes(payload.mode)) update.mode = payload.mode;
        if ([0,1].includes(payload.pump)) update.pumpStatus = payload.pump === 1 ? 'ON' : 'OFF';
        if (['ON','OFF'].includes(payload.pumpStatus)) update.pumpStatus = payload.pumpStatus;
        if (Object.keys(update).length) {
          const settings = await Settings.findOneAndUpdate({}, update, {upsert:true,new:true,runValidators:true});
          io?.emit('pump_status_change', update);
          io?.emit('settings_update', settings);
        }
        return;
      }
      if (!Object.values(topics).includes(topic)) return;
      currentSensorBuffer = mergeSensorPayload(currentSensorBuffer, topic, payload);
      // Never fill missing readings with invented values. Save partial measured data.
      if (Object.keys(currentSensorBuffer).length) {
        const saved = await SensorData.create(currentSensorBuffer);
        io?.emit('sensor_update', saved);
      }
    } catch { console.error('[MQTT] Không thể xử lý hoặc lưu gói tin cảm biến.'); }
  });
  return client;
}
function publish(topic, payload) {
  if (!isMQTTConnected()) return Promise.reject(Object.assign(new Error('MQTT chưa kết nối. Kiểm tra broker trước khi gửi lệnh thiết bị.'),{status:503}));
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Object.assign(new Error('MQTT chưa xác nhận nhận lệnh. Vui lòng kiểm tra thiết bị.'),{status:504})),8000);
    client.publish(topic,JSON.stringify(payload),{qos:1,retain:false},error=>{clearTimeout(timer);if(error)reject(Object.assign(new Error('Không gửi được lệnh MQTT.'),{status:503}));else resolve();});
  });
}
const sendPumpCommand = action => publish(`${prefix}/device/pump`,{pump:action==='ON'?1:0});
const sendModeCommand = mode => publish(`${prefix}/device/mode`,{mode});
module.exports={initMQTT,sendPumpCommand,sendModeCommand,isMQTTConnected,mergeSensorPayload,topics};
