require('dotenv').config();
const mongoose = require('mongoose');
const Airport = require('../models/Airport');
const Flight = require('../models/Flight');
const Offer = require('../models/Offer');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/indigo_clone';

const airports = [
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', countryCode: 'IN', lat: 28.5561, lng: 77.1, popular: true, terminals: ['T1', 'T2', 'T3'] },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', countryCode: 'IN', lat: 19.0896, lng: 72.8656, popular: true, terminals: ['T1', 'T2'] },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India', countryCode: 'IN', lat: 13.1986, lng: 77.7066, popular: true, terminals: ['T1', 'T2'] },
  { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', countryCode: 'IN', lat: 17.2313, lng: 78.4298, popular: true, terminals: ['T1'] },
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', countryCode: 'IN', lat: 12.9941, lng: 80.1709, popular: true, terminals: ['T1', 'T4'] },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata', country: 'India', countryCode: 'IN', lat: 22.6547, lng: 88.4467, popular: true, terminals: ['T1', 'T2'] },
  { code: 'GOI', name: 'Goa International Airport', city: 'Goa', country: 'India', countryCode: 'IN', lat: 15.3808, lng: 73.8314, popular: true, terminals: ['T1'] },
  { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', country: 'India', countryCode: 'IN', lat: 23.0772, lng: 72.6347, popular: false, terminals: ['T1', 'T2'] },
  { code: 'PNQ', name: 'Pune Airport', city: 'Pune', country: 'India', countryCode: 'IN', lat: 18.5822, lng: 73.9197, popular: false, terminals: ['T1'] },
  { code: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India', countryCode: 'IN', lat: 10.152, lng: 76.4019, popular: false, terminals: ['T1', 'T3'] },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', countryCode: 'AE', lat: 25.2532, lng: 55.3657, popular: true, terminals: ['T1', 'T2', 'T3'] },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3644, lng: 103.9915, popular: true, terminals: ['T1', 'T2', 'T3', 'T4'] },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', countryCode: 'TH', lat: 13.69, lng: 100.7501, popular: true, terminals: ['T1'] },
];

const generateFlights = () => {
  const routes = [
    { from: 'DEL', fromCity: 'Delhi', fromAirport: 'Indira Gandhi International Airport', to: 'BOM', toCity: 'Mumbai', toAirport: 'Chhatrapati Shivaji International Airport', duration: 130, ecoBase: 3499, bizBase: 9999 },
    { from: 'DEL', fromCity: 'Delhi', fromAirport: 'Indira Gandhi International Airport', to: 'BLR', toCity: 'Bengaluru', toAirport: 'Kempegowda International Airport', duration: 165, ecoBase: 4199, bizBase: 11999 },
    { from: 'DEL', fromCity: 'Delhi', fromAirport: 'Indira Gandhi International Airport', to: 'HYD', toCity: 'Hyderabad', toAirport: 'Rajiv Gandhi International Airport', duration: 155, ecoBase: 3899, bizBase: 10999 },
    { from: 'BOM', fromCity: 'Mumbai', fromAirport: 'Chhatrapati Shivaji International Airport', to: 'DEL', toCity: 'Delhi', toAirport: 'Indira Gandhi International Airport', duration: 135, ecoBase: 3599, bizBase: 10499 },
    { from: 'BOM', fromCity: 'Mumbai', fromAirport: 'Chhatrapati Shivaji International Airport', to: 'BLR', toCity: 'Bengaluru', toAirport: 'Kempegowda International Airport', duration: 95, ecoBase: 2499, bizBase: 7999 },
    { from: 'BOM', fromCity: 'Mumbai', fromAirport: 'Chhatrapati Shivaji International Airport', to: 'GOI', toCity: 'Goa', toAirport: 'Goa International Airport', duration: 60, ecoBase: 1999, bizBase: 5999 },
    { from: 'BLR', fromCity: 'Bengaluru', fromAirport: 'Kempegowda International Airport', to: 'DEL', toCity: 'Delhi', toAirport: 'Indira Gandhi International Airport', duration: 170, ecoBase: 4299, bizBase: 12999 },
    { from: 'BLR', fromCity: 'Bengaluru', fromAirport: 'Kempegowda International Airport', to: 'HYD', toCity: 'Hyderabad', toAirport: 'Rajiv Gandhi International Airport', duration: 70, ecoBase: 2299, bizBase: 6999 },
    { from: 'DEL', fromCity: 'Delhi', fromAirport: 'Indira Gandhi International Airport', to: 'DXB', toCity: 'Dubai', toAirport: 'Dubai International Airport', duration: 210, ecoBase: 8999, bizBase: 24999 },
    { from: 'BOM', fromCity: 'Mumbai', fromAirport: 'Chhatrapati Shivaji International Airport', to: 'DXB', toCity: 'Dubai', toAirport: 'Dubai International Airport', duration: 195, ecoBase: 8499, bizBase: 22999 },
    { from: 'BOM', fromCity: 'Mumbai', fromAirport: 'Chhatrapati Shivaji International Airport', to: 'SIN', toCity: 'Singapore', toAirport: 'Changi Airport', duration: 360, ecoBase: 14999, bizBase: 39999 },
    { from: 'DEL', fromCity: 'Delhi', fromAirport: 'Indira Gandhi International Airport', to: 'BKK', toCity: 'Bangkok', toAirport: 'Suvarnabhumi Airport', duration: 330, ecoBase: 12999, bizBase: 34999 },
  ];

  const flights = [];
  const departureTimes = [5, 6, 7, 9, 11, 13, 15, 17, 19, 21]; // hours

  routes.forEach((route, ri) => {
    for (let day = 0; day < 14; day++) {
      departureTimes.slice(0, 4).forEach((hour, hi) => {
        const depTime = new Date();
        depTime.setDate(depTime.getDate() + day);
        depTime.setHours(hour, [0, 30][hi % 2], 0, 0);

        const arrTime = new Date(depTime.getTime() + route.duration * 60000);
        const priceVariance = 1 + (hi * 0.1);

        flights.push({
          //flightNumber: `6E${100 + ri * 10 + hi}`,
          flightNumber: `6E${100 + ri * 100 + day * 10 + hi}`,
          origin: { code: route.from, city: route.fromCity, airport: route.fromAirport, terminal: 'T2' },
          destination: { code: route.to, city: route.toCity, airport: route.toAirport, terminal: 'T1' },
          departureTime: depTime,
          arrivalTime: arrTime,
          duration: route.duration,
          stops: 0,
          seats: { total: 180, available: { economy: 120 + Math.floor(Math.random() * 30), business: 20 + Math.floor(Math.random() * 10) } },
          price: {
            economy: { base: Math.round(route.ecoBase * priceVariance), taxes: Math.round(route.ecoBase * 0.18) },
            business: { base: Math.round(route.bizBase * priceVariance), taxes: Math.round(route.bizBase * 0.18) }
          },
          status: 'Scheduled',
          isActive: true
        });
      });
    }
  });
  return flights;
};

const offers = [
  { title: 'Flash Sale - 20% Off', description: 'Get 20% off on all domestic flights', code: 'FLASH20', discountType: 'Percentage', discountValue: 20, maxDiscount: 2000, minBookingAmount: 3000, validFrom: new Date(), validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true },
  { title: 'New User Offer', description: 'Flat ₹500 off for first-time users', code: 'NEWUSER500', discountType: 'Flat', discountValue: 500, minBookingAmount: 2000, validFrom: new Date(), validTill: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), isActive: true },
  { title: 'International Deal', description: '15% off on international flights', code: 'INTL15', discountType: 'Percentage', discountValue: 15, maxDiscount: 5000, minBookingAmount: 8000, validFrom: new Date(), validTill: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), isActive: true },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await Airport.deleteMany({});
    await Flight.deleteMany({});
    await Offer.deleteMany({});

    await Airport.insertMany(airports);
    console.log(`✅ Seeded ${airports.length} airports`);

    const flights = generateFlights();
    await Flight.insertMany(flights);
    console.log(`✅ Seeded ${flights.length} flights`);

    await Offer.insertMany(offers);
    console.log(`✅ Seeded ${offers.length} offers`);

    // Create admin user if not exists
    const User = require('../models/User');
    const existing = await User.findOne({ email: 'admin@indigo.com' });
    if (!existing) {
      await User.create({
        firstName: 'Admin',
        lastName: 'IndiGo',
        email: 'admin@indigo.com',
        password: 'admin@123',
        role: 'admin',
        phone: '9000000000'
      });
      console.log('✅ Admin user created → admin@indigo.com / admin@123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seed();
