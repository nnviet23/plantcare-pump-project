const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { handleChat } = require('../controllers/chatbotController');

router.post('/ask', verifyToken, handleChat);

module.exports = router;