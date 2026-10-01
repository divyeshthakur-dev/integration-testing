const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// All cart routes require authentication.
// The user's identity is always derived from the JWT token — never from request body.
router.use(protect);

router.get('/', getCart);            // GET    /api/cart
router.post('/', addToCart);         // POST   /api/cart
router.put('/sync', syncCart);       // PUT    /api/cart/sync   ← must be before /:productId
router.put('/:productId', updateCartItem);    // PUT    /api/cart/:productId
router.delete('/:productId', removeFromCart); // DELETE /api/cart/:productId
router.delete('/', clearCart);               // DELETE /api/cart

module.exports = router;
