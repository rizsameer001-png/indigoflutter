import React from 'react';
import { useNavigate } from 'react-router-dom';
import useBookingStore from '../store/bookingStore';
import FlightCard from '../components/FlightCard';

export default function FlightSelectionPage() {
  const navigate = useNavigate();
  const { selectedOutbound } = useBookingStore();

  if (!selectedOutbound) {
    navigate('/');
    return null;
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, marginBottom: 20 }}>Selected Flight</h2>
      <FlightCard flight={selectedOutbound} selected />
      <div style={{ marginTop: 20 }}>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/booking/passengers')}>
          Continue with this flight →
        </button>
      </div>
    </div>
  );
}
