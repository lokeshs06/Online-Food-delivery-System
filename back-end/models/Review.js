const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment']
  },
  response: {
    type: String,
    default: ''
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate average rating of restaurant after a review is saved/removed
ReviewSchema.statics.getAverageRating = async function(restaurantId) {
  const obj = await this.aggregate([
    {
      $match: { restaurant: restaurantId, isModerated: false }
    },
    {
      $group: {
        _id: '$restaurant',
        averageRating: { $avg: '$rating' },
        reviewsCount: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      await this.model('Restaurant').findByIdAndUpdate(restaurantId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
        reviewsCount: obj[0].reviewsCount
      });
    } else {
      await this.model('Restaurant').findByIdAndUpdate(restaurantId, {
        rating: 4.0,
        reviewsCount: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.restaurant);
});

// Call getAverageRating before remove
ReviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.restaurant);
});

module.exports = mongoose.model('Review', ReviewSchema);
