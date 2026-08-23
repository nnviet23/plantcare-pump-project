const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

const TEMP_HUMI_TOPIC = 'plantcare/group15/temperature_humidity';
const SOIL_LIGHT_TOPIC = 'plantcare/group15/soil_light';
const WATER_LEVEL_TOPIC = 'plantcare/group15/water_level';
const PUMP_TOPIC_COMMAND = 'plantcare/group15/device/pump';
const MODE_TOPIC_COMMAND = 'plantcare/group15/device/mode';

client.on('connect', () => {
  console.log('[Mock ESP32] Connected to MQTT Broker successfully');

  // Subscribe cac topic lenh tu Backend
  client.subscribe([PUMP_TOPIC_COMMAND, MODE_TOPIC_COMMAND], (err) => {
    if (!err) {
      console.log('[Mock ESP32] Subscribed to command topics');
    }
  });

  // Gia lap ban du lieu dinh ky moi 5 giay
  setInterval(() => {
    const tempHumiData = {
      temperature: Math.floor(Math.random() * 10) + 25,
      airHumidity: Math.floor(Math.random() * 30) + 50,
    };

    const soilLightData = {
      soilHumidity: Math.floor(Math.random() * 40) + 20,
      lightIntensity: Math.floor(Math.random() * 50) + 40,
    };

    const waterData = {
      waterLevel: Math.floor(Math.random() * 20) + 70,
    };

    client.publish(TEMP_HUMI_TOPIC, JSON.stringify(tempHumiData));
    client.publish(SOIL_LIGHT_TOPIC, JSON.stringify(soilLightData));
    client.publish(WATER_LEVEL_TOPIC, JSON.stringify(waterData));

    console.log('[Mock ESP32] Sent sensor payloads to 3 topics');
  }, 5000);
});

client.on('message', (topic, message) => {
  const payload = JSON.parse(message.toString());
  if (topic === PUMP_TOPIC_COMMAND) {
    console.log(`[Mock ESP32] Received PUMP command: ${payload.action}`);
  } else if (topic === MODE_TOPIC_COMMAND) {
    console.log(`[Mock ESP32] Received MODE command: ${payload.action}`);
  }
});