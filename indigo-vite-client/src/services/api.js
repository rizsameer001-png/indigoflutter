import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const isAdmin = window.location.pathname.startsWith('/admin');
      window.location.href = isAdmin ? '/admin/login' : '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);

// ─── Flights ─────────────────────────────────────────────
export const searchFlights = (params) => API.get('/flights/search', { params });
export const getFlight = (id) => API.get(`/flights/${id}`);
export const getFlights = (params) => API.get('/flights', { params });
export const getFareCalendar = (from, to) => API.get('/flights/fare-calendar', { params: { from, to } });
export const getFlightStatus = (params) => API.get('/flights/status', { params });

// ─── Bookings ────────────────────────────────────────────
export const createBooking = (data) => API.post('/bookings', data);
export const confirmPayment = (data) => API.post('/bookings/confirm-payment', data);
export const getBookingByPNR = (pnr) => API.get(`/bookings/pnr/${pnr}`);
export const getUserBookings = () => API.get('/bookings/my-bookings');
export const cancelBooking = (id, reason) => API.put(`/bookings/${id}/cancel`, { reason });
export const webCheckIn = (data) => API.post('/bookings/check-in', data);

// ─── Airports ────────────────────────────────────────────
export const getAirports = (params) => API.get('/airports', { params });
export const getAirport = (code) => API.get(`/airports/${code}`);

// ─── Offers ──────────────────────────────────────────────
export const getOffers = () => API.get('/offers');
export const validatePromo = (data) => API.post('/offers/validate', data);

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminGetStats    = ()          => API.get('/admin/stats');
export const adminGetUsers    = (params)    => API.get('/admin/users', { params });
export const adminUpdateUser  = (id, data)  => API.put(`/admin/users/${id}`, data);
export const adminDeleteUser  = (id)        => API.delete(`/admin/users/${id}`);

export const adminGetFlights    = (params)  => API.get('/admin/flights', { params });
export const adminCreateFlight  = (data)    => API.post('/admin/flights', data);
export const adminUpdateFlight  = (id, d)   => API.put(`/admin/flights/${id}`, d);
export const adminDeleteFlight  = (id)      => API.delete(`/admin/flights/${id}`);

export const adminGetBookings         = (params) => API.get('/admin/bookings', { params });
export const adminUpdateBookingStatus = (id, s)  => API.put(`/admin/bookings/${id}/status`, { status: s });

export const adminGetOffers    = ()         => API.get('/admin/offers');
export const adminCreateOffer  = (data)     => API.post('/admin/offers', data);
export const adminUpdateOffer  = (id, d)    => API.put(`/admin/offers/${id}`, d);
export const adminDeleteOffer  = (id)       => API.delete(`/admin/offers/${id}`);

export default API;
