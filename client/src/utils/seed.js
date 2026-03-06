require('dotenv').config();
const mongoose = require('mongoose');

const Airport = require('../models/Airport');
const Flight = require('../models/Flight');
const Offer = require('../models/Offer');
const User = require('../models/User');

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/indigo_clone';

/* -------------------------------------------------- */
/* Airports */
/* -------------------------------------------------- */

const airports = [
{ code:'DEL', name:'Indira Gandhi International Airport', city:'Delhi', country:'India', countryCode:'IN', lat:28.5561, lng:77.1, popular:true, terminals:['T1','T2','T3'] },
{ code:'BOM', name:'Chhatrapati Shivaji Maharaj International Airport', city:'Mumbai', country:'India', countryCode:'IN', lat:19.0896, lng:72.8656, popular:true, terminals:['T1','T2'] },
{ code:'BLR', name:'Kempegowda International Airport', city:'Bengaluru', country:'India', countryCode:'IN', lat:13.1986, lng:77.7066, popular:true, terminals:['T1','T2'] },
{ code:'HYD', name:'Rajiv Gandhi International Airport', city:'Hyderabad', country:'India', countryCode:'IN', lat:17.2313, lng:78.4298, popular:true, terminals:['T1'] },
{ code:'MAA', name:'Chennai International Airport', city:'Chennai', country:'India', countryCode:'IN', lat:12.9941, lng:80.1709, popular:true, terminals:['T1','T4'] },
{ code:'CCU', name:'Netaji Subhas Chandra Bose International Airport', city:'Kolkata', country:'India', countryCode:'IN', lat:22.6547, lng:88.4467, popular:true, terminals:['T1','T2'] },
{ code:'GOI', name:'Goa International Airport', city:'Goa', country:'India', countryCode:'IN', lat:15.3808, lng:73.8314, popular:true, terminals:['T1'] },
{ code:'AMD', name:'Sardar Vallabhbhai Patel International Airport', city:'Ahmedabad', country:'India', countryCode:'IN', lat:23.0772, lng:72.6347, popular:false, terminals:['T1','T2'] },
{ code:'PNQ', name:'Pune Airport', city:'Pune', country:'India', countryCode:'IN', lat:18.5822, lng:73.9197, popular:false, terminals:['T1'] },
{ code:'COK', name:'Cochin International Airport', city:'Kochi', country:'India', countryCode:'IN', lat:10.152, lng:76.4019, popular:false, terminals:['T1','T3'] },
{ code:'DXB', name:'Dubai International Airport', city:'Dubai', country:'UAE', countryCode:'AE', lat:25.2532, lng:55.3657, popular:true, terminals:['T1','T2','T3'] },
{ code:'SIN', name:'Changi Airport', city:'Singapore', country:'Singapore', countryCode:'SG', lat:1.3644, lng:103.9915, popular:true, terminals:['T1','T2','T3','T4'] },
{ code:'BKK', name:'Suvarnabhumi Airport', city:'Bangkok', country:'Thailand', countryCode:'TH', lat:13.69, lng:100.7501, popular:true, terminals:['T1'] }
];

/* -------------------------------------------------- */
/* Routes */
/* -------------------------------------------------- */

const routes = [
{ from:'DEL', to:'BOM', duration:130, eco:3499, biz:9999 },
{ from:'DEL', to:'BLR', duration:165, eco:4199, biz:11999 },
{ from:'DEL', to:'HYD', duration:155, eco:3899, biz:10999 },
{ from:'BOM', to:'DEL', duration:135, eco:3599, biz:10499 },
{ from:'BOM', to:'BLR', duration:95, eco:2499, biz:7999 },
{ from:'BOM', to:'GOI', duration:60, eco:1999, biz:5999 },
{ from:'BLR', to:'DEL', duration:170, eco:4299, biz:12999 },
{ from:'BLR', to:'HYD', duration:70, eco:2299, biz:6999 },
{ from:'DEL', to:'DXB', duration:210, eco:8999, biz:24999 },
{ from:'BOM', to:'DXB', duration:195, eco:8499, biz:22999 },
{ from:'BOM', to:'SIN', duration:360, eco:14999, biz:39999 },
{ from:'DEL', to:'BKK', duration:330, eco:12999, biz:34999 }
];

/* -------------------------------------------------- */
/* Generate Flights */
/* -------------------------------------------------- */

const generateFlights = () => {

const flights = [];
const departureHours = [5,6,7,9];
let counter = 100;

routes.forEach(route => {

const originAirport = airports.find(a => a.code === route.from);
const destAirport = airports.find(a => a.code === route.to);

for(let day=0; day<14; day++){

departureHours.forEach((hour,index)=>{

const dep = new Date();
dep.setDate(dep.getDate()+day);
dep.setHours(hour,index%2?30:0,0,0);

const arr = new Date(dep.getTime() + route.duration*60000);

const variance = 1 + index*0.1;

flights.push({

flightNumber:`6E${counter++}`,

origin:{
code:originAirport.code,
city:originAirport.city,
airport:originAirport.name,
terminal:'T2'
},

destination:{
code:destAirport.code,
city:destAirport.city,
airport:destAirport.name,
terminal:'T1'
},

departureTime:dep,
arrivalTime:arr,
duration:route.duration,
stops:0,

seats:{
total:180,
available:{
economy:120 + Math.floor(Math.random()*40),
business:20 + Math.floor(Math.random()*10)
}
},

price:{
economy:{
base:Math.round(route.eco*variance),
taxes:Math.round(route.eco*0.18)
},
business:{
base:Math.round(route.biz*variance),
taxes:Math.round(route.biz*0.18)
}
},

status:'Scheduled',
isActive:true

});

});

}

});

return flights;

};

/* -------------------------------------------------- */
/* Offers */
/* -------------------------------------------------- */

const offers = [
{
title:'Flash Sale - 20% Off',
description:'20% off domestic flights',
code:'FLASH20',
discountType:'Percentage',
discountValue:20,
maxDiscount:2000,
minBookingAmount:3000,
validFrom:new Date(),
validTill:new Date(Date.now()+30*24*60*60*1000),
isActive:true
},
{
title:'New User Offer',
description:'Flat ₹500 off',
code:'NEWUSER500',
discountType:'Flat',
discountValue:500,
minBookingAmount:2000,
validFrom:new Date(),
validTill:new Date(Date.now()+60*24*60*60*1000),
isActive:true
},
{
title:'International Deal',
description:'15% off international flights',
code:'INTL15',
discountType:'Percentage',
discountValue:15,
maxDiscount:5000,
minBookingAmount:8000,
validFrom:new Date(),
validTill:new Date(Date.now()+45*24*60*60*1000),
isActive:true
}
];

/* -------------------------------------------------- */
/* Seed Function */
/* -------------------------------------------------- */

const seed = async () => {

try{

await mongoose.connect(MONGO_URI);
console.log("Connected to MongoDB");

await Airport.deleteMany();
await Flight.deleteMany();
await Offer.deleteMany();

await Airport.insertMany(airports);
console.log(`✅ ${airports.length} airports seeded`);

const flights = generateFlights();
await Flight.insertMany(flights);
console.log(`✅ ${flights.length} flights seeded`);

await Offer.insertMany(offers);
console.log(`✅ ${offers.length} offers seeded`);

const existing = await User.findOne({email:"admin@indigo.com"});

if(!existing){

await User.create({
firstName:"Admin",
lastName:"Indigo",
email:"admin@indigo.com",
password:"admin@123",
phone:"9000000000",
role:"admin"
});

console.log("✅ Admin created → admin@indigo.com / admin@123");

}else{

console.log("ℹ️ Admin already exists");

}

console.log("\n🎉 Database Seeded Successfully");
process.exit();

}catch(err){

console.error("Seed error:",err.message);
process.exit(1);

}

};

seed();