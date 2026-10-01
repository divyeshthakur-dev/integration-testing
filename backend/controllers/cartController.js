const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * IMPORTANT — Security guarantee:
 * Every function reads req.user._id from the JWT decoded by the `protect`
 * middleware. The user ID is NEVER taken from req.body or req.params.
 * This ensures a user can only ever read or modify their own cart.
 */

// Helper — fetch cart with product details populated, scoped to one user
const getPopulatedCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    model: 'Product',
    select: 'name price originalPrice image images category brand stock rating numReviews isFeatured',
  });
  return cart;
};

// @desc    Get the logged-in user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    const cart = await getPopulatedCart(req.user._id);

    if (!cart) {
      // Return an empty cart shape instead of 404 — simpler for the frontend
      return res.json({ success: true, data: { items: [] } });
    }

    // Filter out items whose product was deleted from the DB
    const validItems = cart.items.filter((i) => i.product !== null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update a product in the cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    // Validate product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stock < 1) {
      return res.status(400).json({ success: false, message: 'Product is out of stock' });
    }

    const safeQty = Math.min(Math.max(1, parseInt(quantity)), product.stock);

    // Upsert: find the user's cart or create a new one
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (i) => i.product.toString() === productId
    );

    if (existingIndex >= 0) {
      // Already in cart — add quantities, cap at stock
      cart.items[existingIndex].quantity = Math.min(
        cart.items[existingIndex].quantity + safeQty,
        product.stock
      );
    } else {
      cart.items.push({ product: productId, quantity: safeQty });
    }

    await cart.save();

    const populated = await getPopulatedCart(req.user._id);
    res.json({ success: true, message: 'Item added to cart', data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quantity of a specific item in the cart
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ success: false, message: 'quantity is required' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const qty = parseInt(quantity);

    if (qty <= 0) {
      // Remove the item
      cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    } else {
      const item = cart.items.find((i) => i.product.toString() === productId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not in cart' });
      }
      const product = await Product.findById(productId);
      item.quantity = product ? Math.min(qty, product.stock) : qty;
    }

    await cart.save();

    const populated = await getPopulatedCart(req.user._id);
    res.json({ success: true, message: 'Cart updated', data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a single item from the cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();

    const populated = await getPopulatedCart(req.user._id);
    res.json({ success: true, message: 'Item removed from cart', data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear the entire cart for the logged-in user
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { upsert: true }
    );
    res.json({ success: true, message: 'Cart cleared', data: { items: [] } });
  } catch (error) {
    next(error);
  }
};

// @desc    Replace entire cart (used on login to sync local cart → server)
// @route   PUT /api/cart/sync
// @access  Private
const syncCart = async (req, res, next) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'items must be an array' });
    }

    // Validate & sanitize each item
    const validItems = [];
    for (const item of items) {
      if (!item.productId || !item.quantity) continue;
      const product = await Product.findById(item.productId);
      if (!product || product.stock < 1) continue;
      validItems.push({
        product: item.productId,
        quantity: Math.min(Math.max(1, parseInt(item.quantity)), product.stock),
      });
    }

    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: validItems },
      { upsert: true, new: true }
    );

    const populated = await getPopulatedCart(req.user._id);
    res.json({ success: true, message: 'Cart synced', data: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, syncCart };
