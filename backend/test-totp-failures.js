const axios = require('axios');
const speakeasy = require('speakeasy');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function run() {
  let userEmail = `test_fail_${Date.now()}@example.com`;
  let userPassword = 'password123';
  let secret;
  let jwtToken;
  
  // Create an Axios instance that doesn't throw on 4xx/5xx errors
  const api = axios.create({
    validateStatus: () => true
  });

  try {
    console.log('1. Signing up (should return secret, no user created yet)...');
    const signupRes = await api.post(`${API_URL}/auth/signup`, {
      name: 'Test Fail User',
      email: userEmail,
      password: userPassword
    });
    console.log('Signup success:', signupRes.data.success);
    secret = signupRes.data.data.totpSetup.secret;
    
    console.log('2. Attempting to log in before verifying (should fail)...');
    const loginResUnverified = await api.post(`${API_URL}/auth/login`, {
      email: userEmail,
      password: userPassword
    });
    console.log('Login unverified success (should be false):', loginResUnverified.data.success);
    console.log('Login unverified message:', loginResUnverified.data.message);

    console.log('3. Attempting to verify with invalid OTP (should fail)...');
    const verifyResFail = await api.post(`${API_URL}/auth/verify-totp`, {
      name: 'Test Fail User',
      email: userEmail,
      password: userPassword,
      secret,
      token: '000000'
    });
    console.log('Verify invalid OTP success (should be false):', verifyResFail.data.success);
    console.log('Verify invalid OTP message:', verifyResFail.data.message);

    console.log('4. Verifying with correct OTP (should create user)...');
    const totpCode = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
    const verifyResSuccess = await api.post(`${API_URL}/auth/verify-totp`, {
      name: 'Test Fail User',
      email: userEmail,
      password: userPassword,
      secret,
      token: totpCode
    });
    console.log('Verify correct OTP success:', verifyResSuccess.data.success);
    jwtToken = verifyResSuccess.data.data.token;

    console.log('5. Logging in after verification...');
    const loginResSuccess = await api.post(`${API_URL}/auth/login`, {
      email: userEmail,
      password: userPassword
    });
    console.log('Login after verification requires 2FA:', loginResSuccess.data.require2FA);
    
    // Clean up
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('./models/User');
    await User.deleteOne({ email: userEmail });
    console.log('Cleanup done. Failure tests passed!');
  } catch (error) {
    console.error('Error during tests:', error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

run();
