import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaEye, FaTimes, FaTicketAlt } from 'react-icons/fa';
import { adminGetBookings, adminUpdateBookingStatus } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['Confirmed', 'Pending', 'Cancelled', 'Completed', 'No Show'];
const STATUS_COLORS  = {
  Confirmed: { bg: '#e8f5e9', text: '#2e7d32' },
  Pending:   { bg: '#fff8e1', text: '#f57f17' },
  Cancelled: { bg: '#ffebee', text: '#c62828' },
  Completed: { bg: '#e3f2fd', text: '#1565c0' },
  'No Show': { bg: '#f3f4f6', text: '#6b7280' },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [page, setPage]         = useState(1);
  const [viewing, setViewing]   = useState(null);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminGetBookings({ page, limit: LIMIT, search, status });
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, newStatus) => {
    try {
      await adminUpdateBookingStatus(id, newStatus);
      toast.success('Status updated ✓');
      load();
      if (viewing?._id === id) setViewing(v => ({ ...v, status: newStatus }));
    } catch { toast.error('Update failed'); }
  };

  const sc = (s) => STATUS_COLORS[s] || STATUS_COLORS['No Show'];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title"><FaTicketAlt style={{ marginRight: 8 }} />Bookings</div>
          <div className="admin-page-sub">{total} total bookings</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-filters">
            <label className="admin-search">
              <FaSearch style={{ color: '#9ca3af' }} />
              <input
                placeholder="Search PNR or email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </label>
            <select
              className="admin-filter-select"
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="admin-table-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 50 }}><div className="spinner"></div></div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>PNR</th><th>Passenger</th><th>Route</th><th>Class</th>
                  <th>Amount</th><th>Status</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan="8">
                    <div className="admin-empty"><div className="admin-empty-icon">🎫</div><p>No bookings found</p></div>
                  </td></tr>
                ) : bookings.map(b => {
                  const flight = b.trip?.outbound;
                  const firstPax = b.passengers?.[0];
                  return (
                    <tr key={b._id}>
                      <td>
                        <code style={{ fontWeight: 800, color: '#0052a5', fontSize: 13, letterSpacing: 1 }}>{b.pnr}</code>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {firstPax ? `${firstPax.title} ${firstPax.firstName} ${firstPax.lastName}` : '—'}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{b.contactEmail}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>
                        {flight ? (
                          <>
                            <span style={{ fontWeight: 700 }}>{flight.origin?.code}</span>
                            <span style={{ color: '#9ca3af', margin: '0 4px' }}>→</span>
                            <span style={{ fontWeight: 700 }}>{flight.destination?.code}</span>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{flight.flightNumber}</div>
                          </>
                        ) : '—'}
                      </td>
                      <td style={{ fontSize: 12 }}>{b.class}</td>
                      <td style={{ fontWeight: 700 }}>₹{(b.pricing?.total || 0).toLocaleString()}</td>
                      <td>
                        <select
                          value={b.status}
                          onChange={e => changeStatus(b._id, e.target.value)}
                          style={{
                            background: sc(b.status).bg,
                            color: sc(b.status).text,
                            border: 'none', borderRadius: 6, padding: '4px 8px',
                            fontWeight: 700, fontSize: 11, cursor: 'pointer'
                          }}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>
                        {format(new Date(b.createdAt), 'dd MMM yy')}
                      </td>
                      <td>
                        <button className="btn-icon btn-view" onClick={() => setViewing(b)} title="View"><FaEye /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="admin-pagination">
          <span>Showing {Math.min((page-1)*LIMIT+1,total)}–{Math.min(page*LIMIT,total)} of {total}</span>
          <div className="pagination-btns">
            <button disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</button>
            <button disabled={page*LIMIT>=total} onClick={() => setPage(p=>p+1)}>Next →</button>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {viewing && (
        <div className="admin-modal-overlay" onClick={() => setViewing(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                Booking&nbsp;
                <code style={{ color: '#0052a5', letterSpacing: 1 }}>{viewing.pnr}</code>
              </div>
              <button className="modal-close" onClick={() => setViewing(null)}><FaTimes /></button>
            </div>
            <div className="admin-modal-body">
              {/* Flight info */}
              {viewing.trip?.outbound && (
                <div className="detail-section">
                  <div className="detail-title">Flight</div>
                  <div className="detail-row">
                    <span>{viewing.trip.outbound.origin?.city} ({viewing.trip.outbound.origin?.code})</span>
                    <span style={{ color: '#9ca3af' }}>→</span>
                    <span>{viewing.trip.outbound.destination?.city} ({viewing.trip.outbound.destination?.code})</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    {viewing.trip.outbound.flightNumber} · {viewing.class} ·&nbsp;
                    {viewing.trip.outbound.departureTime && format(new Date(viewing.trip.outbound.departureTime), 'dd MMM yyyy HH:mm')}
                  </div>
                </div>
              )}
              {/* Passengers */}
              <div className="detail-section">
                <div className="detail-title">Passengers ({viewing.passengers?.length})</div>
                {(viewing.passengers || []).map((p, i) => (
                  <div key={i} style={{ fontSize: 13, padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                    {p.title} {p.firstName} {p.lastName}
                    <span style={{ color: '#9ca3af', marginLeft: 8, fontSize: 11 }}>{p.type} · {p.mealPreference}</span>
                  </div>
                ))}
              </div>
              {/* Contact */}
              <div className="detail-section">
                <div className="detail-title">Contact</div>
                <div style={{ fontSize: 13 }}>{viewing.contactEmail}</div>
                <div style={{ fontSize: 13 }}>{viewing.contactPhone}</div>
              </div>
              {/* Pricing */}
              <div className="detail-section">
                <div className="detail-title">Pricing</div>
                {[
                  ['Base Fare', viewing.pricing?.baseFare],
                  ['Taxes', viewing.pricing?.taxes],
                  ['Add-ons', viewing.pricing?.addons],
                  ['Discount', viewing.pricing?.discount ? `-₹${viewing.pricing.discount}` : null],
                ].map(([label, val]) => val != null && (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
                    <span style={{ color: '#6b7280' }}>{label}</span>
                    <span>₹{typeof val === 'number' ? val.toLocaleString() : val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, borderTop: '1px solid #e5e7eb', paddingTop: 8, marginTop: 4 }}>
                  <span>Total</span>
                  <span style={{ color: '#0052a5' }}>₹{(viewing.pricing?.total || 0).toLocaleString()}</span>
                </div>
              </div>
              {/* Status change */}
              <div className="detail-section">
                <div className="detail-title">Change Status</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => changeStatus(viewing._id, s)}
                      style={{
                        padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontWeight: 700, fontSize: 12,
                        background: viewing.status === s ? sc(s).text : sc(s).bg,
                        color: viewing.status === s ? 'white' : sc(s).text,
                        transition: 'all 0.15s'
                      }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewing(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
