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

    if (user.totpSecret) {
      if (!totpCode) {
        return res.json({ success: true, require2FA: true, message: '2FA code required' });
      }

      const sanitizedToken = String(totpCode).replace(/\s+/g, '');
      const verified = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: sanitizedToken,
        window: 2,
      });

      if (!verified) {
        // Check if it's a valid recovery code
        if (user.recoveryCodes && user.recoveryCodes.includes(sanitizedToken)) {
          // Consume the recovery code
          user.recoveryCodes = user.recoveryCodes.filter((c) => c !== sanitizedToken);
          await user.save();
        } else {
          return res.status(400).json({ success: false, message: 'Invalid 2FA code' });
        }
      }
    }

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

module.exports = { signup, login, getMe, verifyTOTP };
