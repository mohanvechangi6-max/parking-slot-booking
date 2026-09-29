const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const signToken = (userId) => jwt.sign(
  { id: userId },
  process.env.JWT_SECRET || 'development-secret',
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
);

const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password;
  return userObject;
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with that email already exists.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    return res.status(201).json({
      success: true,
      token: signToken(user._id.toString()),
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with that email already exists.',
      });
    }

    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    const passwordMatches = user && await user.comparePassword(password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    return res.status(200).json({
      success: true,
      token: signToken(user._id.toString()),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getMe = async (req, res) => res.status(200).json({
  success: true,
  user: sanitizeUser(req.user),
});

const requestPasswordReset = async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const response = {
      success: true,
      message: 'If an account exists for that email, a password reset link is ready.',
    };
    const user = email ? await User.findOne({ email }) : null;
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      // The app has no email provider configured. Expose a link only for local development.
      if (process.env.NODE_ENV !== 'production') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        response.resetUrl = `${frontendUrl}/forgot-password?token=${resetToken}`;
      }
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to start password reset.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (typeof token !== 'string' || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'A valid reset link and a password of at least 6 characters are required.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetExpiresAt +password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'This password reset link is invalid or expired. Request a new one.' });
    }

    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
    return res.status(200).json({ success: true, message: 'Password updated. You can now log in.' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Unable to reset your password.' });
  }
};

module.exports = { register, login, getMe, requestPasswordReset, resetPassword };
