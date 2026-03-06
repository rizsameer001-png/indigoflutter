import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlane, FaBars, FaTimes, FaUser, FaSignOutAlt, FaTicketAlt } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <FaPlane className="logo-icon" />
          <span className="logo-text">IndiGo</span>
          <span className="logo-tag">6E</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/manage-booking" onClick={() => setMenuOpen(false)}>Manage Booking</Link>
          <Link to="/check-in" onClick={() => setMenuOpen(false)}>Web Check-in</Link>
          <Link to="/flight-status" onClick={() => setMenuOpen(false)}>Flight Status</Link>
          <Link to="/offers" onClick={() => setMenuOpen(false)}>Offers</Link>
        </nav>

        {/* Auth */}
        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-menu" onMouseLeave={() => setDropdownOpen(false)}>
              <button className="user-btn" onMouseEnter={() => setDropdownOpen(true)} onClick={() => setDropdownOpen(!dropdownOpen)}>
                <FaUser size={14} />
                <span>{user?.firstName}</span>
                <span className="loyalty-badge">{user?.loyaltyPoints || 0} pts</span>
              </button>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}><FaUser size={12} /> My Profile</Link>
                  <Link to="/my-bookings" onClick={() => setDropdownOpen(false)}><FaTicketAlt size={12} /> My Bookings</Link>
                  <hr />
                  <button onClick={handleLogout}><FaSignOutAlt size={12} /> Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </header>
  );
}
