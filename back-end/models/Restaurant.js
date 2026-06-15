const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a restaurant name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  cuisine: {
    type: [String],
    required: [true, 'Please add at least one cuisine type']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  hours: {
    open: { type: String, required: true, default: '09:00 AM' },
    close: { type: String, required: true, default: '10:00 PM' }
  },
  imageUrl: {
    type: String,
    default: 'no-photo.jpg'
  },
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    default: '$$'
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 4.0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isAcceptingOrders: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
