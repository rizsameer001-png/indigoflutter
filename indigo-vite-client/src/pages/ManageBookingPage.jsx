import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { getBookingByPNR, cancelBooking } from '../services/api';
import { format } from 'date-fns';

export default function ManageBookingPage() {
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await getBookingByPNR(pnr);
      setBooking(res.data.booking);
    } catch {
      toast.error('Booking not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(booking._id, 'User requested');
      toast.success('Booking cancelled');
      setBooking(b => ({ ...b, status: 'Cancelled' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: 700 }}>
      <h1 style={{ fontFamily: 'Poppins', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Manage Booking</h1>
      <p style={{ color: '#6b7280', marginBottom: 30 }}>Enter your PNR to view and manage your booking</p>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">PNR / Booking Reference</label>
              <input className="form-control" placeholder="e.g. AB1C2D" value={pnr} onChange={e=>setPnr(e.target.value.toUpperCase())} style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, letterSpacing: 2 }} required />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Searching...' : 'Find Booking'}</button>
            </div>
          </form>
        </div>
      </div>

      {booking && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>PNR</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#0052a5', fontFamily: 'monospace' }}>{booking.pnr}</div>
              </div>
              <span className={`badge ${booking.status === 'Confirmed' ? 'badge-green' : booking.status === 'Cancelled' ? 'badge-red' : 'badge-blue'}`}>
                {booking.status}
              </span>
            </div>

            {booking.trip?.outbound && (
              <div style={{ background: '#f0f6ff', borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
                <strong style={{ fontSize: 18 }}>{booking.trip.outbound.origin?.city} → {booking.trip.outbound.destination?.city}</strong>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  {booking.trip.outbound.flightNumber} · {format(new Date(booking.trip.outbound.departureTime), 'dd MMM yyyy, HH:mm')} · {booking.class}
                </div>
              </div>
            )}

            <div style={{ fontSize: 14, marginBottom: 16 }}>
              <strong>Passengers</strong>
              {booking.passengers?.map((p, i) => (
                <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>{p.title} {p.firstName} {p.lastName}</div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, paddingTop: 12, borderTop: '1.5px solid #e5e7eb' }}>
              <span>Total Paid</span>
              <span>₹{booking.pricing?.total?.toLocaleString()}</span>
            </div>

            {booking.status === 'Confirmed' && (
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={handleCancel}>Cancel Booking</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
