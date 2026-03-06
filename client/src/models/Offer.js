const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  code: { type: String, unique: true, uppercase: true },
  discountType: { type: String, enum: ['Percentage', 'Flat'], default: 'Flat' },
  discountValue: { type: Number, required: true },
  minBookingAmount: { type: Number, default: 0 },
  maxDiscount: Number,
  validFrom: Date,
  validTill: Date,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  applicableRoutes: [{ from: String, to: String }],
  bannerImage: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
