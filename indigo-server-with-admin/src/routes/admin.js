const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getStats,
  getUsers, updateUser, deleteUser,
  getAdminFlights, createFlight, updateFlight, deleteFlight,
  getAdminBookings, updateBookingStatus,
  getAdminOffers, createOffer, updateOffer, deleteOffer
} = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/stats', getStats);

// Users
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Flights
router.get('/flights', getAdminFlights);
router.post('/flights', createFlight);
router.put('/flights/:id', updateFlight);
router.delete('/flights/:id', deleteFlight);

// Bookings
router.get('/bookings', getAdminBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// Offers
router.get('/offers', getAdminOffers);
router.post('/offers', createOffer);
router.put('/offers/:id', updateOffer);
router.delete('/offers/:id', deleteOffer);

module.exports = router;
