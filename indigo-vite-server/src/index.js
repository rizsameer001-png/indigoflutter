import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import flightRoutes from './routes/flights.js';
import bookingRoutes from './routes/bookings.js';
import userRoutes from './routes/users.js';
import airportRoutes from './routes/airports.js';
import offerRoutes from './routes/offers.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Connect to MongoDB
connectDB();

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS
// app.use(cors({
//   origin: [
//     process.env.CLIENT_URL || 'http://localhost:3000',
//     'http://localhost:5173',   // Vite default port
//     'http://localhost:4173',   // Vite preview port
//   ],
//   credentials: true,
// }));
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://indigovite.onrender.com',
  'http://localhost:5173',
  'http://localhost:4173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.options('*', cors());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'IndiGo Clone API is running',
    version: '1.0.0',
    runtime: 'ESM (Vite)',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 IndiGo Server running on port ${PORT}`);
  console.log(`📖 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
