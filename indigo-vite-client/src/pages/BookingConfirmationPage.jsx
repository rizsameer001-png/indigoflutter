import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getBookingByPNR } from '../services/api';
import './BookingConfirmationPage.css';

export default function BookingConfirmationPage() {
  const [searchParams] = useSearchParams();
  const pnr = searchParams.get('pnr');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pnr) {
      getBookingByPNR(pnr).then(r => setBooking(r.data.booking)).catch(()=>{}).finally(()=>setLoading(false));
    }
  }, [pnr]);

  if (loading) return <div className="container" style={{padding:'60px',textAlign:'center'}}><div className="spinner"></div></div>;

  return (
    <div className="confirmation-page container">
      <div className="confirm-banner">
        <div className="confirm-icon">🎉</div>
        <h1>Booking Confirmed!</h1>
        <p>Your booking has been confirmed. Have a great flight!</p>
      </div>

      <div className="pnr-card card">
        <div className="card-body">
          <div className="pnr-block">
            <span className="pnr-label">PNR / Booking Reference</span>
            <span className="pnr-number">{pnr}</span>
          </div>
          {booking && (
            <>
              <div className="flight-confirm-info">
                <div><strong>{booking.trip?.outbound?.origin?.city}</strong> → <strong>{booking.trip?.outbound?.destination?.city}</strong></div>
                <div className="fc-detail">{booking.trip?.outbound?.flightNumber} · {booking.class}</div>
              </div>
              <div className="passengers-list">
                <h4>Passengers</h4>
                {booking.passengers?.map((p, i) => (
                  <div key={i} className="passenger-row">{p.title} {p.firstName} {p.lastName} · {p.type}</div>
                ))}
              </div>
              <div className="total-paid">
                <span>Total Paid</span>
                <span>₹{booking.pricing?.total?.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="confirm-actions">
        <Link to="/manage-booking" className="btn btn-secondary">Manage Booking</Link>
        <Link to="/check-in" className="btn btn-primary">Web Check-In</Link>
        <Link to="/" className="btn btn-secondary">Book Another Flight</Link>
      </div>

      <div className="confirm-tips">
        <h3>What's Next?</h3>
        <div className="tips-grid">
          <div className="tip-card">📧 <strong>Check your email</strong> — Booking confirmation sent</div>
          <div className="tip-card">⏰ <strong>Web Check-in</strong> — Opens 48 hours before departure</div>
          <div className="tip-card">🛄 <strong>Baggage</strong> — Arrive early for check-in</div>
          <div className="tip-card">📱 <strong>App</strong> — Download IndiGo app for boarding pass</div>
        </div>
      </div>
    </div>
  );
}
