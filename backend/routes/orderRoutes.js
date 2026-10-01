const express = require('express');
const router = express.Router();
const { createOrder, payOrder, getOrderById, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect); // All order routes require auth

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/pay', payOrder);

module.exports = router;
