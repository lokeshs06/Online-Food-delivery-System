const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { protect, authorize } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { restaurant: restaurantId, items, paymentMethod, paymentIntentId, deliveryType, scheduledTime, coupon, deliveryAddress, useWallet } = req.body;

    if (!deliveryAddress) {
      return res.status(400).json({ success: false, error: 'Please provide a delivery address' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Please add items to your cart' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    // Calculate total price
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const dbItem = await MenuItem.findById(item.menuItem);
      if (!dbItem) {
        return res.status(404).json({ success: false, error: `Menu item ${item.menuItem} not found` });
      }

      const itemPrice = dbItem.price;
      const quantity = item.quantity || 1;
      
      // Calculate any customizations
      let customizationCost = 0;
      if (item.customizations && item.customizations.extras) {
        // Simple pricing logic: each extra is $1.50
        customizationCost = item.customizations.extras.length * 1.5;
      }

      const itemTotal = (itemPrice + customizationCost) * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItem: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        quantity,
        customizations: item.customizations || {}
      });
    }

    // Taxes & Delivery Fee
    const deliveryFee = deliveryType === 'immediate' ? 3.99 : 1.99;
    const tax = totalAmount * 0.08; // 8% tax

    // Coupon calculation
    let discountAmount = 0;
    let appliedCoupon = null;

    if (coupon) {
      const dbCoupon = await Coupon.findOne({ code: coupon.toUpperCase(), isActive: true });
      if (dbCoupon) {
        // Validate expiry and limits
        let isValid = true;
        if (dbCoupon.expiryDate && new Date() > dbCoupon.expiryDate) isValid = false;
        if (dbCoupon.usageLimit && dbCoupon.timesUsed >= dbCoupon.usageLimit) isValid = false;

        if (isValid) {
          appliedCoupon = dbCoupon;
          if (dbCoupon.discountType === 'percentage') {
            discountAmount = totalAmount * (dbCoupon.discountAmount / 100);
          } else {
            discountAmount = dbCoupon.discountAmount;
          }
          if (discountAmount > totalAmount) discountAmount = totalAmount; // Cap discount
        }
      }
    }

    const grandTotal = Math.round((totalAmount + deliveryFee + tax - discountAmount) * 100) / 100;

    let payableAmount = grandTotal;
    let walletAmountUsed = 0;
    const customerUser = await User.findById(req.user.id);
    let walletBalance = customerUser.walletBalance || 0;

    if (useWallet) {
      if (walletBalance >= grandTotal) {
        walletAmountUsed = grandTotal;
        payableAmount = 0;
      } else {
        walletAmountUsed = walletBalance;
        payableAmount = Math.round((grandTotal - walletBalance) * 100) / 100;
        walletAmountUsed = walletBalance;
        
        // Stripe minimum charge is 0.50
        if (payableAmount > 0 && payableAmount < 0.50) {
          payableAmount = 0.50;
          walletAmountUsed = Math.max(0, grandTotal - 0.50);
        }
      }
    } else if (payableAmount > 0 && payableAmount < 0.50) {
      payableAmount = 0.50;
    }

    // Verify Stripe payment intent if paying by card (and if a card payment was actually required)
    if ((paymentMethod === 'card' || !paymentMethod) && paymentIntentId && payableAmount > 0) {
      try {
        // Prevent duplicate orders with the same payment intent
        const existingOrder = await Order.findOne({ paymentIntentId });
        if (existingOrder) {
          return res.status(400).json({ success: false, error: 'Order for this payment already exists' });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
          return res.status(400).json({ success: false, error: 'Payment has not succeeded' });
        }
        if (paymentIntent.amount !== Math.round(payableAmount * 100)) {
          return res.status(400).json({ success: false, error: 'Payment amount mismatch' });
        }
      } catch (err) {
        return res.status(400).json({ success: false, error: 'Invalid PaymentIntent' });
      }
    } else if ((paymentMethod === 'card' || !paymentMethod) && !paymentIntentId && payableAmount > 0) {
      return res.status(400).json({ success: false, error: 'Payment intent ID is required for card payments' });
    }

    let finalPaymentMethod = paymentMethod || 'card';
    if (useWallet && payableAmount === 0) {
      finalPaymentMethod = 'wallet';
    }

    // Create Order
    const order = await Order.create({
      customer: req.user.id,
      restaurant: restaurantId,
      items: orderItems,
      totalAmount: grandTotal,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      discountAmount: discountAmount,
      walletAmountUsed: walletAmountUsed,
      paymentMethod: finalPaymentMethod,
      paymentIntentId: paymentIntentId,
      paymentStatus: finalPaymentMethod === 'cod' ? 'pending' : 'paid', // For card/wallet, payment is secured
      deliveryType: deliveryType || 'immediate',
      scheduledTime: deliveryType === 'scheduled' ? new Date(scheduledTime) : undefined,
      deliveryAddress: {
        fullName: deliveryAddress?.fullName || req.user.name || 'Customer',
        mobileNumber: deliveryAddress?.mobileNumber || 'N/A',
        houseNumber: deliveryAddress?.houseNumber || 'N/A',
        street: deliveryAddress?.street || deliveryAddress?.address || 'N/A',
        area: deliveryAddress?.area || 'N/A',
        city: deliveryAddress?.city || 'N/A',
        state: deliveryAddress?.state || 'N/A',
        country: deliveryAddress?.country || 'N/A',
        pinCode: deliveryAddress?.pinCode || 'N/A',
        landmark: deliveryAddress?.landmark || '',
        latitude: deliveryAddress?.latitude || null,
        longitude: deliveryAddress?.longitude || null,
      },
      status: 'pending'
    });

    // Update coupon usage if applicable
    if (appliedCoupon) {
      appliedCoupon.timesUsed += 1;
      await appliedCoupon.save();
    }

    // Deduct wallet balance
    if (walletAmountUsed > 0) {
      customerUser.walletBalance -= walletAmountUsed;
      await customerUser.save();
    }

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get orders (User's order history, or Restaurant Owner's orders)
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let orders;

    if (req.user.role === 'restaurant_owner') {
      // Find restaurants owned by this user
      const ownedRestaurants = await Restaurant.find({ owner: req.user.id });
      const restaurantIds = ownedRestaurants.map(r => r._id);

      orders = await Order.find({ restaurant: { $in: restaurantIds } })
        .populate('customer', 'name email')
        .populate('restaurant', 'name location')
        .sort('-createdAt');
    } else if (req.user.role === 'admin') {
      orders = await Order.find()
        .populate('customer', 'name email')
        .populate('restaurant', 'name location')
        .sort('-createdAt');
    } else {
      // Regular customer
      orders = await Order.find({ customer: req.user.id })
        .populate('restaurant', 'name location imageUrl')
        .sort('-createdAt');
    }

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('restaurant', 'name location imageUrl description');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Verify permission (customer, owner, or admin)
    const isCustomer = order.customer._id.toString() === req.user.id;
    
    let isOwner = false;
    if (req.user.role === 'restaurant_owner') {
      const restaurant = await Restaurant.findById(order.restaurant);
      if (restaurant && restaurant.owner.toString() === req.user.id) {
        isOwner = true;
      }
    }

    if (!isCustomer && !isOwner && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Owner/Admin)
router.put('/:id/status', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'accepted', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid order status' });
    }

    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Validate ownership
    const restaurant = await Restaurant.findById(order.restaurant);
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to update this order' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, error: 'Order is already delivered and cannot be modified' });
    }

    order.status = status;
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
      order.deliveredAt = Date.now();
    } else if (status === 'cancelled' && order.paymentStatus === 'paid') {
      const customer = await User.findById(order.customer);
      if (customer) {
        customer.walletBalance = (customer.walletBalance || 0) + order.totalAmount;
        await customer.save();
        order.paymentStatus = 'refunded_to_wallet';
      }
    }
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Cancel an order (Customer only)
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Only the customer who placed the order can cancel
    if (order.customer.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to cancel this order' });
    }

    // Only allow cancellation if status is pending or accepted
    const cancellableStatuses = ['pending', 'accepted'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel order with status "${order.status}". Orders can only be cancelled when Pending or Accepted.`
      });
    }

    order.status = 'cancelled';
    
    if (order.paymentStatus === 'paid') {
      const customer = await User.findById(order.customer);
      if (customer) {
        customer.walletBalance = (customer.walletBalance || 0) + order.totalAmount;
        await customer.save();
        order.paymentStatus = 'refunded_to_wallet';
      }
    }
    
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



module.exports = router;
