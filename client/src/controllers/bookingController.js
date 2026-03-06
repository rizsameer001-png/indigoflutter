const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const User = require('../models/User');

// @desc Create booking
exports.createBooking = async (req, res) => {
  const { flightId, returnFlightId, passengers, class: cabinClass, contactEmail, contactPhone, addons, promoCode } = req.body;

  try {
    const flight = await Flight.findById(flightId);
    if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });

    // Calculate pricing
    const priceKey = (cabinClass || 'Economy').toLowerCase();
    const passengerCount = passengers.filter(p => p.type !== 'Infant').length;
    const baseFare = flight.price[priceKey].base * passengerCount;
    const taxes = flight.price[priceKey].taxes * passengerCount;
    let addonsTotal = 0;
    if (addons?.extraBaggage) addonsTotal += 599 * passengerCount;
    if (addons?.mealPlan) addonsTotal += 299 * passengerCount;
    if (addons?.seatSelection) addonsTotal += 199 * passengerCount;
    if (addons?.travelInsurance) addonsTotal += 499 * passengerCount;
    if (addons?.priorityBoarding) addonsTotal += 199 * passengerCount;

    const total = baseFare + taxes + addonsTotal;

    const bookingData = {
      user: req.user?._id,
      contactEmail,
      contactPhone,
      trip: {
        type: returnFlightId ? 'Round Trip' : 'One Way',
        outbound: flightId,
        return: returnFlightId || undefined
      },
      passengers,
      class: cabinClass || 'Economy',
      pricing: { baseFare, taxes, addons: addonsTotal, total },
      addons: addons || {},
      status: 'Pending'
    };

    const booking = await Booking.create(bookingData);

    // Update seat availability
    const seatKey = priceKey === 'economy' ? 'economy' : 'business';
    await Flight.findByIdAndUpdate(flightId, {
      $inc: { [`seats.available.${seatKey}`]: -passengerCount }
    });

    // Update user bookings
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { bookings: booking._id },
        $inc: { loyaltyPoints: Math.floor(total / 100) }
      });
    }

    const populated = await Booking.findById(booking._id)
      .populate('trip.outbound')
      .populate('trip.return');

    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Confirm payment & confirm booking
exports.confirmPayment = async (req, res) => {
  const { bookingId, paymentMethod, transactionId } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.payment = { method: paymentMethod, transactionId, status: 'Paid', paidAt: new Date() };
    booking.status = 'Confirmed';
    await booking.save();

    res.json({ success: true, booking, message: 'Booking confirmed! PNR: ' + booking.pnr });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get booking by PNR
exports.getBookingByPNR = async (req, res) => {
  try {
    const booking = await Booking.findOne({ pnr: req.params.pnr.toUpperCase() })
      .populate('trip.outbound')
      .populate('trip.return')
      .populate('user', 'firstName lastName email');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('trip.outbound')
      .populate('trip.return')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Cancel booking
exports.cancelBooking = async (req, res) => {
  const { reason } = req.body;
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (booking.status === 'Cancelled')
      return res.status(400).json({ success: false, message: 'Already cancelled' });

    booking.status = 'Cancelled';
    booking.cancellationReason = reason || 'User requested';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Web check-in
exports.webCheckIn = async (req, res) => {
  const { pnr, lastName } = req.body;
  try {
    const booking = await Booking.findOne({ pnr: pnr.toUpperCase() })
      .populate('trip.outbound');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const passenger = booking.passengers.find(p => p.lastName.toLowerCase() === lastName.toLowerCase());
    if (!passenger) return res.status(404).json({ success: false, message: 'Passenger not found' });

    booking.checkInStatus = true;
    await booking.save();

    res.json({
      success: true,
      message: 'Check-in successful',
      boardingPass: {
        pnr: booking.pnr,
        passenger: `${passenger.firstName} ${passenger.lastName}`,
        flight: booking.trip.outbound?.flightNumber,
        seat: passenger.seatNumber || 'TBA',
        gate: 'TBA',
        boardingTime: booking.trip.outbound?.departureTime
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
