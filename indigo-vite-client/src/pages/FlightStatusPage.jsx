import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { getFlightStatus } from '../services/api';
import { format } from 'date-fns';

const STATUS_COLORS = { 'On Time': 'badge-green', 'Scheduled': 'badge-blue', 'Delayed': 'badge-orange', 'Cancelled': 'badge-red', 'Boarding': 'badge-blue', 'Departed': 'badge-gray', 'Arrived': 'badge-green' };

export default function FlightStatusPage() {
  const [flightNum, setFlightNum] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await getFlightStatus({ flightNumber: flightNum, date });
      setStatus(res.data);
    } catch {
      toast.error('Flight not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: 600 }}>
      <h1 style={{ fontFamily: 'Poppins', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Flight Status</h1>
      <p style={{ color: '#6b7280', marginBottom: 30 }}>Real-time status for IndiGo flights</p>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
              <label className="form-label">Flight Number</label>
              <input className="form-control" value={flightNum} onChange={e=>setFlightNum(e.target.value.toUpperCase())} required placeholder="e.g. 6E101" />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
              <label className="form-label">Date</label>
              <input type="date" className="form-control" value={date} onChange={e=>setDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Check Status'}</button>
            </div>
          </form>
        </div>
      </div>

      {status && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0052a5' }}>{status.flightNumber}</div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>IndiGo · Airbus A320</div>
              </div>
              <span className={`badge ${STATUS_COLORS[status.status] || 'badge-gray'}`} style={{ fontSize: 14, padding: '6px 14px' }}>{status.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', background: '#f0f6ff', borderRadius: 12, padding: 20 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{status.origin?.code}</div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>{status.origin?.city}</div>
                <div style={{ fontWeight: 600 }}>{status.scheduled?.departure ? format(new Date(status.scheduled.departure), 'HH:mm') : '--'}</div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 24, color: '#0052a5' }}>✈</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{status.destination?.code}</div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>{status.destination?.city}</div>
                <div style={{ fontWeight: 600 }}>{status.scheduled?.arrival ? format(new Date(status.scheduled.arrival), 'HH:mm') : '--'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
