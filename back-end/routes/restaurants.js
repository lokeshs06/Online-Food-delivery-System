const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all restaurants (with filters & search)
// @route   GET /api/restaurants
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from matching
    const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'cuisine', 'minRating'];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Finding resource, filter out deleted restaurants
    let queryObj = JSON.parse(queryStr);
    queryObj.isDeleted = false;
    
    query = Restaurant.find(queryObj);

    // Name Search
    if (req.query.search) {
      query = query.find({ name: { $regex: req.query.search, $options: 'i' } });
    }

    // Cuisine filter (can be single string or array of strings)
    if (req.query.cuisine) {
      const cuisines = Array.isArray(req.query.cuisine)
        ? req.query.cuisine
        : req.query.cuisine.split(',');
      query = query.find({ cuisine: { $in: cuisines.map(c => new RegExp(`^${c.trim()}$`, 'i')) } });
    }

    // Min Rating filter
    if (req.query.minRating) {
      query = query.find({ rating: { $gte: parseFloat(req.query.minRating) } });
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-rating'); // default sort by rating descending
    }

    const restaurants = await query;
    res.status(200).json({ success: true, count: restaurants.length, data: restaurants });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get single restaurant (includes menu and reviews)
// @route   GET /api/restaurants/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, isDeleted: false });
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    // Get menu items
    const menuItems = await MenuItem.find({ restaurant: req.params.id });

    // Get reviews
    const reviews = await Review.find({ restaurant: req.params.id, isModerated: false }).sort('-createdAt');

    res.status(200).json({
      success: true,
      data: {
        restaurant,
        menuItems,
        reviews
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private (Owner/Admin)
router.post('/', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    // Add user as owner
    req.body.owner = req.user.id;

    // Check if the cuisine is array or string
    if (req.body.cuisine && typeof req.body.cuisine === 'string') {
      req.body.cuisine = req.body.cuisine.split(',').map((c) => c.trim());
    }

    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({ success: true, data: restaurant });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Owner/Admin)
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    // Make sure user is restaurant owner or admin
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to edit this restaurant' });
    }

    if (req.body.cuisine && typeof req.body.cuisine === 'string') {
      req.body.cuisine = req.body.cuisine.split(',').map((c) => c.trim());
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: restaurant });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Owner/Admin)
router.delete('/:id', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    // Make sure user is owner or admin
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this restaurant' });
    }

    // Soft delete: Mark as deleted and inactive
    restaurant.isDeleted = true;
    restaurant.isActive = false;
    await restaurant.save();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
