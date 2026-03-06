import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getStats,
  getUsers, updateUser, deleteUser,
  getAdminFlights, createFlight, updateFlight, deleteFlight,
  getAdminBookings, updateBookingStatus,
  getAdminOffers, createOffer, updateOffer, deleteOffer,
} from '../controllers/adminController.js';

const router = Router();

// All admin routes require JWT + admin role
router.use(protect, adminOnly);

router.get('/stats', getStats);

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/flights', getAdminFlights);
router.post('/flights', createFlight);
router.put('/flights/:id', updateFlight);
router.delete('/flights/:id', deleteFlight);

router.get('/bookings', getAdminBookings);
router.put('/bookings/:id/status', updateBookingStatus);

router.get('/offers', getAdminOffers);
router.post('/offers', createOffer);
router.put('/offers/:id', updateOffer);
router.delete('/offers/:id', deleteOffer);

export default router;
