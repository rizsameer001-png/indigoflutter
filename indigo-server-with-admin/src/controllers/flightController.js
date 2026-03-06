const Flight = require('../models/Flight');
const moment = require('moment');

// @desc Search flights
exports.searchFlights = async (req, res) => {
  const { from, to, date, returnDate, passengers = 1, class: cabinClass = 'Economy', tripType = 'One Way' } = req.query;

  if (!from || !to || !date)
    return res.status(400).json({ success: false, message: 'from, to, and date are required' });

  try {
    const startOfDay = moment(date).startOf('day').toDate();
    const endOfDay = moment(date).endOf('day').toDate();

    const query = {
      'origin.code': from.toUpperCase(),
      'destination.code': to.toUpperCase(),
      departureTime: { $gte: startOfDay, $lte: endOfDay },
      isActive: true
    };

    if (cabinClass === 'Economy') {
      query['seats.available.economy'] = { $gte: parseInt(passengers) };
    } else {
      query['seats.available.business'] = { $gte: parseInt(passengers) };
    }

    const outboundFlights = await Flight.find(query).sort({ departureTime: 1 });

    let returnFlights = [];
    if (tripType === 'Round Trip' && returnDate) {
      const retStart = moment(returnDate).startOf('day').toDate();
      const retEnd = moment(returnDate).endOf('day').toDate();
      returnFlights = await Flight.find({
        'origin.code': to.toUpperCase(),
        'destination.code': from.toUpperCase(),
        departureTime: { $gte: retStart, $lte: retEnd },
        isActive: true
      }).sort({ departureTime: 1 });
    }

    res.json({
      success: true,
      count: outboundFlights.length,
      outbound: outboundFlights,
      return: returnFlights,
      searchParams: { from, to, date, returnDate, passengers, cabinClass, tripType }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single flight
exports.getFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });
    res.json({ success: true, flight });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get all flights (admin/testing)
exports.getFlights = async (req, res) => {
  try {
    const { page = 1, limit = 20, from, to } = req.query;
    const query = { isActive: true };
    if (from) query['origin.code'] = from.toUpperCase();
    if (to) query['destination.code'] = to.toUpperCase();

    const flights = await Flight.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ departureTime: 1 });

    const total = await Flight.countDocuments(query);
    res.json({ success: true, count: flights.length, total, page: parseInt(page), flights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get fare calendar (prices for next 7 days)
exports.getFareCalendar = async (req, res) => {
  const { from, to } = req.query;
  try {
    const today = moment().startOf('day');
    const calendar = [];
    for (let i = 0; i < 7; i++) {
      const day = moment(today).add(i, 'days');
      const flights = await Flight.find({
        'origin.code': from?.toUpperCase(),
        'destination.code': to?.toUpperCase(),
        departureTime: { $gte: day.toDate(), $lt: moment(day).endOf('day').toDate() },
        isActive: true
      }).select('price departureTime').sort({ 'price.economy.base': 1 });

      calendar.push({
        date: day.format('YYYY-MM-DD'),
        minPrice: flights.length ? flights[0].price.economy.base : null,
        flightCount: flights.length
      });
    }
    res.json({ success: true, calendar });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get flight status
exports.getFlightStatus = async (req, res) => {
  const { flightNumber, date } = req.query;
  try {
    const query = { flightNumber: flightNumber?.toUpperCase() };
    if (date) {
      query.departureTime = {
        $gte: moment(date).startOf('day').toDate(),
        $lte: moment(date).endOf('day').toDate()
      };
    }
    const flight = await Flight.findOne(query);
    if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });
    res.json({
      success: true,
      status: flight.status,
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      scheduled: { departure: flight.departureTime, arrival: flight.arrivalTime }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
