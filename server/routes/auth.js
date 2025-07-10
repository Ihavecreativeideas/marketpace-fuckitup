const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { sendEmail } = require('../services/email');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// Validation middleware
const validateRegistration = [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Register
router.post('/register', authLimiter, validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      businessAccount,
      businessName,
      businessType,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists',
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: businessAccount ? 'business' : 'user',
      businessProfile: businessAccount ? {
        businessName,
        businessType,
        isActive: false,
      } : null,
      emailVerified: false,
      isActive: true,
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Send verification email
    const verificationToken = jwt.sign(
      { userId: user._id, type: 'email_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await sendEmail({
      to: user.email,
      subject: 'Welcome to MarketPace - Verify Your Email',
      template: 'email-verification',
      data: {
        firstName: user.firstName,
        verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
      },
    });

    // Return user data (without sensitive fields)
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      businessProfile: user.businessProfile,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      message: 'Account created successfully',
      user: userData,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration',
    });
  }
});

// Login
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account suspended',
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token
    user.refreshTokens.push(refreshToken);
    user.lastLogin = new Date();
    await user.save();

    // Return user data (without sensitive fields)
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      businessProfile: user.businessProfile,
      isAdmin: user.isAdmin,
      isDriver: user.isDriver,
      profileImage: user.profileImage,
      address: user.address,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      createdAt: user.createdAt,
    };

    res.json({
      message: 'Login successful',
      user: userData,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login',
    });
  }
});

// Guest login
router.post('/guest', async (req, res) => {
  try {
    // Create temporary guest user
    const guestUser = {
      id: `guest_${Date.now()}`,
      firstName: 'Guest',
      lastName: 'User',
      email: null,
      role: 'guest',
      isGuest: true,
      emailVerified: false,
      createdAt: new Date(),
    };

    // Generate tokens for guest (shorter expiry)
    const accessToken = jwt.sign(
      { userId: guestUser.id, isGuest: true },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Guest login successful',
      user: guestUser,
      accessToken,
      refreshToken: null,
    });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({
      error: 'Guest login failed',
      message: 'An error occurred during guest login',
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
        message: 'No refresh token provided',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Refresh token is invalid or expired',
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      error: 'Token refresh failed',
      message: 'Invalid or expired refresh token',
    });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user) {
      const { refreshToken } = req.body;
      if (refreshToken) {
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();
      }
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'An error occurred during logout',
    });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found',
      });
    }

    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      businessProfile: user.businessProfile,
      isAdmin: user.isAdmin,
      isDriver: user.isDriver,
      profileImage: user.profileImage,
      address: user.address,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      bio: user.bio,
      settings: user.settings,
      createdAt: user.createdAt,
    };

    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: 'An error occurred while fetching user data',
    });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zipCode',
      'bio', 'profileImage', 'settings'
    ];

    // Filter allowed updates
    const filteredUpdates = {};
    allowedUpdates.forEach(key => {
      if (updates.hasOwnProperty(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.userId,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found',
      });
    }

    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      businessProfile: user.businessProfile,
      isAdmin: user.isAdmin,
      isDriver: user.isDriver,
      profileImage: user.profileImage,
      address: user.address,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      bio: user.bio,
      settings: user.settings,
      createdAt: user.createdAt,
    };

    res.json({
      message: 'Profile updated successfully',
      user: userData,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'An error occurred while updating profile',
    });
  }
});

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'New password must be at least 8 characters long',
      });
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Invalid current password',
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedNewPassword;
    user.refreshTokens = []; // Invalidate all refresh tokens
    await user.save();

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'An error occurred while changing password',
    });
  }
});

// Email verification
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token required',
        message: 'Verification token is required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'email_verification') {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Invalid verification token',
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found',
      });
    }

    user.emailVerified = true;
    await user.save();

    res.json({
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Email verification failed',
      message: 'An error occurred during email verification',
    });
  }
});

// Delete account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found',
      });
    }

    // Soft delete - mark as inactive instead of removing
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.refreshTokens = [];
    await user.save();

    res.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Account deletion failed',
      message: 'An error occurred while deleting account',
    });
  }
});

module.exports = router;
