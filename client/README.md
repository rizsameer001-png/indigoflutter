admin@123
admin@indigo.com

76584B
Mr aman kumar
Check-In Confirmed!
PASSENGER
aman kumar
FLIGHT
6E108
SEAT
TBA
GATE
TBA
PNR: 76584B

# ✈️ IndiGo Clone - Backend Server

A full-featured REST API for IndiGo Airlines clone built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 3. Seed the database (airports, flights, offers)
npm run seed

# 4. Start development server
npm run dev

# 5. Start production server
npm start
```

Server runs on: `http://localhost:5000`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (🔐) |
| PUT | `/api/auth/profile` | Update profile (🔐) |
| PUT | `/api/auth/change-password` | Change password (🔐) |

### Flights
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flights/search?from=DEL&to=BOM&date=2025-12-01&passengers=1&class=Economy` | Search flights |
| GET | `/api/flights/fare-calendar?from=DEL&to=BOM` | 7-day fare calendar |
| GET | `/api/flights/status?flightNumber=6E101&date=2025-12-01` | Flight status |
| GET | `/api/flights` | All flights (paginated) |
| GET | `/api/flights/:id` | Single flight |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| POST | `/api/bookings/confirm-payment` | Confirm payment |
| POST | `/api/bookings/check-in` | Web check-in |
| GET | `/api/bookings/my-bookings` | User bookings (🔐) |
| GET | `/api/bookings/pnr/:pnr` | Get booking by PNR |
| PUT | `/api/bookings/:id/cancel` | Cancel booking (🔐) |

### Airports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/airports` | All airports |
| GET | `/api/airports?search=del` | Search airports |
| GET | `/api/airports?popular=true` | Popular airports |
| GET | `/api/airports/:code` | Airport by IATA code |

### Offers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/offers` | All active offers |
| POST | `/api/offers/validate` | Validate promo code |

---

## 🛡️ Authentication
Protected routes (🔐) require Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

## 📦 Sample Request - Search Flights
```
GET /api/flights/search?from=DEL&to=BOM&date=2024-12-15&passengers=1&class=Economy&tripType=One Way
```

## 📦 Sample Request - Create Booking
```json
POST /api/bookings
{
  "flightId": "...",
  "passengers": [{ "title": "Mr", "firstName": "Rahul", "lastName": "Sharma", "type": "Adult" }],
  "class": "Economy",
  "contactEmail": "rahul@example.com",
  "contactPhone": "9876543210",
  "addons": { "mealPlan": true }
}
```
