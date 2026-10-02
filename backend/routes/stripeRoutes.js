const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/stripeController');
const { protect } = require('../middleware/auth');

// POST /api/stripe/create-checkout-session — requires authentication
router.post('/create-checkout-session', protect, createCheckoutSession);

module.exports = router;
