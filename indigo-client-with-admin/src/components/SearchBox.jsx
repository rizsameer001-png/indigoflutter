import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExchangeAlt, FaCalendarAlt, FaUser, FaSearch } from 'react-icons/fa';
import { format, addDays } from 'date-fns';
import { getAirports } from '../services/api';
import './SearchBox.css';

export default function SearchBox({ initialValues }) {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState('One Way');
  const [from, setFrom] = useState(initialValues?.from || '');
  const [fromCity, setFromCity] = useState(initialValues?.fromCity || '');
  const [to, setTo] = useState(initialValues?.to || '');
  const [toCity, setToCity] = useState(initialValues?.toCity || '');
  const [date, setDate] = useState(initialValues?.date || format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [returnDate, setReturnDate] = useState(initialValues?.returnDate || format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [passengers, setPassengers] = useState(initialValues?.passengers || 1);
  const [cabinClass, setCabinClass] = useState(initialValues?.class || 'Economy');
  const [airports, setAirports] = useState([]);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  useEffect(() => {
    getAirports({ popular: true }).then(res => setAirports(res.data.airports || [])).catch(() => {});
  }, []);

  const filterAirports = (query) =>
    airports.filter(a =>
      a.code.toLowerCase().includes(query.toLowerCase()) ||
      a.city.toLowerCase().includes(query.toLowerCase()) ||
      a.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);

  const handleFromChange = (e) => {
    const val = e.target.value;
    setFrom(val);
    setFromSuggestions(val ? filterAirports(val) : airports.filter(a => a.popular).slice(0, 6));
    setShowFrom(true);
  };

  const handleToChange = (e) => {
    const val = e.target.value;
    setTo(val);
    setToSuggestions(val ? filterAirports(val) : airports.filter(a => a.popular).slice(0, 6));
    setShowTo(true);
  };

  const swapCities = () => {
    setFrom(to); setFromCity(toCity);
    setTo(from); setToCity(fromCity);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      from, to, date, passengers, class: cabinClass, tripType,
      ...(tripType === 'Round Trip' && { returnDate }),
      fromCity, toCity
    });
    navigate(`/flights/search?${params.toString()}`);
  };

  return (
    <div className="search-box">
      <div className="trip-type-tabs">
        {['One Way', 'Round Trip', 'Multi City'].map(t => (
          <button key={t} className={`trip-tab ${tripType === t ? 'active' : ''}`} onClick={() => setTripType(t)}>
            {t}
          </button>
        ))}
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-row">
          {/* From */}
          <div className="search-field" ref={fromRef}>
            <label>FROM</label>
            <input
              className="search-input"
              placeholder="City or Airport"
              value={from}
              onChange={handleFromChange}
              onFocus={() => { setFromSuggestions(filterAirports(from) || airports.filter(a => a.popular).slice(0, 6)); setShowFrom(true); }}
              onBlur={() => setTimeout(() => setShowFrom(false), 200)}
              required
            />
            {fromCity && <span className="city-sub">{fromCity}</span>}
            {showFrom && fromSuggestions.length > 0 && (
              <div className="airport-dropdown">
                {fromSuggestions.map(a => (
                  <div key={a.code} className="airport-option" onMouseDown={() => { setFrom(a.code); setFromCity(a.city); setShowFrom(false); }}>
                    <span className="apt-code">{a.code}</span>
                    <div><div className="apt-city">{a.city}</div><div className="apt-name">{a.name}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="button" className="swap-btn" onClick={swapCities}><FaExchangeAlt /></button>

          {/* To */}
          <div className="search-field" ref={toRef}>
            <label>TO</label>
            <input
              className="search-input"
              placeholder="City or Airport"
              value={to}
              onChange={handleToChange}
              onFocus={() => { setToSuggestions(filterAirports(to) || airports.filter(a => a.popular).slice(0, 6)); setShowTo(true); }}
              onBlur={() => setTimeout(() => setShowTo(false), 200)}
              required
            />
            {toCity && <span className="city-sub">{toCity}</span>}
            {showTo && toSuggestions.length > 0 && (
              <div className="airport-dropdown">
                {toSuggestions.map(a => (
                  <div key={a.code} className="airport-option" onMouseDown={() => { setTo(a.code); setToCity(a.city); setShowTo(false); }}>
                    <span className="apt-code">{a.code}</span>
                    <div><div className="apt-city">{a.city}</div><div className="apt-name">{a.name}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="search-field">
            <label><FaCalendarAlt size={10} /> DEPART</label>
            <input type="date" className="search-input" value={date} min={format(new Date(), 'yyyy-MM-dd')} onChange={e => setDate(e.target.value)} required />
          </div>

          {tripType === 'Round Trip' && (
            <div className="search-field">
              <label><FaCalendarAlt size={10} /> RETURN</label>
              <input type="date" className="search-input" value={returnDate} min={date} onChange={e => setReturnDate(e.target.value)} />
            </div>
          )}

          {/* Passengers & Class */}
          <div className="search-field search-field-narrow">
            <label><FaUser size={10} /> TRAVELLERS</label>
            <select className="search-input" value={passengers} onChange={e => setPassengers(e.target.value)}>
              {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>)}
            </select>
          </div>

          <div className="search-field search-field-narrow">
            <label>CLASS</label>
            <select className="search-input" value={cabinClass} onChange={e => setCabinClass(e.target.value)}>
              <option>Economy</option>
              <option>Business</option>
            </select>
          </div>

          <button type="submit" className="btn btn-orange btn-lg search-btn">
            <FaSearch /> Search
          </button>
        </div>
      </form>
    </div>
  );
}
