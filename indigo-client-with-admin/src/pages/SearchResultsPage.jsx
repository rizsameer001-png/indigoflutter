import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaFilter, FaSort } from 'react-icons/fa';
import { searchFlights } from '../services/api';
import FlightCard from '../components/FlightCard';
import SearchBox from '../components/SearchBox';
import useBookingStore from '../store/bookingStore';
import './SearchResultsPage.css';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSelectedOutbound, setSelectedReturn, setSearchParams: setStore, setCabinClass } = useBookingStore();

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');
  const returnDate = searchParams.get('returnDate');
  const passengers = parseInt(searchParams.get('passengers')) || 1;
  const cabinClass = searchParams.get('class') || 'Economy';
  const tripType = searchParams.get('tripType') || 'One Way';

  const [outbound, setOutbound] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price');
  const [filterStop, setFilterStop] = useState('all');
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);

  useEffect(() => {
    setLoading(true);
    searchFlights({ from, to, date, returnDate, passengers, class: cabinClass, tripType })
      .then(res => {
        setOutbound(res.data.outbound || []);
        setReturnFlights(res.data.return || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [from, to, date, cabinClass, passengers]);

  const sort = (flights) => {
    const arr = [...flights];
    const key = cabinClass.toLowerCase();
    if (sortBy === 'price') arr.sort((a, b) => a.price[key].base - b.price[key].base);
    else if (sortBy === 'duration') arr.sort((a, b) => a.duration - b.duration);
    else if (sortBy === 'departure') arr.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
    return arr;
  };

  const filter = (flights) => {
    if (filterStop === 'nonstop') return flights.filter(f => f.stops === 0);
    if (filterStop === 'stop') return flights.filter(f => f.stops > 0);
    return flights;
  };

  const processed = filter(sort(outbound));
  const processedReturn = filter(sort(returnFlights));

  const handleSelectOutbound = (flight) => {
    setSelectedOutboundFlight(flight);
    setSelectedOutbound(flight);
    setCabinClass(cabinClass);
    setStore({ from, to, date, returnDate, passengers, class: cabinClass, tripType });
  };

  const handleContinue = () => {
    if (tripType === 'Round Trip' && !selectedReturnFlight) return;
    if (selectedReturnFlight) setSelectedReturn(selectedReturnFlight);
    navigate('/booking/passengers');
  };

  return (
    <div className="results-page">
      <div className="results-search-bar">
        <div className="container">
          <SearchBox initialValues={{ from, to, date, returnDate, passengers, class: cabinClass, fromCity: searchParams.get('fromCity'), toCity: searchParams.get('toCity') }} />
        </div>
      </div>

      <div className="container results-body">
        {/* Filters */}
        <div className="results-toolbar">
          <div className="results-count">
            {loading ? 'Searching...' : `${processed.length} flight${processed.length !== 1 ? 's' : ''} found`}
          </div>
          <div className="results-controls">
            <div className="filter-group">
              <FaFilter size={12} />
              <select value={filterStop} onChange={e => setFilterStop(e.target.value)}>
                <option value="all">All Flights</option>
                <option value="nonstop">Non-stop Only</option>
                <option value="stop">With Stops</option>
              </select>
            </div>
            <div className="filter-group">
              <FaSort size={12} />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="price">Sort: Price ↑</option>
                <option value="duration">Sort: Duration</option>
                <option value="departure">Sort: Departure</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Searching for the best fares...</p>
          </div>
        ) : processed.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">✈️</div>
            <h3>No flights found</h3>
            <p>Try different dates or routes</p>
          </div>
        ) : (
          <>
            {tripType === 'Round Trip' && (
              <div className="section-label">
                <span>➡ Outbound: {from} → {to} on {date}</span>
              </div>
            )}
            <div className="flight-list">
              {processed.map(f => (
                <FlightCard
                  key={f._id}
                  flight={f}
                  cabinClass={cabinClass}
                  passengers={passengers}
                  selected={selectedOutboundFlight?._id === f._id}
                  onSelect={handleSelectOutbound}
                />
              ))}
            </div>

            {tripType === 'Round Trip' && processedReturn.length > 0 && selectedOutboundFlight && (
              <>
                <div className="section-label return">
                  <span>↩ Return: {to} → {from} on {returnDate}</span>
                </div>
                <div className="flight-list">
                  {processedReturn.map(f => (
                    <FlightCard
                      key={f._id}
                      flight={f}
                      cabinClass={cabinClass}
                      passengers={passengers}
                      selected={selectedReturnFlight?._id === f._id}
                      onSelect={(flight) => { setSelectedReturnFlight(flight); setSelectedReturn(flight); }}
                    />
                  ))}
                </div>
              </>
            )}

            {selectedOutboundFlight && (
              <div className="continue-bar">
                <div className="continue-summary">
                  Selected: {selectedOutboundFlight.flightNumber} · {cabinClass}
                  {selectedReturnFlight && ` + Return ${selectedReturnFlight.flightNumber}`}
                </div>
                <button className="btn btn-primary btn-lg" onClick={handleContinue}>
                  Continue →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
