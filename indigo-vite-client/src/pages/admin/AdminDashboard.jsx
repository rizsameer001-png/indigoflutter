import React, { useEffect, useState } from 'react';
import { FaPlane, FaTicketAlt, FaUsers, FaRupeeSign, FaTags, FaChartLine } from 'react-icons/fa';
import { adminGetStats } from '../../services/api';
import { format } from 'date-fns';
import './AdminDashboard.css';

const StatCard = ({ icon, label, value, color, trend }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '18' }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {trend && <div className="stat-trend">{trend}</div>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetStats()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div className="spinner"></div>
      <p style={{ marginTop: 12, color: '#6b7280' }}>Loading dashboard...</p>
    </div>
  );

  const stats = data?.stats || {};
  const bookingsByStatus = data?.bookingsByStatus || [];
  const revenueByDay = data?.revenueByDay || [];
  const recentBookings = data?.recentBookings || [];
  const topRoutes = data?.topRoutes || [];

  const maxRevenue = Math.max(...revenueByDay.map(d => d.revenue), 1);

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Dashboard</div>
          <div className="admin-page-sub">Welcome back! Here's what's happening today.</div>
        </div>
        <div className="dashboard-date">
          {format(new Date(), 'EEEE, dd MMM yyyy')}
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard icon={<FaRupeeSign />} label="Total Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} color="#0052a5" trend="All time" />
        <StatCard icon={<FaTicketAlt />} label="Total Bookings" value={(stats.totalBookings || 0).toLocaleString()} color="#22c55e" />
        <StatCard icon={<FaUsers />}     label="Registered Users" value={(stats.totalUsers || 0).toLocaleString()} color="#8b5cf6" />
        <StatCard icon={<FaPlane />}     label="Active Flights"   value={(stats.totalFlights || 0).toLocaleString()} color="#f59e0b" />
      </div>

      {/* Row 2 */}
      <div className="dash-row-2">
        {/* Revenue chart */}
        <div className="admin-card dash-chart-card">
          <div className="admin-card-header">
            <div className="admin-card-title"><FaChartLine style={{ marginRight: 8, color: '#0052a5' }} />Revenue — Last 7 Days</div>
          </div>
          <div className="rev-chart">
            {revenueByDay.length === 0 ? (
              <div className="admin-empty"><div className="admin-empty-icon">📊</div><p>No revenue data yet</p></div>
            ) : (
              <div className="bar-chart">
                {revenueByDay.map((d, i) => (
                  <div key={i} className="bar-col">
                    <div className="bar-label-top">₹{(d.revenue / 1000).toFixed(1)}k</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}></div>
                    </div>
                    <div className="bar-label-bot">{d._id?.slice(5)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking status */}
        <div className="admin-card dash-status-card">
          <div className="admin-card-header">
            <div className="admin-card-title">Bookings by Status</div>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {bookingsByStatus.map(s => {
              const total = bookingsByStatus.reduce((a, b) => a + b.count, 0);
              const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
              const colors = { Confirmed: '#22c55e', Pending: '#f59e0b', Cancelled: '#ef4444', Completed: '#0052a5' };
              const c = colors[s._id] || '#9ca3af';
              return (
                <div key={s._id} className="status-row">
                  <div className="status-row-label">
                    <span className="status-dot" style={{ background: c }}></span>
                    <span>{s._id}</span>
                  </div>
                  <div className="status-bar-track">
                    <div className="status-bar-fill" style={{ width: `${pct}%`, background: c }}></div>
                  </div>
                  <div className="status-count">{s.count} <span>({pct}%)</span></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="dash-row-3">
        {/* Recent bookings */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">Recent Bookings</div>
            <a href="/admin/bookings" className="btn btn-secondary btn-sm">View All</a>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>PNR</th><th>Route</th><th>Passengers</th><th>Amount</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No bookings yet</td></tr>
                ) : recentBookings.map(b => (
                  <tr key={b._id}>
                    <td><code style={{ fontWeight: 700, color: '#0052a5', fontSize: 13 }}>{b.pnr}</code></td>
                    <td style={{ fontSize: 12 }}>
                      {b.trip?.outbound ? `${b.trip.outbound.origin?.code} → ${b.trip.outbound.destination?.code}` : '—'}
                    </td>
                    <td>{b.passengers?.length || 0}</td>
                    <td style={{ fontWeight: 600 }}>₹{(b.pricing?.total || 0).toLocaleString()}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td style={{ color: '#6b7280' }}>{format(new Date(b.createdAt), 'dd MMM HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top routes */}
        <div className="admin-card top-routes-card">
          <div className="admin-card-header">
            <div className="admin-card-title">Top Routes</div>
          </div>
          <div style={{ padding: '8px 0' }}>
            {topRoutes.length === 0 ? (
              <div className="admin-empty"><div className="admin-empty-icon">✈️</div><p>No data yet</p></div>
            ) : topRoutes.map((r, i) => (
              <div key={i} className="top-route-row">
                <div className="route-rank">#{i + 1}</div>
                <div className="route-info">
                  <div className="route-name">{r._id?.from} → {r._id?.to}</div>
                  <div className="route-rev">₹{r.revenue?.toLocaleString()}</div>
                </div>
                <div className="route-count">{r.count} bookings</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Confirmed: 'badge-green', Pending: 'badge-orange',
    Cancelled: 'badge-red', Completed: 'badge-blue',
    'No Show': 'badge-gray'
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}
