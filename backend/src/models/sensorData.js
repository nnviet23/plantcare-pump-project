const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema(
  {
    soilHumidity: {
      type: Number,
      required: true,
    },
    airHumidity: {
      type: Number,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    lightIntensity: {
      type: Number,
      required: true,
    },
    waterLevel: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SensorData', sensorDataSchema);