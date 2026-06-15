const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/coupons
// @desc    Get all coupons (Admin)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ success: true, count: coupons.length, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   POST /api/coupons
// @desc    Create a new coupon
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, error: 'Coupon code already exists' });
    res.status(400).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/coupons/:id
// @desc    Update a coupon
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' });
    
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete a coupon
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' });
    
    await coupon.deleteOne();
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/coupons/validate/:code
// @desc    Validate a coupon code (Public/Customer)
// @access  Private
router.get('/validate/:code', protect, async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });
    
    if (!coupon) return res.status(404).json({ success: false, error: 'Invalid coupon code' });
    if (!coupon.isActive) return res.status(400).json({ success: false, error: 'Coupon is disabled' });
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return res.status(400).json({ success: false, error: 'Coupon has expired' });
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) return res.status(400).json({ success: false, error: 'Coupon usage limit reached' });

    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
