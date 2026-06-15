const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'restaurant_owner', 'admin'],
    default: 'customer'
  },
  favorites: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Restaurant'
    }
  ],
  favoriteItems: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'MenuItem'
    }
  ],
  savedPaymentMethods: [
    {
      cardholderName: String,
      cardNumberLast4: String,
      expiryDate: String,
      cardType: String,
      token: String
    }
  ],
  savedAddresses: [
    {
      label: String, // e.g. "Home", "Work"
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
      longitude: { type: Number },
      isDefault: { type: Boolean, default: false }
    }
  ],
  isBlocked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
