require('dotenv').config({ path: '/Users/ashish/Documents/Divyesh/integration-testing/backend/.env' });
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testStripe() {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: { name: 'Test Product' },
            unit_amount: 100000,
          },
          quantity: 1,
        }
      ],
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });
    console.log('✅ Success:', session.url);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testStripe();
