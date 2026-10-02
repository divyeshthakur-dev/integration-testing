const Stripe = require('stripe');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Lazy-init so the server starts even if the key is missing
let stripe;
const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

// @desc    Create a Stripe Checkout Session for an existing order
// @route   POST /api/stripe/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only the order owner can pay
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Already paid — nothing to do
    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    // ─── Build line items from DB prices (never trust the frontend) ──────
    const lineItems = [];
    let verifiedItemsPrice = 0;

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name}" no longer exists`,
        });
      }

      const unitAmount = Math.round(product.price * 100); // paise (INR smallest unit)
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: product.name,
            images: product.image && product.image.startsWith('http') ? [product.image] : [],
            description: `${product.brand} — ${product.category}`,
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      });

      verifiedItemsPrice += product.price * item.quantity;
    }

    // Shipping — matches CartContext.tsx logic
    const verifiedShipping = verifiedItemsPrice > 1000 ? 0 : 99;
    if (verifiedShipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: { name: 'Shipping' },
          unit_amount: verifiedShipping * 100,
        },
        quantity: 1,
      });
    }

    // Tax — 18 % GST
    const verifiedTax = Math.round(verifiedItemsPrice * 0.18);
    if (verifiedTax > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: { name: 'GST (18%)' },
          unit_amount: verifiedTax * 100,
        },
        quantity: 1,
      });
    }

    // ─── Create Stripe Checkout Session ──────────────────────────────────
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
      success_url: `${frontendUrl}/order-success/${order._id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment/cancel?orderId=${order._id}`,
    });

    // Persist session ID on the order for later lookup
    order.stripeSessionId = session.id;
    await order.save();

    res.json({
      success: true,
      data: { url: session.url, sessionId: session.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Stripe webhook events (signature-verified)
// @route   POST /api/stripe/webhook
// @access  Public (Stripe-signed)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      req.body,                           // raw body (Buffer)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ── checkout.session.completed ─────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error('Webhook: missing orderId in session metadata');
      return res.status(200).json({ received: true });
    }

    try {
      const order = await Order.findById(orderId);

      if (!order) {
        console.error(`Webhook: Order ${orderId} not found`);
        return res.status(200).json({ received: true });
      }

      // ── Idempotency: skip if already paid ────────────────────────────
      if (order.isPaid) {
        console.log(`Webhook: Order ${orderId} already paid — skipping duplicate`);
        return res.status(200).json({ received: true });
      }

      // ── Mark order as paid ───────────────────────────────────────────
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = 'confirmed';
      order.paymentMethod = 'Stripe';
      order.stripePaymentIntentId = session.payment_intent;
      order.paymentResult = {
        id: session.payment_intent,
        status: session.payment_status,
        updateTime: new Date().toISOString(),
      };

      await order.save();
      console.log(`✅ Webhook: Order ${orderId} marked as paid (Stripe)`);
    } catch (err) {
      // Log but still return 200 — Stripe should not keep retrying our errors
      console.error(`Webhook: Error updating order ${orderId}:`, err.message);
    }
  }

  // Always acknowledge receipt
  res.status(200).json({ received: true });
};

module.exports = { createCheckoutSession, handleWebhook };
