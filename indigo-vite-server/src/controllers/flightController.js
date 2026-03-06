import Flight from '../models/Flight.js';

// @desc Search flights
export const searchFlights = async (req, res) => {
  const { from, to, date, returnDate, passengers = 1, class: cabinClass = 'Economy', tripType = 'One Way' } = req.query;
  if (!from || !to || !date)
    return res.status(400).json({ success: false, message: 'from, to, and date are required' });

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      'origin.code': from.toUpperCase(),
      'destination.code': to.toUpperCase(),
      departureTime: { $gte: startOfDay, $lte: endOfDay },
      isActive: true,
    };
    if (cabinClass === 'Economy') {
      query['seats.available.economy'] = { $gte: parseInt(passengers) };
    } else {
      query['seats.available.business'] = { $gte: parseInt(passengers) };
    }

    const outboundFlights = await Flight.find(query).sort({ departureTime: 1 });

    let returnFlights = [];
    if (tripType === 'Round Trip' && returnDate) {
      const retStart = new Date(returnDate);
      retStart.setHours(0, 0, 0, 0);
      const retEnd = new Date(returnDate);
      retEnd.setHours(23, 59, 59, 999);
      returnFlights = await Flight.find({
        'origin.code': to.toUpperCase(),
        'destination.code': from.toUpperCase(),
        departureTime: { $gte: retStart, $lte: retEnd },
        isActive: true,
      }).sort({ departureTime: 1 });
    }

    res.json({ success: true, count: outboundFlights.length, outbound: outboundFlights, return: returnFlights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single flight
export const getFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });
    res.json({ success: true, flight });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get all flights
export const getFlights = async (req, res) => {
  try {
    const { page = 1, limit = 20, from, to } = req.query;
    const query = { isActive: true };
    if (from) query['origin.code'] = from.toUpperCase();
    if (to) query['destination.code'] = to.toUpperCase();
    const flights = await Flight.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ departureTime: 1 });
    const total = await Flight.countDocuments(query);
    res.json({ success: true, count: flights.length, total, page: parseInt(page), flights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Fare calendar (7 days)
export const getFareCalendar = async (req, res) => {
  const { from, to } = req.query;
  try {
    const calendar = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date();
      day.setDate(day.getDate() + i);
      day.setHours(0, 0, 0, 0);
      const endDay = new Date(day);
      endDay.setHours(23, 59, 59, 999);

      const flights = await Flight.find({
        'origin.code': from?.toUpperCase(),
        'destination.code': to?.toUpperCase(),
        departureTime: { $gte: day, $lt: endDay },
        isActive: true,
      }).select('price departureTime').sort({ 'price.economy.base': 1 });

      calendar.push({
        date: day.toISOString().slice(0, 10),
        minPrice: flights.length ? flights[0].price.economy.base : null,
        flightCount: flights.length,
      });
    }
    res.json({ success: true, calendar });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get flight status
export const getFlightStatus = async (req, res) => {
  const { flightNumber, date } = req.query;
  try {
    const query = { flightNumber: flightNumber?.toUpperCase() };
    if (date) {
      const s = new Date(date); s.setHours(0, 0, 0, 0);
      const e = new Date(date); e.setHours(23, 59, 59, 999);
      query.departureTime = { $gte: s, $lte: e };
    }
    const flight = await Flight.findOne(query);
    if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });
    res.json({
      success: true,
      status: flight.status,
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      scheduled: { departure: flight.departureTime, arrival: flight.arrivalTime },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
