import React, { useState, useEffect, useCallback } from 'react';
import { FaTags, FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { adminGetOffers, adminCreateOffer, adminUpdateOffer, adminDeleteOffer } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EMPTY_OFFER = {
  title: '', description: '', code: '',
  discountType: 'Percentage', discountValue: '',
  minBookingAmount: 500, maxDiscount: '',
  validFrom: '', validTill: '',
  usageLimit: 100, isActive: true,
  applicableRoutes: []
};

export default function AdminOffersPage() {
  const [offers, setOffers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(EMPTY_OFFER);
  const [saving, setSaving]   = useState(false);
  const [delId, setDelId]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminGetOffers();
      setOffers(data.offers || []);
    } catch { toast.error('Failed to load offers'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({ ...EMPTY_OFFER, validFrom: new Date().toISOString().slice(0,10), validTill: '' });
    setModal('create');
  };
  const openEdit = (o) => {
    setForm({
      ...o,
      validFrom: o.validFrom?.slice(0,10) || '',
      validTill: o.validTill?.slice(0,10) || '',
    });
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.title || !form.code || !form.discountValue) {
      toast.error('Title, code and discount value are required'); return;
    }
    setSaving(true);
    try {
      if (modal === 'create') {
        await adminCreateOffer(form);
        toast.success('Offer created ✓');
      } else {
        await adminUpdateOffer(form._id, form);
        toast.success('Offer updated ✓');
      }
      setModal(null);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (offer) => {
    try {
      await adminUpdateOffer(offer._id, { isActive: !offer.isActive });
      toast.success(`Offer ${!offer.isActive ? 'activated' : 'deactivated'}`);
      load();
    } catch { toast.error('Toggle failed'); }
  };

  const handleDelete = async () => {
    try {
      await adminDeleteOffer(delId);
      toast.success('Offer deleted');
      setDelId(null);
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title"><FaTags style={{ marginRight: 8 }} />Offers & Promo Codes</div>
          <div className="admin-page-sub">{offers.length} offers in total</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus style={{ marginRight: 6 }} /> Create Offer
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner"></div></div>
      ) : offers.length === 0 ? (
        <div className="admin-card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🏷️</div>
          <p style={{ color: '#6b7280', marginTop: 12 }}>No offers yet. Create your first one!</p>
        </div>
      ) : (
        <div className="offers-grid">
          {offers.map(offer => (
            <div key={offer._id} className={`offer-admin-card ${!offer.isActive ? 'inactive' : ''}`}>
              <div className="offer-card-top">
                <div className="offer-discount-badge">
                  {offer.discountType === 'Flat'
                    ? `₹${offer.discountValue} OFF`
                    : `${offer.discountValue}% OFF`}
                </div>
                <div className="offer-card-actions">
                  <button
                    className="offer-toggle-btn"
                    onClick={() => toggleActive(offer)}
                    title={offer.isActive ? 'Deactivate' : 'Activate'}
                    style={{ color: offer.isActive ? '#22c55e' : '#9ca3af' }}
                  >
                    {offer.isActive ? <FaToggleOn size={22} /> : <FaToggleOff size={22} />}
                  </button>
                  <button className="btn-icon btn-edit" onClick={() => openEdit(offer)}><FaEdit /></button>
                  <button className="btn-icon btn-del" onClick={() => setDelId(offer._id)}><FaTrash /></button>
                </div>
              </div>

              <div className="offer-card-body">
                <div className="offer-title">{offer.title}</div>
                <div className="offer-desc">{offer.description}</div>
                <div className="offer-code-row">
                  <code className="offer-code">{offer.code}</code>
                  <span className={`offer-status ${offer.isActive ? 'active' : 'inactive'}`}>
                    {offer.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              </div>

              <div className="offer-card-footer">
                <div className="offer-meta-item">
                  <span className="meta-label">Min Booking</span>
                  <span className="meta-value">₹{(offer.minBookingAmount || 0).toLocaleString()}</span>
                </div>
                {offer.maxDiscount && (
                  <div className="offer-meta-item">
                    <span className="meta-label">Max Discount</span>
                    <span className="meta-value">₹{offer.maxDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="offer-meta-item">
                  <span className="meta-label">Valid Till</span>
                  <span className="meta-value">
                    {offer.validTill ? format(new Date(offer.validTill), 'dd MMM yy') : '—'}
                  </span>
                </div>
                <div className="offer-meta-item">
                  <span className="meta-label">Usage</span>
                  <span className="meta-value">{offer.usageCount || 0} / {offer.usageLimit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                {modal === 'create' ? '🏷️ Create Offer' : '✏ Edit Offer'}
              </div>
              <button className="modal-close" onClick={() => setModal(null)}><FaTimes /></button>
            </div>
            <div className="admin-modal-body">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-control" value={form.title} onChange={e => setForm(v => ({...v, title: e.target.value}))} placeholder="Summer Sale 2025" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm(v => ({...v, description: e.target.value}))} placeholder="Brief description shown to users" />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Promo Code *</label>
                  <input className="form-control" value={form.code} onChange={e => setForm(v => ({...v, code: e.target.value.toUpperCase()}))} placeholder="SUMMER25" style={{ textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select className="form-control" value={form.discountType} onChange={e => setForm(v => ({...v, discountType: e.target.value}))}>
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Value *</label>
                  <input className="form-control" type="number" value={form.discountValue} onChange={e => setForm(v => ({...v, discountValue: e.target.value}))} placeholder={form.discountType === 'Percentage' ? '20' : '500'} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Discount (₹)</label>
                  <input className="form-control" type="number" value={form.maxDiscount} onChange={e => setForm(v => ({...v, maxDiscount: e.target.value}))} placeholder="1000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Booking (₹)</label>
                  <input className="form-control" type="number" value={form.minBookingAmount} onChange={e => setForm(v => ({...v, minBookingAmount: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Usage Limit</label>
                  <input className="form-control" type="number" value={form.usageLimit} onChange={e => setForm(v => ({...v, usageLimit: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Valid From</label>
                  <input className="form-control" type="date" value={form.validFrom} onChange={e => setForm(v => ({...v, validFrom: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Valid Till</label>
                  <input className="form-control" type="date" value={form.validTill} onChange={e => setForm(v => ({...v, validTill: e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(v => ({...v, isActive: e.target.checked}))} />
                  <span className="form-label" style={{ marginBottom: 0 }}>Active (visible to users)</span>
                </label>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : <><FaSave style={{ marginRight: 6 }} />Save Offer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delId && (
        <div className="admin-modal-overlay" onClick={() => setDelId(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title" style={{ color: '#ef4444' }}>🗑 Delete Offer?</div>
              <button className="modal-close" onClick={() => setDelId(null)}><FaTimes /></button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: '#6b7280' }}>This will permanently delete the promo code and it will stop working immediately.</p>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setDelId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
