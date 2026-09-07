const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema(
  {
    soilHumidity: {
      type: Number,
      default: null,
    },
    airHumidity: {
      type: Number,
      default: null,
    },
    temperature: {
      type: Number,
      default: null,
    },
    lightIntensity: {
      type: Number,
      default: null,
    },
    waterLevel: {
      type: Number,
      default: null,
    },
    lightRaw: { type: Number, default: null },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Tránh lỗi OverwriteModelError khi Nodemon restart
module.exports = mongoose.models.SensorData || mongoose.model('SensorData', sensorDataSchema);