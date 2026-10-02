const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();
const { signup, login, getMe, verifyTOTP } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/verify-totp', authLimiter, verifyTOTP);
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);

// Passkey WebAuthn Routes
const {
  generateWebAuthnRegistrationOptions,
  verifyWebAuthnRegistration,
  generateWebAuthnLoginOptions,
  verifyWebAuthnLogin,
} = require('../controllers/authController');

router.get('/passkey/register-options', protect, generateWebAuthnRegistrationOptions);
router.post('/passkey/register-verify', protect, verifyWebAuthnRegistration);
router.get('/passkey/login-options', generateWebAuthnLoginOptions);
router.post('/passkey/login-verify', verifyWebAuthnLogin);

module.exports = router;
