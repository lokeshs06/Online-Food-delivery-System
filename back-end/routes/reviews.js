const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @desc    Add a review for a restaurant
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { restaurant: restaurantId, order: orderId, rating, comment } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    // Optional: verify order exists and belongs to user
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Associated order not found' });
      }
      if (order.customer.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'You can only review your own orders' });
      }
    }

    // Check if user already reviewed this order (if provided)
    if (orderId) {
      const existingReview = await Review.findOne({ order: orderId });
      if (existingReview) {
        return res.status(400).json({ success: false, error: 'You have already reviewed this order' });
      }
    }

    const review = await Review.create({
      user: req.user.id,
      userName: req.user.name,
      restaurant: restaurantId,
      order: orderId,
      rating,
      comment
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Add owner response to review
// @route   PUT /api/reviews/:id/response
// @access  Private (Owner/Admin)
router.put('/:id/response', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    const { response } = req.body;

    let review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    // Verify ownership of the restaurant
    const restaurant = await Restaurant.findById(review.restaurant);
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to respond to reviews for this restaurant' });
    }

    review.response = response;
    await review.save();

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get all reviews for moderation dashboard
// @route   GET /api/reviews/moderation
// @access  Private (Admin/Owner)
router.get('/moderation', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    let reviews;

    if (req.user.role === 'admin') {
      reviews = await Review.find().populate('restaurant', 'name').sort('-createdAt');
    } else {
      // Owner: only get reviews for their restaurants
      const ownedRestaurants = await Restaurant.find({ owner: req.user.id });
      const restaurantIds = ownedRestaurants.map(r => r._id);
      
      reviews = await Review.find({ restaurant: { $in: restaurantIds } })
        .populate('restaurant', 'name')
        .sort('-createdAt');
    }

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Moderate review (toggle hide/isModerated)
// @route   PUT /api/reviews/:id/moderate
// @access  Private (Admin/Owner)
router.put('/:id/moderate', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    const { isModerated } = req.body;

    let review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    // Verify permission
    const restaurant = await Restaurant.findById(review.restaurant);
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to moderate this review' });
    }

    review.isModerated = isModerated;
    await review.save();

    // Recalculate average rating
    await Review.getAverageRating(review.restaurant);

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
