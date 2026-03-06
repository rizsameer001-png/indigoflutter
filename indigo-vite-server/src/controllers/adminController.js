import User from '../models/User.js';
import Flight from '../models/Flight.js';
import Booking from '../models/Booking.js';
import Offer from '../models/Offer.js';

// ── Dashboard Stats ────────────────────────────────────────────────────────
export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalFlights, totalBookings, totalOffers] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Flight.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Offer.countDocuments({ isActive: true }),
    ]);
    const revenueAgg = await Booking.aggregate([
      { $match: { 'payment.status': 'Paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 }).limit(5)
      .populate('trip.outbound', 'flightNumber origin destination departureTime')
      .select('pnr status pricing.total passengers contactEmail createdAt');
    const revenueByDay = await Booking.aggregate([
      { $match: { 'payment.status': 'Paid', createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$pricing.total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const topRoutes = await Booking.aggregate([
      { $lookup: { from: 'flights', localField: 'trip.outbound', foreignField: '_id', as: 'flight' } },
      { $unwind: '$flight' },
      { $group: { _id: { from: '$flight.origin.code', to: '$flight.destination.code' }, count: { $sum: 1 }, revenue: { $sum: '$pricing.total' } } },
      { $sort: { count: -1 } }, { $limit: 5 },
    ]);
    res.json({ success: true, stats: { totalUsers, totalFlights, totalBookings, totalOffers, totalRevenue }, bookingsByStatus, recentBookings, revenueByDay, topRoutes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Users ──────────────────────────────────────────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (search) query.$or = [{ email: new RegExp(search, 'i') }, { firstName: new RegExp(search, 'i') }, { lastName: new RegExp(search, 'i') }];
    if (role) query.role = role;
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, page: Number(page) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const updateUser = async (req, res) => {
  try {
    const { role, isActive, tier } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id,
      { ...(role && { role }), ...(isActive !== undefined && { isActive }), ...(tier && { tier }) },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Flights ────────────────────────────────────────────────────────────────
export const getAdminFlights = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.$or = [{ flightNumber: new RegExp(search, 'i') }, { 'origin.code': new RegExp(search, 'i') }, { 'destination.code': new RegExp(search, 'i') }];
    const flights = await Flight.find(query).sort({ departureTime: 1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit));
    const total = await Flight.countDocuments(query);
    res.json({ success: true, flights, total, page: Number(page) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const createFlight = async (req, res) => {
  try {
    const flight = await Flight.create(req.body);
    res.status(201).json({ success: true, flight });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });
    res.json({ success: true, flight });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const deleteFlight = async (req, res) => {
  try {
    await Flight.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Flight deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Bookings ───────────────────────────────────────────────────────────────
export const getAdminBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [{ pnr: new RegExp(search, 'i') }, { contactEmail: new RegExp(search, 'i') }];
    const bookings = await Booking.find(query)
      .populate('trip.outbound', 'flightNumber origin destination departureTime')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit));
    const total = await Booking.countDocuments(query);
    res.json({ success: true, bookings, total, page: Number(page) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Offers ─────────────────────────────────────────────────────────────────
export const getAdminOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json({ success: true, offers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const createOffer = async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({ success: true, offer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, offer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const deleteOffer = async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Offer deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
