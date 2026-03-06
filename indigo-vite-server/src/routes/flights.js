import { Router } from 'express';
import { searchFlights, getFlight, getFlights, getFareCalendar, getFlightStatus } from '../controllers/flightController.js';

const router = Router();

router.get('/search', searchFlights);
router.get('/fare-calendar', getFareCalendar);
router.get('/status', getFlightStatus);
router.get('/', getFlights);
router.get('/:id', getFlight);

export default router;
