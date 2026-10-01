const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getCategories,
  getFeaturedProducts,
} = require('../controllers/productController');

router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;
