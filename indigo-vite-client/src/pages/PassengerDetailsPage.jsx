import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import useBookingStore from '../store/bookingStore';
import './PassengerDetailsPage.css';

const blankPassenger = () => ({
  title: 'Mr', firstName: '', lastName: '', dateOfBirth: '',
  gender: 'Male', nationality: 'Indian', type: 'Adult',
  passportNumber: '', mealPreference: 'None'
});

export default function PassengerDetailsPage() {
  const navigate = useNavigate();
  const { setPassengers, setContactInfo, searchParams } = useBookingStore();
  const count = parseInt(searchParams?.passengers || 1);

  const [paxList, setPaxList] = useState(Array.from({ length: count }, blankPassenger));
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const update = (i, field, val) => {
    const list = [...paxList];
    list[i] = { ...list[i], [field]: val };
    setPaxList(list);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const invalid = paxList.find(p => !p.firstName || !p.lastName);
    if (invalid) { toast.error('Please fill all passenger names'); return; }
    if (!contactEmail || !contactPhone) { toast.error('Please fill contact details'); return; }
    setPassengers(paxList);
    setContactInfo({ contactEmail, contactPhone });
    navigate('/booking/addons');
  };

  return (
    <div className="pax-page container">
      {/* Steps */}
      <div className="steps">
        <div className="step done"><div className="step-number">✓</div><span className="step-label">Flights</span></div>
        <div className="step-line done"></div>
        <div className="step active"><div className="step-number">2</div><span className="step-label">Passengers</span></div>
        <div className="step-line"></div>
        <div className="step inactive"><div className="step-number">3</div><span className="step-label">Add-ons</span></div>
        <div className="step-line"></div>
        <div className="step inactive"><div className="step-number">4</div><span className="step-label">Payment</span></div>
      </div>

      <form onSubmit={handleSubmit}>
        {paxList.map((pax, i) => (
          <div key={i} className="card pax-card">
            <div className="card-body">
              <h3 className="pax-title"><FaUser size={14} /> Passenger {i + 1}</h3>
              <div className="pax-grid">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <select className="form-control" value={pax.title} onChange={e => update(i, 'title', e.target.value)}>
                    {['Mr','Mrs','Ms','Dr','Master','Miss'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className="form-control" value={pax.firstName} onChange={e => update(i, 'firstName', e.target.value)} required placeholder="As on ID/Passport" />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input className="form-control" value={pax.lastName} onChange={e => update(i, 'lastName', e.target.value)} required placeholder="As on ID/Passport" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-control" value={pax.dateOfBirth} onChange={e => update(i, 'dateOfBirth', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={pax.gender} onChange={e => update(i, 'gender', e.target.value)}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nationality</label>
                  <input className="form-control" value={pax.nationality} onChange={e => update(i, 'nationality', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Passenger Type</label>
                  <select className="form-control" value={pax.type} onChange={e => update(i, 'type', e.target.value)}>
                    <option>Adult</option><option>Child</option><option>Infant</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Meal Preference</label>
                  <select className="form-control" value={pax.mealPreference} onChange={e => update(i, 'mealPreference', e.target.value)}>
                    <option>None</option><option>Veg</option><option>Non-Veg</option><option>Jain</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Contact */}
        <div className="card pax-card">
          <div className="card-body">
            <h3 className="pax-title">📬 Contact Information</h3>
            <p className="contact-note">Booking confirmation will be sent to this contact</p>
            <div className="pax-grid">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" className="form-control" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input type="tel" className="form-control" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required placeholder="10-digit mobile number" />
              </div>
            </div>
          </div>
        </div>

        <div className="pax-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
          <button type="submit" className="btn btn-primary btn-lg">Continue to Add-ons →</button>
        </div>
      </form>
    </div>
  );
}
