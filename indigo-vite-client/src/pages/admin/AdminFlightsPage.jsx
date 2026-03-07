import React, { useState, useEffect, useCallback } from 'react';
import { FaPlane, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaSave } from 'react-icons/fa';
import {
  adminGetFlights, adminCreateFlight,
  adminUpdateFlight, adminDeleteFlight
} from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EMPTY_FLIGHT = {
  flightNumber: '', airline: 'IndiGo', aircraft: 'Airbus A320',
  origin: { code: '', city: '', airport: '', terminal: '' },
  destination: { code: '', city: '', airport: '', terminal: '' },
  departureTime: '', arrivalTime: '', duration: '',
  stops: 0, status: 'Scheduled',
  price: {
    economy:  { base: '', taxes: '' },
    business: { base: '', taxes: '' }
  },
  seats: {
    total: 198,
    available: { economy: 180, business: 18 }
  }
};

export default function AdminFlightsPage() {
  const [flights, setFlights]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [modal, setModal]       = useState(null); // null | 'create' | 'edit'
  const [form, setForm]         = useState(EMPTY_FLIGHT);
  const [saving, setSaving]     = useState(false);
  const [delId, setDelId]       = useState(null);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminGetFlights({ page, limit: LIMIT, search });
      setFlights(data.flights || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load flights'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(JSON.parse(JSON.stringify(EMPTY_FLIGHT))); setModal('create'); };
  const openEdit   = (f) => {
    // Normalise seats from API response — seats.total may be a Number or legacy Object
    const totalSeats = typeof f.seats?.total === 'number'
      ? f.seats.total
      : (f.seats?.available?.economy || 150) + (f.seats?.available?.business || 18);
    setForm({
      ...f,
      departureTime: f.departureTime?.slice(0,16) || '',
      arrivalTime:   f.arrivalTime?.slice(0,16)   || '',
      seats: {
        total: totalSeats,
        available: {
          economy:  f.seats?.available?.economy  ?? 150,
          business: f.seats?.available?.business ?? 18,
        },
      },
    });
    setModal('edit');
  };

  const setNested = (path, val) => {
    setForm(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = val;
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.flightNumber || !form.origin.code || !form.destination.code) {
      toast.error('Flight number, origin and destination are required'); return;
    }
    setSaving(true);
    try {
      // Normalise seats: the Mongoose schema stores seats.total as a single Number
      // (total capacity) and seats.available as { economy, business }.
      // The EMPTY_FLIGHT accidentally had seats.total as { economy, business } — fix it here.
      const econSeats = typeof form.seats?.available?.economy === 'number'
        ? form.seats.available.economy : 150;
      const bizSeats  = typeof form.seats?.available?.business === 'number'
        ? form.seats.available.business : 18;
      const totalSeats = typeof form.seats?.total === 'number'
        ? form.seats.total
        : (econSeats + bizSeats);

      const payload = {
        ...form,
        seats: {
          total: totalSeats,
          available: { economy: econSeats, business: bizSeats },
        },
        // Ensure numeric fields are numbers, not strings
        duration: Number(form.duration) || 0,
        stops: Number(form.stops) || 0,
        price: {
          economy:  { base: Number(form.price?.economy?.base)  || 0, taxes: Number(form.price?.economy?.taxes)  || 0 },
          business: { base: Number(form.price?.business?.base) || 0, taxes: Number(form.price?.business?.taxes) || 0 },
        },
      };

      if (modal === 'create') {
        await adminCreateFlight(payload);
        toast.success('Flight created ✓');
      } else {
        await adminUpdateFlight(form._id, payload);
        toast.success('Flight updated ✓');
      }
      setModal(null);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await adminDeleteFlight(id);
      toast.success('Flight deleted');
      setDelId(null);
      load();
    } catch { toast.error('Delete failed'); }
  };

  const statusColors = {
    Scheduled: '#0052a5', 'On Time': '#22c55e', Delayed: '#f59e0b',
    Boarding: '#8b5cf6', Cancelled: '#ef4444', Completed: '#6b7280'
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">✈ Flights</div>
          <div className="admin-page-sub">{total} flights in the system</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus style={{ marginRight: 6 }} /> Add Flight
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-filters">
            <label className="admin-search">
              <FaSearch style={{ color: '#9ca3af' }} />
              <input
                placeholder="Search flight, route..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </label>
          </div>
        </div>

        <div className="admin-table-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 50 }}><div className="spinner"></div></div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Flight</th><th>Route</th><th>Departure</th><th>Duration</th>
                  <th>Economy</th><th>Business</th><th>Seats</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {flights.length === 0 ? (
                  <tr><td colSpan="9">
                    <div className="admin-empty"><div className="admin-empty-icon">✈️</div><p>No flights found</p></div>
                  </td></tr>
                ) : flights.map(f => (
                  <tr key={f._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0052a5' }}>{f.flightNumber}</span>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{f.aircraft}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{f.origin?.code}</span>
                      <span style={{ color: '#9ca3af', margin: '0 4px' }}>→</span>
                      <span style={{ fontWeight: 600 }}>{f.destination?.code}</span>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{f.origin?.city} → {f.destination?.city}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {f.departureTime ? format(new Date(f.departureTime), 'dd MMM, HH:mm') : '—'}
                    </td>
                    <td>{f.duration ? `${Math.floor(f.duration/60)}h ${f.duration%60}m` : '—'}</td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{((f.price?.economy?.base || 0) + (f.price?.economy?.taxes || 0)).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{((f.price?.business?.base || 0) + (f.price?.business?.taxes || 0)).toLocaleString()}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <span style={{ color: '#22c55e', fontWeight: 600 }}>{f.seats?.available?.economy}</span>
                      <span style={{ color: '#9ca3af' }}> / {typeof f.seats?.total === 'number' ? f.seats.total : '—'}</span>
                    </td>
                    <td>
                      <span className="badge" style={{
                        background: (statusColors[f.status] || '#9ca3af') + '18',
                        color: statusColors[f.status] || '#6b7280',
                        padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700
                      }}>{f.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon btn-edit" onClick={() => openEdit(f)} title="Edit"><FaEdit /></button>
                        <button className="btn-icon btn-del" onClick={() => setDelId(f._id)} title="Delete"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="admin-pagination">
          <span>Showing {Math.min((page-1)*LIMIT+1, total)}–{Math.min(page*LIMIT, total)} of {total}</span>
          <div className="pagination-btns">
            <button disabled={page === 1} onClick={() => setPage(p => p-1)}>← Prev</button>
            <button disabled={page * LIMIT >= total} onClick={() => setPage(p => p+1)}>Next →</button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                {modal === 'create' ? '✈ Add New Flight' : `✏ Edit ${form.flightNumber}`}
              </div>
              <button className="modal-close" onClick={() => setModal(null)}><FaTimes /></button>
            </div>
            <div className="admin-modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Flight Number *</label>
                  <input className="form-control" value={form.flightNumber} onChange={e => setNested('flightNumber', e.target.value)} placeholder="6E101" />
                </div>
                <div className="form-group">
                  <label className="form-label">Aircraft</label>
                  <input className="form-control" value={form.aircraft} onChange={e => setNested('aircraft', e.target.value)} />
                </div>
              </div>

              <div className="form-section-title">Origin</div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">IATA Code *</label>
                  <input className="form-control" value={form.origin.code} onChange={e => setNested('origin.code', e.target.value.toUpperCase())} placeholder="DEL" maxLength={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-control" value={form.origin.city} onChange={e => setNested('origin.city', e.target.value)} placeholder="Delhi" />
                </div>
                <div className="form-group">
                  <label className="form-label">Airport Name</label>
                  <input className="form-control" value={form.origin.airport} onChange={e => setNested('origin.airport', e.target.value)} placeholder="Indira Gandhi International" />
                </div>
                <div className="form-group">
                  <label className="form-label">Terminal</label>
                  <input className="form-control" value={form.origin.terminal} onChange={e => setNested('origin.terminal', e.target.value)} placeholder="T2" />
                </div>
              </div>

              <div className="form-section-title">Destination</div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">IATA Code *</label>
                  <input className="form-control" value={form.destination.code} onChange={e => setNested('destination.code', e.target.value.toUpperCase())} placeholder="BOM" maxLength={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-control" value={form.destination.city} onChange={e => setNested('destination.city', e.target.value)} placeholder="Mumbai" />
                </div>
                <div className="form-group">
                  <label className="form-label">Airport Name</label>
                  <input className="form-control" value={form.destination.airport} onChange={e => setNested('destination.airport', e.target.value)} placeholder="Chhatrapati Shivaji Maharaj" />
                </div>
                <div className="form-group">
                  <label className="form-label">Terminal</label>
                  <input className="form-control" value={form.destination.terminal} onChange={e => setNested('destination.terminal', e.target.value)} placeholder="T1" />
                </div>
              </div>

              <div className="form-section-title">Schedule</div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Departure *</label>
                  <input className="form-control" type="datetime-local" value={form.departureTime} onChange={e => setNested('departureTime', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Arrival *</label>
                  <input className="form-control" type="datetime-local" value={form.arrivalTime} onChange={e => setNested('arrivalTime', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input className="form-control" type="number" value={form.duration} onChange={e => setNested('duration', Number(e.target.value))} placeholder="120" />
                </div>
                <div className="form-group">
                  <label className="form-label">Stops</label>
                  <select className="form-control" value={form.stops} onChange={e => setNested('stops', Number(e.target.value))}>
                    <option value={0}>Non-stop</option>
                    <option value={1}>1 Stop</option>
                    <option value={2}>2 Stops</option>
                  </select>
                </div>
              </div>

              <div className="form-section-title">Pricing (₹)</div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Economy Base Fare</label>
                  <input className="form-control" type="number" value={form.price.economy.base} onChange={e => setNested('price.economy.base', Number(e.target.value))} placeholder="2999" />
                </div>
                <div className="form-group">
                  <label className="form-label">Economy Taxes</label>
                  <input className="form-control" type="number" value={form.price.economy.taxes} onChange={e => setNested('price.economy.taxes', Number(e.target.value))} placeholder="600" />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Base Fare</label>
                  <input className="form-control" type="number" value={form.price.business.base} onChange={e => setNested('price.business.base', Number(e.target.value))} placeholder="8999" />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Taxes</label>
                  <input className="form-control" type="number" value={form.price.business.taxes} onChange={e => setNested('price.business.taxes', Number(e.target.value))} placeholder="1200" />
                </div>
              </div>

              <div className="form-grid-2" style={{ marginTop: 14 }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e => setNested('status', e.target.value)}>
                    {['Scheduled','On Time','Delayed','Boarding','Departed','Arrived','Cancelled'].map(s =>
                      <option key={s} value={s}>{s}</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : <><FaSave style={{ marginRight: 6 }} />Save Flight</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delId && (
        <div className="admin-modal-overlay" onClick={() => setDelId(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title" style={{ color: '#ef4444' }}>🗑 Delete Flight?</div>
              <button className="modal-close" onClick={() => setDelId(null)}><FaTimes /></button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: '#6b7280' }}>This will permanently delete the flight and cannot be undone.</p>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setDelId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(delId)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
