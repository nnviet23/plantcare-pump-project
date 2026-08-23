const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  getLatestSensors,
  getSensorHistory,
  controlPump,
  getSettings,
  updateSettings,
  getWateringLogs,
} = require('../controllers/farmController');

router.get('/sensors/latest', verifyToken, getLatestSensors);
router.get('/sensors/history', verifyToken, getSensorHistory);
router.post('/pump/control', verifyToken, controlPump);
router.get('/settings', verifyToken, getSettings);
router.put('/settings', verifyToken, updateSettings);
router.get('/logs', verifyToken, getWateringLogs);

module.exports = router;