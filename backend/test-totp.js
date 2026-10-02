const axios = require('axios');
const speakeasy = require('speakeasy');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function run() {
  let userEmail = `test_${Date.now()}@example.com`;
  let userPassword = 'password123';
  let token;
  let secret;
  let recoveryCodes;

  try {
    console.log('1. Signing up...');
    const signupRes = await axios.post(`${API_URL}/auth/signup`, {
      name: 'Test User',
      email: userEmail,
      password: userPassword
    });
    console.log('Signup success:', signupRes.data.success);
    secret = signupRes.data.data.totpSetup.secret;
    console.log('Secret received:', !!secret);

    console.log('2. Verifying TOTP...');
    const totpCode = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
    const verifyRes = await axios.post(`${API_URL}/auth/verify-totp`, {
      name: 'Test User',
      email: userEmail,
      password: userPassword,
      secret,
      token: totpCode
    });
    recoveryCodes = verifyRes.data.data.recoveryCodes;
    token = verifyRes.data.data.token;
    console.log('Verify success:', verifyRes.data.success);
    console.log('Got recovery codes:', recoveryCodes.length);

    console.log('3. Logging in with TOTP...');
    const loginRes1 = await axios.post(`${API_URL}/auth/login`, {
      email: userEmail,
      password: userPassword
    });
    console.log('Login requires 2FA:', loginRes1.data.require2FA);

    const loginTotpCode = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
    const loginRes2 = await axios.post(`${API_URL}/auth/login`, {
      email: userEmail,
      password: userPassword,
      totpCode: loginTotpCode
    });
    console.log('Login with TOTP success:', loginRes2.data.success);

    console.log('4. Logging in with Recovery Code...');
    const loginRes3 = await axios.post(`${API_URL}/auth/login`, {
      email: userEmail,
      password: userPassword,
      totpCode: recoveryCodes[0]
    });
    console.log('Login with Recovery Code success:', loginRes3.data.success);
    
    // Clean up
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('./models/User');
    await User.deleteOne({ email: userEmail });
    console.log('Cleanup done. All tests passed!');
  } catch (error) {
    console.error('Error during tests:');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

run();
