# IndiGo Clone — React Client (Vite)

A fast, modern React 18 frontend built with **Vite 5** — replaces the old Create React App setup.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server (port 3000)
npm run dev
```

## 📁 Project Structure

```
indigo-vite-client/
├── index.html              ← Root HTML (Vite entry, not in /public)
├── vite.config.js          ← Vite configuration
├── .env.example            ← Environment template
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx            ← App entry point
    ├── App.jsx             ← Routes + layout
    ├── components/
    │   ├── layout/         ← Navbar, Footer
    │   ├── FlightCard.jsx
    │   └── SearchBox.jsx
    ├── pages/
    │   ├── HomePage.jsx
    │   ├── SearchResultsPage.jsx
    │   ├── PassengerDetailsPage.jsx
    │   ├── AddonsPage.jsx
    │   ├── PaymentPage.jsx
    │   ├── BookingConfirmationPage.jsx
    │   ├── ManageBookingPage.jsx
    │   ├── CheckInPage.jsx
    │   ├── FlightStatusPage.jsx
    │   ├── OffersPage.jsx
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   ├── ProfilePage.jsx
    │   ├── MyBookingsPage.jsx
    │   └── admin/          ← Admin panel (Login, Dashboard, Flights, Bookings, Users, Offers)
    ├── services/
    │   └── api.js          ← Axios API layer (auto-attaches JWT)
    ├── store/
    │   ├── authStore.js    ← Zustand auth state
    │   └── bookingStore.js ← Zustand booking flow state
    └── styles/
        └── globals.css     ← Global styles + CSS variables
```

## ⚙️ Environment Variables

Vite uses `VITE_` prefix for client-side env vars:

```env
VITE_API_URL=http://localhost:5000/api
```

> **Note:** Unlike Create React App (`REACT_APP_`), Vite uses `VITE_` prefix.
> Access in code via `import.meta.env.VITE_API_URL`

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with HMR on port 3000 |
| `npm run build` | Production build to `/dist` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## 🔌 API Proxy

The Vite dev server proxies `/api/*` requests to `http://localhost:5000` automatically (configured in `vite.config.js`). No CORS issues during development.

## 🏗️ Production Build

```bash
# Set production API URL
echo "VITE_API_URL=https://your-api.com/api" > .env

# Build
npm run build

# Output is in /dist — deploy to Vercel, Netlify, or any static host
```

### Deploy to Vercel
```bash
npx vercel --prod
```

### Deploy to Netlify
Add `_redirects` file in `/public`:
```
/*  /index.html  200
```

## 🔑 Admin Login
- URL: `http://localhost:3000/admin/login`
- Email: `admin@indigo.com`
- Password: `admin@123`

## 🆚 CRA → Vite Changes

| Before (CRA) | After (Vite) |
|---|---|
| `react-scripts start` | `vite` |
| `react-scripts build` | `vite build` |
| Entry: `src/index.js` | Entry: `src/main.jsx` |
| `public/index.html` | `index.html` (root level) |
| `REACT_APP_API_URL` | `VITE_API_URL` |
| `process.env.REACT_APP_*` | `import.meta.env.VITE_*` |
| ~30s cold start | ~300ms cold start ⚡ |
