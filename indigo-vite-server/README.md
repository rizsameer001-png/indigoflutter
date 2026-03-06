# IndiGo Clone — Server (Vite / ESM)

Node.js 18 + Express REST API converted to **native ES Modules** with Vite build tooling.

## 🚀 Quick Start

```bash
npm install
cp .env.example .env   # edit MONGO_URI and JWT_SECRET
npm run seed           # populate DB + create admin user
npm run dev            # hot-reload dev server on port 5000
```

## 📁 Structure

```
indigo-vite-server/
├── vite.config.js          ← Vite SSR build config
├── .env.example
└── src/
    ├── index.js            ← Express app (ESM)
    ├── config/db.js        ← Mongoose connection
    ├── middleware/auth.js  ← protect + adminOnly guards
    ├── models/             ← User, Flight, Booking, Airport, Offer
    ├── controllers/        ← authController, flightController,
    │                          bookingController, adminController
    ├── routes/             ← auth, flights, bookings, airports,
    │                          offers, users, admin
    └── utils/seed.js       ← DB seeder (airports + flights + offers + admin)
```

## 📜 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with `vite-node --watch` (HMR for server) |
| `npm run dev:node` | Start with Node.js `--watch` flag (no extra deps) |
| `npm start` | Production start |
| `npm run build` | Bundle via Vite SSR into `dist/` |
| `npm run seed` | Seed database |

## 🔑 Admin Credentials (after seed)
- Email: `admin@indigo.com`
- Password: `admin@123`

## ⚙️ Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/indigo-clone
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## 🆚 CJS → ESM Changes

| Before | After |
|---|---|
| `const x = require('x')` | `import x from 'x'` |
| `exports.fn = ...` | `export const fn = ...` |
| `module.exports = router` | `export default router` |
| `require('dotenv').config()` | `import 'dotenv/config'` |
| `"main": "src/index.js"` (CJS) | `"type": "module"` in package.json |
| nodemon | vite-node --watch |

## 🚀 CORS Origins Allowed

The server accepts requests from:
- `http://localhost:3000` (React / Vite client)
- `http://localhost:5173` (Vite default dev port)
- `http://localhost:4173` (Vite preview port)
- `CLIENT_URL` env var (production override)
