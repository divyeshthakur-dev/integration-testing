const express = require('express');
const router = express.Router();
const { sendTestEmail } = require('../controllers/emailController');

// Define routes
router.post('/send', sendTestEmail);

module.exports = router;
