import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlane, FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top container">
        <div className="footer-brand">
          <div className="footer-logo"><FaPlane /> <span>IndiGo</span></div>
          <p>India's preferred low-cost airline. On time, affordable, and hassle-free travel.</p>
          <div className="social-links">
            <a href="#!" aria-label="Facebook"><FaFacebook /></a>
            <a href="#!" aria-label="Twitter"><FaTwitter /></a>
            <a href="#!" aria-label="Instagram"><FaInstagram /></a>
            <a href="#!" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4>Plan Travel</h4>
          <Link to="/">Book Flights</Link>
          <Link to="/check-in">Web Check-in</Link>
          <Link to="/manage-booking">Manage Booking</Link>
          <Link to="/flight-status">Flight Status</Link>
          <Link to="/offers">Offers & Deals</Link>
        </div>

        <div className="footer-links-group">
          <h4>Services</h4>
          <a href="#!">6E Add-ons</a>
          <a href="#!">Extra Baggage</a>
          <a href="#!">Seat Selection</a>
          <a href="#!">Travel Insurance</a>
          <a href="#!">IndiGo Cargo</a>
        </div>

        <div className="footer-links-group">
          <h4>About</h4>
          <a href="#!">About IndiGo</a>
          <a href="#!">Careers</a>
          <a href="#!">Investor Relations</a>
          <a href="#!">Press Releases</a>
          <a href="#!">Contact Us</a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© 2024 IndiGo Clone. Educational project only.</span>
          <div className="footer-bottom-links">
            <a href="#!">Privacy Policy</a>
            <a href="#!">Terms of Use</a>
            <a href="#!">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
