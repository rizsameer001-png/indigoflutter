import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import FlightSelectionPage from './pages/FlightSelectionPage';
import PassengerDetailsPage from './pages/PassengerDetailsPage';
import AddonsPage from './pages/AddonsPage';
import PaymentPage from './pages/PaymentPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import ManageBookingPage from './pages/ManageBookingPage';
import CheckInPage from './pages/CheckInPage';
import FlightStatusPage from './pages/FlightStatusPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MyBookingsPage from './pages/MyBookingsPage';
import OffersPage from './pages/OffersPage';

// Admin pages
import AdminLoginPage   from './pages/admin/AdminLoginPage';
import AdminLayout      from './pages/admin/AdminLayout';
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminFlightsPage from './pages/admin/AdminFlightsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminUsersPage   from './pages/admin/AdminUsersPage';
import AdminOffersPage  from './pages/admin/AdminOffersPage';

// Admin shared styles
import './pages/admin/AdminLayout.css';
import './pages/admin/AdminShared.css';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import useAuthStore from './store/authStore';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { background: '#1a1a2e', color: '#fff', borderRadius: '8px' }
        }}
      />
      <Routes>
        {/* ── Admin routes (no Navbar/Footer) ── */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="flights"   element={<AdminFlightsPage />} />
          <Route path="bookings"  element={<AdminBookingsPage />} />
          <Route path="users"     element={<AdminUsersPage />} />
          <Route path="offers"    element={<AdminOffersPage />} />
        </Route>

        {/* ── Public / user routes ── */}
        <Route path="/*" element={
          <div className="app">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/flights/search" element={<SearchResultsPage />} />
                <Route path="/flights/select" element={<FlightSelectionPage />} />
                <Route path="/booking/passengers" element={<PassengerDetailsPage />} />
                <Route path="/booking/addons" element={<AddonsPage />} />
                <Route path="/booking/payment" element={<PaymentPage />} />
                <Route path="/booking/confirmation" element={<BookingConfirmationPage />} />
                <Route path="/manage-booking" element={<ManageBookingPage />} />
                <Route path="/check-in" element={<CheckInPage />} />
                <Route path="/flight-status" element={<FlightStatusPage />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
              </Routes>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
