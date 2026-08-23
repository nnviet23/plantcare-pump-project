const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    pumpStatus: {
      type: String,
      enum: ['ON', 'OFF'],
      default: 'OFF',
    },
    mode: {
      type: String,
      enum: ['AUTO', 'MANUAL'],
      default: 'AUTO',
    },
    soilThreshold: {
      type: Number,
      default: 40,
    },
    airThreshold: {
      type: Number,
      default: 50,
    },
    tempThreshold: {
      type: Number,
      default: 35,
    },
    lightThreshold: {
      type: Number,
      default: 80,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);