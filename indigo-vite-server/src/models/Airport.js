import mongoose from 'mongoose';

const airportSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  countryCode: String,
  timezone: String,
  lat: Number,
  lng: Number,
  terminals: [String],
  isActive: { type: Boolean, default: true },
  popular: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Airport', airportSchema);
