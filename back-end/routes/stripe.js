const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const { protect } = require('../middleware/auth');
const MenuItem = require('../models/MenuItem');
const Coupon = require('../models/Coupon');

// @desc    Create Stripe Payment Intent
// @route   POST /api/stripe/create-payment-intent
// @access  Private
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { items, deliveryType, coupon, useWallet } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Please add items to your cart' });
    }

    let totalAmount = 0;

    for (const item of items) {
      const dbItem = await MenuItem.findById(item.menuItem || item.item?._id);
      if (!dbItem) {
        return res.status(404).json({ success: false, error: `Menu item not found` });
      }

      const itemPrice = dbItem.price;
      const quantity = item.quantity || 1;
      
      // Calculate any customizations
      let customizationCost = 0;
      if (item.customizations && item.customizations.extras) {
        customizationCost = item.customizations.extras.length * 1.5;
      }

      const itemTotal = (itemPrice + customizationCost) * quantity;
      totalAmount += itemTotal;
    }

    // Taxes & Delivery Fee
    const deliveryFee = deliveryType === 'immediate' ? 3.99 : 1.99;
    const tax = totalAmount * 0.08; // 8% tax

    // Coupon calculation
    let discountAmount = 0;

    if (coupon) {
      const dbCoupon = await Coupon.findOne({ code: coupon.toUpperCase(), isActive: true });
      if (dbCoupon) {
        // Validate expiry and limits
        let isValid = true;
        if (dbCoupon.expiryDate && new Date() > dbCoupon.expiryDate) isValid = false;
        if (dbCoupon.usageLimit && dbCoupon.timesUsed >= dbCoupon.usageLimit) isValid = false;

        if (isValid) {
          if (dbCoupon.discountType === 'percentage') {
            discountAmount = totalAmount * (dbCoupon.discountAmount / 100);
          } else {
            discountAmount = dbCoupon.discountAmount;
          }
          if (discountAmount > totalAmount) discountAmount = totalAmount; // Cap discount
        }
      }
    }

    let grandTotal = Math.round((totalAmount + deliveryFee + tax - discountAmount) * 100) / 100;

    let payableAmount = grandTotal;
    if (useWallet) {
      const User = require('../models/User');
      const customer = await User.findById(req.user.id);
      const walletBalance = customer.walletBalance || 0;
      payableAmount = Math.max(0, grandTotal - walletBalance);
      payableAmount = Math.round(payableAmount * 100) / 100;
      
      // Stripe requires a minimum of 50 cents for USD transactions
      if (payableAmount > 0 && payableAmount < 0.50) {
        payableAmount = 0.50;
      }
    } else if (payableAmount > 0 && payableAmount < 0.50) {
      payableAmount = 0.50;
    }

    if (payableAmount === 0) {
      return res.send({
        success: true,
        paidByWallet: true,
        remainingAmount: 0
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(payableAmount * 100), // Stripe takes amounts in cents
      currency: 'usd',
      metadata: {
        customer: req.user.id
      }
    });

    res.send({
      success: true,
      paidByWallet: false,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
