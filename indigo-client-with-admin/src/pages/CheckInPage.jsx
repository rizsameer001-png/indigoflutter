import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { webCheckIn } from '../services/api';

export default function CheckInPage() {
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [boardingPass, setBoardingPass] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await webCheckIn({ pnr, lastName });
      setBoardingPass(res.data.boardingPass);
      toast.success('Check-in successful! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: 600 }}>
      <h1 style={{ fontFamily: 'Poppins', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Web Check-In</h1>
      <p style={{ color: '#6b7280', marginBottom: 30 }}>Check-in opens 48 hours before departure</p>

      {!boardingPass ? (
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">PNR / Booking Reference</label>
                <input className="form-control" value={pnr} onChange={e=>setPnr(e.target.value.toUpperCase())} required placeholder="e.g. AB1C2D" style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-control" value={lastName} onChange={e=>setLastName(e.target.value)} required placeholder="Passenger last name" />
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                {loading ? 'Processing...' : 'Check In Now'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎫</div>
            <h2 style={{ fontWeight: 700, marginBottom: 6 }}>Check-In Confirmed!</h2>
            <div style={{ background: '#f0f6ff', borderRadius: 12, padding: 20, margin: '20px 0' }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>PASSENGER</div>
              <div style={{ fontWeight: 700, fontSize: 20 }}>{boardingPass.passenger}</div>
              <div style={{ margin: '12px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div><div style={{ fontSize: 11, color: '#6b7280' }}>FLIGHT</div><strong>{boardingPass.flight}</strong></div>
                <div><div style={{ fontSize: 11, color: '#6b7280' }}>SEAT</div><strong>{boardingPass.seat}</strong></div>
                <div><div style={{ fontSize: 11, color: '#6b7280' }}>GATE</div><strong>{boardingPass.gate}</strong></div>
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>PNR: <strong>{boardingPass.pnr}</strong></div>
            </div>
            <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Boarding Pass</button>
          </div>
        </div>
      )}
    </div>
  );
}
