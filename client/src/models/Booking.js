const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const passengerSchema = new mongoose.Schema({
  title: { type: String, enum: ['Mr', 'Mrs', 'Ms', 'Dr', 'Master', 'Miss'] },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: Date,
  gender: String,
  nationality: String,
  passportNumber: String,
  passportExpiry: Date,
  type: { type: String, enum: ['Adult', 'Child', 'Infant'], default: 'Adult' },
  seatNumber: String,
  mealPreference: { type: String, enum: ['Veg', 'Non-Veg', 'Jain', 'None'], default: 'None' },
  baggageExtra: { type: Number, default: 0 } // extra kg
});

const bookingSchema = new mongoose.Schema({
  pnr: {
    type: String,
    unique: true,
    default: () => uuidv4().substring(0, 6).toUpperCase()
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  trip: {
    type: { type: String, enum: ['One Way', 'Round Trip', 'Multi City'], default: 'One Way' },
    outbound: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
    return: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' }
  },
  passengers: [passengerSchema],
  class: { type: String, enum: ['Economy', 'Business'], default: 'Economy' },
  pricing: {
    baseFare: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    addons: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  addons: {
    extraBaggage: { type: Boolean, default: false },
    mealPlan: { type: Boolean, default: false },
    seatSelection: { type: Boolean, default: false },
    travelInsurance: { type: Boolean, default: false },
    priorityBoarding: { type: Boolean, default: false }
  },
  payment: {
    method: String,
    transactionId: String,
    status: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'No Show'],
    default: 'Pending'
  },
  cancellationReason: String,
  checkInStatus: { type: Boolean, default: false },
  boardingPass: String, // URL or data
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
