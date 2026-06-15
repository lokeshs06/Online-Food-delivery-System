const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a menu item name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category (e.g. Appetizers, Mains, Drinks, Desserts)']
  },
  imageUrl: {
    type: String,
    default: 'no-food-photo.jpg'
  },
  nutritionalInfo: {
    calories: { type: Number, default: 0 },
    protein: { type: String, default: '0g' },
    carbs: { type: String, default: '0g' },
    fat: { type: String, default: '0g' },
    allergens: { type: [String], default: [] }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
