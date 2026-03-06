import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBox from '../components/SearchBox';
import { getOffers } from '../services/api';
import './HomePage.css';

const POPULAR_ROUTES = [
  { from: 'DEL', to: 'BOM', fromCity: 'Delhi', toCity: 'Mumbai', price: 3499 },
  { from: 'BOM', to: 'GOI', fromCity: 'Mumbai', toCity: 'Goa', price: 1999 },
  { from: 'DEL', to: 'BLR', fromCity: 'Delhi', toCity: 'Bengaluru', price: 4199 },
  { from: 'DEL', to: 'DXB', fromCity: 'Delhi', toCity: 'Dubai', price: 8999 },
  { from: 'BLR', to: 'HYD', fromCity: 'Bengaluru', toCity: 'Hyderabad', price: 2299 },
  { from: 'BOM', to: 'SIN', fromCity: 'Mumbai', toCity: 'Singapore', price: 14999 },
];

export default function HomePage() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    getOffers().then(r => setOffers(r.data.offers || [])).catch(() => {});
  }, []);

  return (
    <div className="homepage">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-overlay"></div>
          <div className="hero-plane-trail"></div>
        </div>
        <div className="hero-content container">
          <h1 className="hero-title">
            <span>Fly Smart,</span>
            <span className="highlight"> Fly IndiGo</span>
          </h1>
          <p className="hero-subtitle">India's favourite airline. On time. Every time.</p>
          <SearchBox />
        </div>
      </section>

      {/* Quick Links */}
      <section className="quick-links container">
        <div className="quick-links-grid">
          {[
            { icon: '🎫', label: 'Web Check-in', link: '/check-in', desc: 'Check-in 48hr before' },
            { icon: '✏️', label: 'Manage Booking', link: '/manage-booking', desc: 'Change, cancel or view' },
            { icon: '🕐', label: 'Flight Status', link: '/flight-status', desc: 'Real-time tracking' },
            { icon: '🏷️', label: 'Offers', link: '/offers', desc: 'Great deals await' },
          ].map(item => (
            <Link key={item.label} to={item.link} className="quick-card">
              <span className="quick-icon">{item.icon}</span>
              <div>
                <div className="quick-label">{item.label}</div>
                <div className="quick-desc">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Routes */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Popular Routes</h2>
            <p>Best fares on top routes</p>
          </div>
          <div className="routes-grid">
            {POPULAR_ROUTES.map(route => (
              <Link
                key={`${route.from}-${route.to}`}
                to={`/flights/search?from=${route.from}&to=${route.to}&date=${new Date(Date.now() + 2*86400000).toISOString().split('T')[0]}&passengers=1&class=Economy&fromCity=${route.fromCity}&toCity=${route.toCity}`}
                className="route-card"
              >
                <div className="route-cities">
                  <span>{route.fromCity}</span>
                  <span className="route-arrow">✈</span>
                  <span>{route.toCity}</span>
                </div>
                <div className="route-codes">{route.from} → {route.to}</div>
                <div className="route-price">from ₹{route.price.toLocaleString()}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Offers */}
      {offers.length > 0 && (
        <section className="section offers-section">
          <div className="container">
            <div className="section-header">
              <h2>Current Offers</h2>
              <Link to="/offers" className="view-all">View All →</Link>
            </div>
            <div className="offers-grid">
              {offers.slice(0, 3).map(offer => (
                <div key={offer._id} className="offer-card">
                  <div className="offer-badge">OFFER</div>
                  <h3>{offer.title}</h3>
                  <p>{offer.description}</p>
                  <div className="offer-code">
                    <span>Code: </span><strong>{offer.code}</strong>
                  </div>
                  <div className="offer-save">
                    Save up to ₹{offer.discountType === 'Flat' ? offer.discountValue : offer.maxDiscount || 2000}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header"><h2>Why Fly IndiGo?</h2></div>
          <div className="features-grid">
            {[
              { icon: '⏰', title: 'On-Time Performance', desc: 'Consistently #1 in on-time departures across India' },
              { icon: '💰', title: 'Lowest Fares', desc: 'Best prices guaranteed. No hidden charges.' },
              { icon: '🛡️', title: 'Safe & Reliable', desc: 'Young fleet, highly trained crew, world-class safety' },
              { icon: '🌐', title: '100+ Destinations', desc: 'Connect to destinations across India and abroad' },
              { icon: '📱', title: 'Easy Booking', desc: 'Book in 3 minutes on web or mobile app' },
              { icon: '🎁', title: 'IndiGo Blue', desc: 'Earn loyalty points on every flight' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
