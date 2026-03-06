import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createBooking, confirmPayment, validatePromo } from '../services/api';
import useBookingStore from '../store/bookingStore';
import './PaymentPage.css';

export default function PaymentPage() {
  const navigate = useNavigate();
  const store = useBookingStore();
  const [payMethod, setPayMethod] = useState('card');
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const total = store.getTotalPrice();

  const applyPromo = async () => {
    if (!promoInput) return;
    try {
      const res = await validatePromo({ code: promoInput, amount: total });
      store.setPromo(promoInput, res.data.discount);
      setPromoApplied(res.data);
      toast.success(`Promo applied! Saved ₹${res.data.discount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid promo code');
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!store.selectedOutbound) { toast.error('No flight selected'); return; }
    setLoading(true);
    try {
      const bookingRes = await createBooking({
        flightId: store.selectedOutbound._id,
        returnFlightId: store.selectedReturn?._id,
        passengers: store.passengers,
        class: store.cabinClass,
        contactEmail: store.contactInfo?.contactEmail,
        contactPhone: store.contactInfo?.contactPhone,
        addons: store.addons,
      });
      const booking = bookingRes.data.booking;

      // Simulate payment
      await confirmPayment({
        bookingId: booking._id,
        paymentMethod: payMethod,
        transactionId: 'TXN' + Date.now()
      });

      toast.success('Booking confirmed! 🎉');
      store.reset();
      navigate(`/booking/confirmation?pnr=${booking.pnr}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page container">
      <div className="steps">
        <div className="step done"><div className="step-number">✓</div><span className="step-label">Flights</span></div>
        <div className="step-line done"></div>
        <div className="step done"><div className="step-number">✓</div><span className="step-label">Passengers</span></div>
        <div className="step-line done"></div>
        <div className="step done"><div className="step-number">✓</div><span className="step-label">Add-ons</span></div>
        <div className="step-line done"></div>
        <div className="step active"><div className="step-number">4</div><span className="step-label">Payment</span></div>
      </div>

      <div className="payment-layout">
        <form className="payment-form" onSubmit={handlePay}>
          <div className="card">
            <div className="card-body">
              <h2 className="payment-title">🔒 Secure Payment</h2>

              {/* Promo */}
              <div className="promo-row">
                <input
                  className="form-control"
                  placeholder="Enter promo code"
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value.toUpperCase())}
                />
                <button type="button" className="btn btn-secondary" onClick={applyPromo}>Apply</button>
              </div>
              {promoApplied && <div className="promo-success">✓ {promoApplied.offer?.title} — Saved ₹{promoApplied.discount}</div>}

              {/* Payment Methods */}
              <div className="pay-methods">
                {[
                  { key: 'card', label: '💳 Credit/Debit Card' },
                  { key: 'upi', label: '📱 UPI' },
                  { key: 'netbanking', label: '🏦 Net Banking' },
                  { key: 'wallet', label: '👛 Wallet' },
                ].map(m => (
                  <label key={m.key} className={`pay-method ${payMethod === m.key ? 'active' : ''}`}>
                    <input type="radio" name="payMethod" value={m.key} checked={payMethod === m.key} onChange={e => setPayMethod(e.target.value)} />
                    {m.label}
                  </label>
                ))}
              </div>

              {payMethod === 'card' && (
                <div className="card-form">
                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input className="form-control" placeholder="1234 5678 9012 3456" value={cardNum}
                      onChange={e => setCardNum(e.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim())} maxLength="19" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cardholder Name</label>
                    <input className="form-control" placeholder="Name on card" value={cardName} onChange={e => setCardName(e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Expiry (MM/YY)</label>
                      <input className="form-control" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} maxLength="5" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input className="form-control" placeholder="•••" type="password" value={cvv} onChange={e => setCvv(e.target.value)} maxLength="4" />
                    </div>
                  </div>
                </div>
              )}

              {payMethod === 'upi' && (
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">UPI ID</label>
                  <input className="form-control" placeholder="yourname@upi" />
                </div>
              )}

              <div className="pay-note">🔒 Your payment info is 256-bit encrypted & secure</div>

              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading} style={{ marginTop: 20 }}>
                {loading ? 'Processing...' : `Pay ₹${store.getTotalPrice().toLocaleString()}`}
              </button>
            </div>
          </div>
        </form>

        {/* Price sidebar */}
        <div className="payment-summary card">
          <div className="card-body">
            <h3>Booking Summary</h3>
            {store.selectedOutbound && (
              <div className="booking-flight-info">
                <div className="bfi-row">
                  <strong>{store.selectedOutbound.origin.code}</strong>
                  <span>✈</span>
                  <strong>{store.selectedOutbound.destination.code}</strong>
                </div>
                <div className="bfi-detail">{store.selectedOutbound.flightNumber} · {store.cabinClass}</div>
              </div>
            )}
            <hr className="divider" />
            <div className="summary-row"><span>Base Fare</span><span>₹{store.selectedOutbound ? (store.selectedOutbound.price[store.cabinClass.toLowerCase()].base * (store.passengers?.length || 1)).toLocaleString() : 0}</span></div>
            <div className="summary-row"><span>Taxes & Fees</span><span>₹{store.selectedOutbound ? (store.selectedOutbound.price[store.cabinClass.toLowerCase()].taxes * (store.passengers?.length || 1)).toLocaleString() : 0}</span></div>
            {store.discount > 0 && <div className="summary-row" style={{color:'#22c55e'}}><span>Discount</span><span>-₹{store.discount}</span></div>}
            <hr className="divider" />
            <div className="summary-row total"><span>Total</span><span>₹{store.getTotalPrice().toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
