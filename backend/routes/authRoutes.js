const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();
const { signup, login, getMe, verifyTOTP } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/verify-totp', authLimiter, verifyTOTP);
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);

module.exports = router;
