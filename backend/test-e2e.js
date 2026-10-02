const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: '/Users/ashish/Documents/Divyesh/integration-testing/backend/.env' });

async function runTest() {
  try {
    // 1. Sign up a test user
    console.log('Registering test user...');
    let token = '';
    const signupRes = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stripe Tester',
        email: 'stripetester' + Date.now() + '@example.com',
        password: 'password123'
      })
    });
    const signupData = await signupRes.json();
    if (!signupData.success) throw new Error(signupData.message);
    token = signupData.data.token;

    // 2. Fetch a product
    console.log('Fetching products...');
    const prodRes = await fetch('http://localhost:5000/api/products');
    const prodData = await prodRes.json();
    const product = prodData.data.products[0];

    // 3. Create an order
    console.log('Creating order...');
    const orderPayload = {
      orderItems: [
        {
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: 1
        }
      ],
      shippingAddress: {
        fullName: 'Test User',
        address: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
        phone: '1234567890'
      },
      paymentMethod: 'Stripe',
      itemsPrice: product.price,
      shippingPrice: 99,
      taxPrice: Math.round(product.price * 0.18),
      totalPrice: product.price + 99 + Math.round(product.price * 0.18)
    };

    const orderRes = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(orderPayload)
    });
    const orderData = await orderRes.json();
    if (!orderData.success) throw new Error(orderData.message);
    const order = orderData.data;
    console.log('Order created:', order._id);

    // 4. Create Stripe Checkout Session
    console.log('Creating checkout session...');
    const stripeRes = await fetch('http://localhost:5000/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ orderId: order._id })
    });
    const stripeData = await stripeRes.json();
    if (!stripeData.success) throw new Error(stripeData.message);
    
    console.log('Stripe Session created:', stripeData.data.url);

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

runTest();
