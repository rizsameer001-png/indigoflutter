import { Router } from 'express';
import {
  createBooking, confirmPayment, getBookingByPNR,
  getUserBookings, cancelBooking, webCheckIn,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, createBooking);
router.post('/confirm-payment', confirmPayment);
router.post('/check-in', webCheckIn);
router.get('/my-bookings', protect, getUserBookings);
router.get('/pnr/:pnr', getBookingByPNR);
router.put('/:id/cancel', protect, cancelBooking);

export default router;
