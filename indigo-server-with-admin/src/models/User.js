const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  phone: { type: String, trim: true },
  dateOfBirth: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  nationality: { type: String, default: 'Indian' },
  passportNumber: String,
  passportExpiry: Date,
  loyaltyPoints: { type: Number, default: 0 },
  tier: { type: String, enum: ['Blue', 'Silver', 'Gold', 'Platinum'], default: 'Blue' },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  savedPayments: [{
    cardLast4: String,
    cardType: String,
    expiry: String
  }],
  preferences: {
    seat: { type: String, enum: ['Window', 'Middle', 'Aisle'], default: 'Window' },
    meal: { type: String, enum: ['Veg', 'Non-Veg', 'Jain', 'None'], default: 'None' },
    newsletter: { type: Boolean, default: true }
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  profilePic: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Virtual: full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
