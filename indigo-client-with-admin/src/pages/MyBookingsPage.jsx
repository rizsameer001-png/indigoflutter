import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserBookings } from '../services/api';
import { format } from 'date-fns';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserBookings().then(r => setBookings(r.data.bookings || [])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'Poppins', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>My Bookings</h1>
      <p style={{ color: '#6b7280', marginBottom: 30 }}>All your trips in one place</p>

      {loading ? <div className="spinner"></div> :
        bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>✈️</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No bookings yet</h3>
            <p style={{ color: '#6b7280', marginBottom: 20 }}>Start your journey today</p>
            <Link to="/" className="btn btn-primary">Search Flights</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map(b => (
              <div key={b._id} className="card">
                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <strong style={{ fontFamily: 'monospace', fontSize: 18, color: '#0052a5' }}>{b.pnr}</strong>
                      <span className={`badge ${b.status === 'Confirmed' ? 'badge-green' : b.status === 'Cancelled' ? 'badge-red' : 'badge-blue'}`}>{b.status}</span>
                    </div>
                    {b.trip?.outbound && (
                      <div style={{ fontSize: 16, fontWeight: 600 }}>
                        {b.trip.outbound.origin?.city} → {b.trip.outbound.destination?.city}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                      {b.trip?.outbound && format(new Date(b.trip.outbound.departureTime), 'EEE, dd MMM yyyy')}
                      {' · '}{b.passengers?.length} passenger{b.passengers?.length !== 1 ? 's' : ''}
                      {' · '}{b.class}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 20, color: '#0052a5' }}>₹{b.pricing?.total?.toLocaleString()}</div>
                    <Link to={`/manage-booking?pnr=${b.pnr}`} className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>View Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
