const mongoose = require('mongoose');

const wateringLogSchema = new mongoose.Schema(
  {
    startedAt: { type: Date },
    status: { type: String, enum: ['RUNNING', 'COMPLETED'], default: 'COMPLETED' },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ['AUTO', 'MANUAL'],
      default: 'AUTO',
    },
    humidityBefore: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.WateringLog || mongoose.model('WateringLog', wateringLogSchema);