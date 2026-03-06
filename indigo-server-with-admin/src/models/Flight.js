const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, unique: true },
  airline: { type: String, default: 'IndiGo' },
  aircraft: { type: String, default: 'Airbus A320' },
  origin: {
    code: { type: String, required: true, uppercase: true },
    city: { type: String, required: true },
    airport: { type: String, required: true },
    terminal: String,
  },
  destination: {
    code: { type: String, required: true, uppercase: true },
    city: { type: String, required: true },
    airport: { type: String, required: true },
    terminal: String,
  },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  duration: { type: Number }, // in minutes
  stops: { type: Number, default: 0 },
  via: [{
    code: String,
    city: String,
    layoverMinutes: Number
  }],
  seats: {
    total: { type: Number, default: 180 },
    available: {
      economy: { type: Number, default: 150 },
      business: { type: Number, default: 30 }
    }
  },
  price: {
    economy: {
      base: { type: Number, required: true },
      taxes: { type: Number, default: 0 },
    },
    business: {
      base: { type: Number, required: true },
      taxes: { type: Number, default: 0 },
    }
  },
  baggage: {
    economy: { cabin: { type: Number, default: 7 }, checkin: { type: Number, default: 15 } },
    business: { cabin: { type: Number, default: 10 }, checkin: { type: Number, default: 25 } }
  },
  status: {
    type: String,
    enum: ['Scheduled', 'On Time', 'Delayed', 'Boarding', 'Departed', 'Arrived', 'Cancelled'],
    default: 'Scheduled'
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Auto-calculate duration
flightSchema.pre('save', function (next) {
  if (this.departureTime && this.arrivalTime) {
    this.duration = Math.round((this.arrivalTime - this.departureTime) / 60000);
  }
  next();
});

// Virtual: formatted duration
flightSchema.virtual('formattedDuration').get(function () {
  const h = Math.floor(this.duration / 60);
  const m = this.duration % 60;
  return `${h}h ${m}m`;
});

flightSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Flight', flightSchema);
