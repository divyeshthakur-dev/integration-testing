const User = require('../models/User');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Add a random suffix so testing doesn't cause confusion with multiple identical Authenticator entries
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    // Generate TOTP secret for 2FA but do NOT save user to DB yet
    const secret = speakeasy.generateSecret({ name: `ShopX (${email}) #${randomSuffix}` });

    // Generate QR code data URL
    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    console.log(`\n[DEBUG-SIGNUP] New TOTP Setup for ${email}`);
    console.log(`[DEBUG-SIGNUP] Secret Base32: ${secret.base32}`);
    console.log(`[DEBUG-SIGNUP] Current Server Time: ${new Date().toISOString()}`);
    console.log(`[DEBUG-SIGNUP] Current Expected OTP: ${speakeasy.totp({ secret: secret.base32, encoding: 'base32' })}\n`);

    res.status(200).json({
      success: true,
      message: 'Proceed to 2FA setup',
      data: {
        totpSetup: { 
          qrCodeDataUrl,
          secret: secret.base32,
        }
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
const login = async (req, res, next) => {
  try {
    const { email, password, totpCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      // Use 400 or 403 to avoid global 401 redirect loop in frontend
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.totpVerified) {
      return res.status(403).json({ success: false, message: 'Account not verified. Please sign up again to complete 2FA setup.' });
    }

    // Removed 2FA check during login as requested

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
        totpVerified: user.totpVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify TOTP code
// @route   POST /api/auth/verify-totp
// @access  Private
const verifyTOTP = async (req, res, next) => {
  try {
    const { name, email, password, secret, token } = req.body;
    
    if (!name || !email || !password || !secret || !token) {
      return res.status(400).json({ success: false, message: 'Missing required fields for verification' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const sanitizedToken = String(token).replace(/\s+/g, '');
    
    console.log(`\n[DEBUG-VERIFY] Verifying OTP for ${email}`);
    console.log(`[DEBUG-VERIFY] Secret Base32: ${secret}`);
    console.log(`[DEBUG-VERIFY] Token Provided: ${sanitizedToken}`);
    console.log(`[DEBUG-VERIFY] Current Server Time: ${new Date().toISOString()}`);
    console.log(`[DEBUG-VERIFY] Expected OTP right now: ${speakeasy.totp({ secret, encoding: 'base32' })}`);
    
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: sanitizedToken,
      window: 2, // Allow +/- 1 minute for clock skew
    });
    
    console.log(`[DEBUG-VERIFY] Verification Result: ${verified}\n`);

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid TOTP code' });
    }

    // Generate recovery codes
    const generateCodes = () => {
      const codes = [];
      for (let i = 0; i < 10; i++) {
        codes.push(Math.random().toString(36).substr(2, 10).toUpperCase());
      }
      return codes;
    };
    const recoveryCodes = generateCodes();

    // Create the user in the database now that TOTP is verified
    const user = await User.create({
      name,
      email,
      password,
      totpSecret: secret,
      totpVerified: true,
      recoveryCodes,
    });

    const jwtToken = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created and TOTP verified successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: jwtToken,
        recoveryCodes,
      },
    });
  } catch (error) {
    next(error);
  }
};

const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

const getOrigin = (req) => {
  // Try to construct the exact origin the frontend is running on
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  
  // If we are getting API requests from localhost:3000, the origin should be http://localhost:3000
  // Since the API is on port 5000 and the frontend is on 3000, req.headers.origin is the safest bet!
  if (req.headers.origin) {
    return req.headers.origin;
  }
  return `${protocol}://${host}`;
};

const getRpID = (req) => {
  try {
    const originUrl = new URL(getOrigin(req));
    return originUrl.hostname;
  } catch (e) {
    return 'localhost';
  }
};

// @desc    Generate WebAuthn Registration Options
const generateWebAuthnRegistrationOptions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const options = await generateRegistrationOptions({
      rpName,
      rpID: getRpID(req),
      userID: user._id.toString(),
      userName: user.email,
      attestationType: 'none',
      excludeCredentials: user.passkeys.map(key => ({
        id: Buffer.from(key.credentialID, 'base64url'),
        type: 'public-key',
        transports: key.transports,
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
    });

    user.currentChallenge = options.challenge;
    await user.save();

    res.json({ success: true, data: options });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify WebAuthn Registration
const verifyWebAuthnRegistration = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const body = req.body;

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: getOrigin(req),
        expectedRPID: getRpID(req),
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;
      
      user.passkeys.push({
        credentialID: Buffer.from(credentialID).toString('base64url'),
        credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64url'),
        counter,
        transports: body.response.transports,
      });
      user.currentChallenge = undefined;
      await user.save();

      return res.json({ success: true, message: 'Passkey registered successfully' });
    }
    return res.status(400).json({ success: false, message: 'Verification failed' });
  } catch (error) {
    next(error);
  }
};

// Memory store for login challenges (In prod, use Redis or DB)
const loginChallenges = new Map();

// @desc    Generate WebAuthn Login Options
const generateWebAuthnLoginOptions = async (req, res, next) => {
  try {
    const { email } = req.query;
    let allowCredentials = [];

    // If the user provided an email, we can limit the passkey prompt to their specific credentials
    if (email) {
      const user = await User.findOne({ email });
      if (user && user.passkeys && user.passkeys.length > 0) {
        allowCredentials = user.passkeys.map(key => ({
          id: Buffer.from(key.credentialID, 'base64url'),
          type: 'public-key',
          transports: key.transports,
        }));
      }
    }

    const options = await generateAuthenticationOptions({
      rpID: getRpID(req),
      userVerification: 'preferred',
      allowCredentials,
    });

    // Store challenge globally mapped by a random session ID
    const sessionId = Math.random().toString(36).substring(7);
    loginChallenges.set(sessionId, options.challenge);
    
    // Auto cleanup after 5 mins
    setTimeout(() => loginChallenges.delete(sessionId), 5 * 60 * 1000);

    res.json({ success: true, data: { options, sessionId } });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify WebAuthn Login
const verifyWebAuthnLogin = async (req, res, next) => {
  try {
    const body = req.body;
    const { email, sessionId } = req.body.extraInfo || {};

    const expectedChallenge = loginChallenges.get(sessionId);
    if (!expectedChallenge) {
      return res.status(400).json({ success: false, message: 'Challenge expired or invalid' });
    }

    let user;
    if (email) {
      user = await User.findOne({ email });
    } else {
      // Find user by credential ID (discoverable credential)
      const credID = body.id;
      // Because base64url encoding might vary slightly, we should ideally search by credentialID string
      user = await User.findOne({ 'passkeys.credentialID': credID });
    }

    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    const passkey = user.passkeys.find(k => k.credentialID === body.id);
    if (!passkey) return res.status(400).json({ success: false, message: 'Credential not found' });

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: getOrigin(req),
        expectedRPID: getRpID(req),
        authenticator: {
          credentialID: Buffer.from(passkey.credentialID, 'base64url'),
          credentialPublicKey: Buffer.from(passkey.credentialPublicKey, 'base64url'),
          counter: passkey.counter,
          transports: passkey.transports,
        },
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (verification.verified) {
      // Consume challenge
      loginChallenges.delete(sessionId);
      
      // Update counter
      passkey.counter = verification.authenticationInfo.newCounter;
      await user.save();

      const token = generateToken(user._id);
      return res.json({
        success: true,
        message: 'Passkey login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token,
          totpVerified: user.totpVerified,
        },
      });
    }
    return res.status(400).json({ success: false, message: 'Passkey verification failed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  signup, 
  login, 
  getMe, 
  verifyTOTP,
  generateWebAuthnRegistrationOptions,
  verifyWebAuthnRegistration,
  generateWebAuthnLoginOptions,
  verifyWebAuthnLogin,
};
