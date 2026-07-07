const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Review = require('../models/Review');
const Offer = require('../models/Offer');
const Coupon = require('../models/Coupon');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');
const { exec } = require('child_process');
const path = require('path');

router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/analytics
// @desc    Get platform-wide analytics
// @access  Private/Admin
router.get('/analytics', async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalOwners = await User.countDocuments({ role: 'restaurant_owner' });
    const totalRestaurants = await Restaurant.countDocuments({ isDeleted: false });
    const activeRestaurants = await Restaurant.countDocuments({ isActive: true, isApproved: true, isDeleted: false });
    const pendingRestaurants = await Restaurant.countDocuments({ isApproved: false, isDeleted: false });
    
    const orders = await Order.find();
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    
    // Calculate total platform revenue from delivered orders
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((acc, order) => acc + order.totalAmount, 0);

    // Calculate revenue for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    
    const monthlyRevenue = orders
      .filter(o => o.status === 'delivered' && new Date(o.createdAt) >= startOfMonth)
      .reduce((acc, order) => acc + order.totalAmount, 0);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalOwners,
        totalRestaurants,
        activeRestaurants,
        pendingRestaurants,
        totalOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        monthlyRevenue
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (filtered by role optionally)
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const query = {};
    if (req.query.role) query.role = req.query.role;
    
    const users = await User.find(query).select('-password').sort('-createdAt');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   PUT /api/admin/users/:id/toggle-block
// @desc    Block or unblock a user
// @access  Private/Admin
router.put('/users/:id/toggle-block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, error: 'Cannot block admin' });

    user.isBlocked = !user.isBlocked;
    await user.save();
    
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, error: 'Cannot delete admin' });

    await user.deleteOne();
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/admin/restaurants
// @desc    Get all restaurants for admin management
// @access  Private/Admin
router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isDeleted: false }).populate('owner', 'name email').sort('-createdAt');
    res.json({ success: true, count: restaurants.length, data: restaurants });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   PUT /api/admin/restaurants/:id/toggle-approval
// @desc    Approve or unapprove a restaurant
// @access  Private/Admin
router.put('/restaurants/:id/toggle-approval', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, error: 'Restaurant not found' });

    restaurant.isApproved = !restaurant.isApproved;
    await restaurant.save();
    
    res.json({ success: true, data: restaurant });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   PUT /api/admin/restaurants/:id/toggle-active
// @desc    Suspend or activate a restaurant
// @access  Private/Admin
router.put('/restaurants/:id/toggle-active', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, error: 'Restaurant not found' });

    restaurant.isActive = !restaurant.isActive;
    await restaurant.save();
    
    res.json({ success: true, data: restaurant });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders for monitoring
// @access  Private/Admin
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('restaurant', 'name')
      .sort('-createdAt');
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/admin/system/backup
// @desc    Export a JSON backup of all database collections
// @access  Private/Admin
router.get('/system/backup', async (req, res) => {
  try {
    console.log(`[AUDIT LOG] ${new Date().toISOString()} - Admin user ${req.user.id} requested: Database Backup`);
    
    const [
      users, restaurants, orders, menuItems, reviews, offers, coupons, categories
    ] = await Promise.all([
      User.find(), Restaurant.find(), Order.find(), MenuItem.find(),
      Review.find(), Offer.find(), Coupon.find(), Category.find()
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      data: { users, restaurants, orders, menuItems, reviews, offers, coupons, categories }
    };

    const filename = `ofds-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify(backupData, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate backup' });
  }
});

// @route   POST /api/admin/system/clear-cache
// @desc    Clear system cache (Placeholder for Redis)
// @access  Private/Admin
router.post('/system/clear-cache', async (req, res) => {
  try {
    console.log(`[AUDIT LOG] ${new Date().toISOString()} - Admin user ${req.user.id} requested: Clear System Cache`);
    
    // Future integration point for Redis or memory caching.
    // e.g. await redisClient.flushall();

    res.json({ success: true, message: 'System cache cleared successfully (placeholder)' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to clear cache' });
  }
});

// @route   POST /api/admin/system/seed
// @desc    Wipe database and seed demo data (Dev/Test ONLY)
// @access  Private/Admin
router.post('/system/seed', async (req, res) => {
  try {
    console.log(`[AUDIT LOG] ${new Date().toISOString()} - Admin user ${req.user.id} requested: Seed Demo Data`);
    
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
      console.warn(`[AUDIT LOG] Action BLOCKED: Attempted to seed demo data in production environment.`);
      return res.status(403).json({ success: false, error: 'Action forbidden in production environment' });
    }

    const seederPath = path.join(__dirname, '..', 'seeds', 'seeder.js');
    
    exec(`node ${seederPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Seed execution error: ${error}`);
        return res.status(500).json({ success: false, error: 'Failed to execute seed script' });
      }
      
      console.log(`Seed script output: ${stdout}`);
      if (stderr) console.error(`Seed script stderr: ${stderr}`);

      res.json({ success: true, message: 'Database reset and seeded with demo data successfully' });
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to seed database' });
  }
});

module.exports = router;
