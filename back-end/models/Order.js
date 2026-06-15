const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [
    {
      menuItem: {
        type: mongoose.Schema.ObjectId,
        ref: 'MenuItem',
        required: true
      },
      name: String, // cache item name for convenience
      price: Number, // cache item price
      quantity: {
        type: Number,
        required: true,
        default: 1
      },
      customizations: {
        extras: [String],
        specialInstructions: String
      }
    }
  ],
  deliveryAddress: {
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    houseNumber: { type: String, required: true },
    street: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pinCode: { type: String, required: true },
    landmark: { type: String },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'card'
  },
  deliveryType: {
    type: String,
    enum: ['immediate', 'scheduled'],
    default: 'immediate'
  },
  scheduledTime: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  couponCode: {
    type: String
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
