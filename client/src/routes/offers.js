const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');

router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true, validTill: { $gte: new Date() } });
    res.json({ success: true, offers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/validate', async (req, res) => {
  const { code, amount } = req.body;
  try {
    const offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true, validTill: { $gte: new Date() } });
    if (!offer) return res.status(404).json({ success: false, message: 'Invalid or expired promo code' });
    if (amount < offer.minBookingAmount)
      return res.status(400).json({ success: false, message: `Minimum booking amount is ₹${offer.minBookingAmount}` });

    let discount = offer.discountType === 'Percentage'
      ? Math.min((amount * offer.discountValue) / 100, offer.maxDiscount || Infinity)
      : offer.discountValue;

    res.json({ success: true, discount, offer: { title: offer.title, code: offer.code } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
