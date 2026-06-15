const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper to sign JWT token
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'supersecretjwtkeyforofdsapplication123456!',
    { expiresIn: '30d' }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      favorites: user.favorites,
      savedPaymentMethods: user.savedPaymentMethods
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role: role || 'customer'
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favorites')
      .populate({
        path: 'favoriteItems',
        populate: { path: 'restaurant', select: 'name' }
      });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Update user details
// @route   PUT /api/auth/me
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Toggle restaurant favorite
// @route   POST /api/auth/favorites/:restaurantId
// @access  Private
router.post('/favorites/:restaurantId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const index = user.favorites.indexOf(req.params.restaurantId);

    if (index > -1) {
      // Remove
      user.favorites.splice(index, 1);
    } else {
      // Add
      user.favorites.push(req.params.restaurantId);
    }

    await user.save();
    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Toggle menu item favorite
// @route   POST /api/auth/favorite-items/:itemId
// @access  Private
router.post('/favorite-items/:itemId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const index = user.favoriteItems.indexOf(req.params.itemId);

    if (index > -1) {
      // Remove
      user.favoriteItems.splice(index, 1);
    } else {
      // Add
      user.favoriteItems.push(req.params.itemId);
    }

    await user.save();
    res.status(200).json({ success: true, favoriteItems: user.favoriteItems });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Add saved payment method
// @route   POST /api/auth/payments
// @access  Private
router.post('/payments', protect, async (req, res) => {
  try {
    const { cardholderName, cardNumberLast4, expiryDate, cardType } = req.body;

    const user = await User.findById(req.user.id);
    user.savedPaymentMethods.push({
      cardholderName,
      cardNumberLast4,
      expiryDate,
      cardType,
      token: 'mock_tok_' + Math.random().toString(36).substring(7)
    });

    await user.save();
    res.status(200).json({ success: true, savedPaymentMethods: user.savedPaymentMethods });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Please provide current and new password' });
    }
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Update saved addresses
// @route   PUT /api/auth/addresses
// @access  Private
router.put('/addresses', protect, async (req, res) => {
  try {
    const { savedAddresses } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { savedAddresses },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, savedAddresses: user.savedAddresses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Toggle favorite menu item
// @route   POST /api/auth/favorite-items/:itemId
// @access  Private
router.post('/favorite-items/:itemId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const idx = user.favoriteItems.indexOf(req.params.itemId);
    if (idx > -1) {
      user.favoriteItems.splice(idx, 1);
    } else {
      user.favoriteItems.push(req.params.itemId);
    }
    await user.save();
    res.status(200).json({ success: true, favoriteItems: user.favoriteItems });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
