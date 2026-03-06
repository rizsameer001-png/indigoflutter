# ✈️ IndiGo Clone - React Frontend

A full-featured IndiGo Airlines clone built with React.js.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend server running on port 5000

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# 3. Start development server
npm start
```

App opens at: `http://localhost:3000`

---

## 📱 Pages & Features

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Search flights, popular routes, offers |
| Search Results | `/flights/search` | Browse & filter flights |
| Passenger Details | `/booking/passengers` | Enter passenger info |
| Add-ons | `/booking/addons` | Extra baggage, meals, seat, insurance |
| Payment | `/booking/payment` | Secure checkout |
| Confirmation | `/booking/confirmation` | Booking success + PNR |
| Manage Booking | `/manage-booking` | View/cancel by PNR |
| Web Check-in | `/check-in` | Digital boarding pass |
| Flight Status | `/flight-status` | Real-time status |
| Offers | `/offers` | Promo codes & deals |
| Login | `/login` | Auth |
| Register | `/register` | New account |
| Profile | `/profile` | User dashboard |
| My Bookings | `/my-bookings` | Booking history |

## 🎨 Tech Stack
- React 18 + React Router v6
- Zustand (state management)
- Axios (API calls)
- Framer Motion (animations)
- React Hot Toast (notifications)
- date-fns (date formatting)
