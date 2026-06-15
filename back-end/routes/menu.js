const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { protect, authorize } = require('../middleware/auth');

// @desc    Add menu item to restaurant
// @route   POST /api/menu
// @access  Private (Owner/Admin)
router.post('/', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    const { restaurant: restaurantId } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    // Check ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to add menu items to this restaurant' });
    }

    const menuItem = await MenuItem.create(req.body);
    res.status(201).json({ success: true, data: menuItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Owner/Admin)
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    let menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    const restaurant = await Restaurant.findById(menuItem.restaurant);
    // Check ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to edit this menu item' });
    }

    menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: menuItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private (Owner/Admin)
router.delete('/:id', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    const restaurant = await Restaurant.findById(menuItem.restaurant);
    // Check ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this menu item' });
    }

    await menuItem.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
