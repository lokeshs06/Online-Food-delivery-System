const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const Restaurant = require('../models/Restaurant');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all active offers (Public)
// @route   GET /api/offers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const query = { isActive: true, endDate: { $gte: new Date() } };
    
    if (req.query.restaurant) {
      query.restaurant = req.query.restaurant;
    }

    const offers = await Offer.find(query).populate('restaurant', 'name imageUrl categories');

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Get all offers (Admin only)
// @route   GET /api/offers/admin
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('restaurant', 'name')
      .populate('owner', 'name email');

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Get offers for logged-in owner
// @route   GET /api/offers/owner
// @access  Private/Owner
router.get('/owner', protect, authorize('restaurant_owner'), async (req, res) => {
  try {
    const offers = await Offer.find({ owner: req.user.id })
      .populate('restaurant', 'name');

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Create new offer
// @route   POST /api/offers
// @access  Private/Owner
router.post('/', protect, authorize('restaurant_owner'), async (req, res) => {
  try {
    // Check if the user owns the restaurant
    const restaurant = await Restaurant.findById(req.body.restaurant);
    
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to add offer to this restaurant' });
    }

    req.body.owner = req.user.id;
    const offer = await Offer.create(req.body);

    res.status(201).json({
      success: true,
      data: offer
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Update offer
// @route   PUT /api/offers/:id
// @access  Private/Owner or Admin
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    let offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, error: 'Offer not found' });
    }

    // Make sure user is offer owner
    if (offer.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to update this offer' });
    }

    offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: offer
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Private/Owner or Admin
router.delete('/:id', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, error: 'Offer not found' });
    }

    // Make sure user is offer owner
    if (offer.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this offer' });
    }

    await offer.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
