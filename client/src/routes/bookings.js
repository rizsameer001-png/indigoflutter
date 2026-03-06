const express = require('express');
const router = express.Router();
const {
  createBooking, confirmPayment, getBookingByPNR,
  getUserBookings, cancelBooking, webCheckIn
} = require('../controllers/bookingController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, createBooking);
router.post('/confirm-payment', confirmPayment);
router.post('/check-in', webCheckIn);
router.get('/my-bookings', protect, getUserBookings);
router.get('/pnr/:pnr', getBookingByPNR);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
