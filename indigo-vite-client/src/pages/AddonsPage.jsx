import React from 'react';
import { useNavigate } from 'react-router-dom';
import useBookingStore from '../store/bookingStore';
import './AddonsPage.css';

const ADDONS = [
  { key: 'extraBaggage', icon: '🧳', title: 'Extra Baggage', desc: '+15kg check-in baggage', price: 599, tag: 'Popular' },
  { key: 'mealPlan', icon: '🍱', title: 'Meal Plan', desc: 'Pre-order delicious meals', price: 299, tag: '' },
  { key: 'seatSelection', icon: '💺', title: 'Seat Selection', desc: 'Choose your preferred seat', price: 199, tag: 'Recommended' },
  { key: 'travelInsurance', icon: '🛡️', title: 'Travel Insurance', desc: 'Comprehensive travel cover', price: 499, tag: '' },
  { key: 'priorityBoarding', icon: '⚡', title: 'Priority Boarding', desc: 'Board first, avoid queues', price: 199, tag: '' },
];

export default function AddonsPage() {
  const navigate = useNavigate();
  const { addons, setAddons, getTotalPrice, selectedOutbound, cabinClass, passengers } = useBookingStore();

  const toggle = (key) => setAddons({ ...addons, [key]: !addons[key] });

  return (
    <div className="addons-page container">
      <div className="steps">
        <div className="step done"><div className="step-number">✓</div><span className="step-label">Flights</span></div>
        <div className="step-line done"></div>
        <div className="step done"><div className="step-number">✓</div><span className="step-label">Passengers</span></div>
        <div className="step-line done"></div>
        <div className="step active"><div className="step-number">3</div><span className="step-label">Add-ons</span></div>
        <div className="step-line"></div>
        <div className="step inactive"><div className="step-number">4</div><span className="step-label">Payment</span></div>
      </div>

      <div className="addons-layout">
        <div className="addons-list">
          <h2 className="addons-heading">🎁 Enhance Your Journey</h2>
          <p className="addons-sub">Add services to make your trip more comfortable</p>

          {ADDONS.map(a => (
            <div key={a.key} className={`addon-card ${addons[a.key] ? 'selected' : ''}`} onClick={() => toggle(a.key)}>
              <div className="addon-left">
                <span className="addon-icon">{a.icon}</span>
                <div>
                  <div className="addon-title">
                    {a.title}
                    {a.tag && <span className="addon-tag">{a.tag}</span>}
                  </div>
                  <div className="addon-desc">{a.desc}</div>
                </div>
              </div>
              <div className="addon-right">
                <div className="addon-price">₹{a.price} <span>/pax</span></div>
                <div className={`addon-check ${addons[a.key] ? 'checked' : ''}`}>
                  {addons[a.key] ? '✓' : '+'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="price-summary card">
          <div className="card-body">
            <h3>Price Summary</h3>
            <div className="summary-row">
              <span>Base Fare ({passengers?.length || 1} pax)</span>
              <span>₹{selectedOutbound ? ((selectedOutbound.price[cabinClass.toLowerCase()].base + selectedOutbound.price[cabinClass.toLowerCase()].taxes) * (passengers?.length || 1)).toLocaleString() : 0}</span>
            </div>
            {ADDONS.filter(a => addons[a.key]).map(a => (
              <div key={a.key} className="summary-row addon">
                <span>{a.title}</span>
                <span>+₹{(a.price * (passengers?.length || 1)).toLocaleString()}</span>
              </div>
            ))}
            <div className="divider"></div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{getTotalPrice().toLocaleString()}</span>
            </div>
            <p className="tax-note">* Inclusive of all taxes</p>
          </div>
        </div>
      </div>

      <div className="pax-actions">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/booking/payment')}>
          Proceed to Payment →
        </button>
      </div>
    </div>
  );
}
