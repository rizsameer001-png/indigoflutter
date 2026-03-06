import { Router } from 'express';
import Airport from '../models/Airport.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search, popular } = req.query;
    const query = { isActive: true };
    if (popular === 'true') query.popular = true;
    if (search) {
      query.$or = [
        { code: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { name: new RegExp(search, 'i') },
      ];
    }
    const airports = await Airport.find(query).sort({ popular: -1, city: 1 });
    res.json({ success: true, count: airports.length, airports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const airport = await Airport.findOne({ code: req.params.code.toUpperCase() });
    if (!airport) return res.status(404).json({ success: false, message: 'Airport not found' });
    res.json({ success: true, airport });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
