import React from 'react';
import { FaPlane, FaClock, FaSuitcase, FaWifi } from 'react-icons/fa';
import { format } from 'date-fns';
import './FlightCard.css';

export default function FlightCard({ flight, cabinClass = 'Economy', passengers = 1, onSelect, selected }) {
  if (!flight) return null;

  const key = cabinClass.toLowerCase();
  const price = flight.price[key];
  const totalPrice = (price.base + price.taxes) * passengers;
  const dep = new Date(flight.departureTime);
  const arr = new Date(flight.arrivalTime);
  const h = Math.floor(flight.duration / 60);
  const m = flight.duration % 60;

  return (
    <div className={`flight-card ${selected ? 'selected' : ''}`}>
      <div className="fc-left">
        <div className="fc-airline">
          <span className="fc-logo">6E</span>
          <div>
            <div className="fc-flight-num">{flight.flightNumber}</div>
            <div className="fc-aircraft">{flight.aircraft || 'Airbus A320'}</div>
          </div>
        </div>
      </div>

      <div className="fc-route">
        <div className="fc-time-block">
          <div className="fc-time">{format(dep, 'HH:mm')}</div>
          <div className="fc-code">{flight.origin.code}</div>
          <div className="fc-city">{flight.origin.city}</div>
        </div>

        <div className="fc-middle">
          <div className="fc-duration"><FaClock size={10} /> {h}h {m}m</div>
          <div className="fc-arrow">
            <div className="fc-line"></div>
            <FaPlane className="fc-plane-icon" />
          </div>
          <div className="fc-stops">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}</div>
        </div>

        <div className="fc-time-block">
          <div className="fc-time">{format(arr, 'HH:mm')}</div>
          <div className="fc-code">{flight.destination.code}</div>
          <div className="fc-city">{flight.destination.city}</div>
        </div>
      </div>

      <div className="fc-amenities">
        <span title="Baggage"><FaSuitcase size={12} /> {flight.baggage?.[key]?.checkin || 15}kg</span>
        <span title="WiFi available"><FaWifi size={12} /> WiFi</span>
      </div>

      <div className="fc-price-block">
        <div className="fc-price">₹{totalPrice.toLocaleString()}</div>
        <div className="fc-price-note">per {passengers > 1 ? `${passengers} pax` : 'person'} · all incl.</div>
        <div className={`fc-seats ${flight.seats?.available?.[key === 'economy' ? 'economy' : 'business'] < 10 ? 'few' : ''}`}>
          {flight.seats?.available?.[key === 'economy' ? 'economy' : 'business']} seats left
        </div>
        <button
          className={`btn ${selected ? 'btn-selected' : 'btn-primary'} btn-sm`}
          onClick={() => onSelect && onSelect(flight)}
        >
          {selected ? '✓ Selected' : 'Select'}
        </button>
      </div>

      <div className={`fc-status-bar status-${flight.status?.toLowerCase().replace(' ', '-')}`}>
        {flight.status}
      </div>
    </div>
  );
}
