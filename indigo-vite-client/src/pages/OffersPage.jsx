import React, { useEffect, useState } from 'react';
import { getOffers } from '../services/api';

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    getOffers().then(r => setOffers(r.data.offers || [])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const copy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'Poppins', fontSize: 32, fontWeight: 800, marginBottom: 8 }}>✈️ Special Offers</h1>
      <p style={{ color: '#6b7280', marginBottom: 36 }}>Exclusive deals just for you</p>

      {loading ? <div className="spinner"></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {offers.map(o => (
            <div key={o._id} className="card" style={{ borderLeft: '4px solid #0052a5' }}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{o.title}</h3>
                  <span className="badge badge-blue">{o.discountType === 'Flat' ? `₹${o.discountValue} OFF` : `${o.discountValue}% OFF`}</span>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>{o.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, background: '#f5f7fa', padding: '8px 12px', borderRadius: 8, fontFamily: 'monospace', fontWeight: 700, fontSize: 16, color: '#0052a5', letterSpacing: 2 }}>
                    {o.code}
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => copy(o.code)}>
                    {copied === o.code ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>
                  Min: ₹{o.minBookingAmount} · Expires {new Date(o.validTill).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
