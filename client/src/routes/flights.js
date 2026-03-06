const express = require('express');
const router = express.Router();
const { searchFlights, getFlight, getFlights, getFareCalendar, getFlightStatus } = require('../controllers/flightController');

router.get('/search', searchFlights);
router.get('/fare-calendar', getFareCalendar);
router.get('/status', getFlightStatus);
router.get('/', getFlights);
router.get('/:id', getFlight);

module.exports = router;
