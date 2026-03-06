import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaEdit, FaTrash, FaTimes, FaSave, FaUsers } from 'react-icons/fa';
import { adminGetUsers, adminUpdateUser, adminDeleteUser } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TIER_COLORS = { Blue: '#3b82f6', Silver: '#9ca3af', Gold: '#f59e0b', Platinum: '#8b5cf6' };

export default function AdminUsersPage() {
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage]       = useState(1);
  const [editing, setEditing] = useState(null);
  const [delId, setDelId]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminGetUsers({ page, limit: LIMIT, search, role: roleFilter });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminUpdateUser(editing._id, {
        role: editing.role,
        isActive: editing.isActive,
        tier: editing.tier
      });
      toast.success('User updated ✓');
      setEditing(null);
      load();
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await adminDeleteUser(delId);
      toast.success('User deleted');
      setDelId(null);
      load();
    } catch { toast.error('Delete failed'); }
  };

  const initials = (u) => `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title"><FaUsers style={{ marginRight: 8 }} />Users</div>
          <div className="admin-page-sub">{total} registered users</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-filters">
            <label className="admin-search">
              <FaSearch style={{ color: '#9ca3af' }} />
              <input
                placeholder="Search name or email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </label>
            <select
              className="admin-filter-select"
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
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
                  <th>User</th><th>Email</th><th>Phone</th><th>Tier</th>
                  <th>Points</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="9">
                    <div className="admin-empty"><div className="admin-empty-icon">👥</div><p>No users found</p></div>
                  </td></tr>
                ) : users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0052a5, #1a73e8)',
                          color: 'white', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0
                        }}>{initials(u)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{u.firstName} {u.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: '#6b7280' }}>{u.email}</td>
                    <td style={{ fontSize: 12 }}>{u.phone || '—'}</td>
                    <td>
                      <span style={{
                        background: (TIER_COLORS[u.tier] || '#9ca3af') + '20',
                        color: TIER_COLORS[u.tier] || '#6b7280',
                        padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700
                      }}>{u.tier || 'Blue'}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{(u.loyaltyPoints || 0).toLocaleString()}</td>
                    <td>
                      <span style={{
                        background: u.role === 'admin' ? '#fff3cd' : '#f3f4f6',
                        color: u.role === 'admin' ? '#856404' : '#374151',
                        padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: 0.5
                      }}>{u.role}</span>
                    </td>
                    <td>
                      <span style={{
                        background: u.isActive !== false ? '#e8f5e9' : '#ffebee',
                        color: u.isActive !== false ? '#2e7d32' : '#c62828',
                        padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600
                      }}>{u.isActive !== false ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ fontSize: 11, color: '#9ca3af' }}>
                      {u.createdAt ? format(new Date(u.createdAt), 'dd MMM yy') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon btn-edit" onClick={() => setEditing({ ...u })} title="Edit"><FaEdit /></button>
                        {u.role !== 'admin' && (
                          <button className="btn-icon btn-del" onClick={() => setDelId(u._id)} title="Delete"><FaTrash /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="admin-pagination">
          <span>Showing {Math.min((page-1)*LIMIT+1,total)}–{Math.min(page*LIMIT,total)} of {total}</span>
          <div className="pagination-btns">
            <button disabled={page===1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
            <button disabled={page*LIMIT>=total} onClick={()=>setPage(p=>p+1)}>Next →</button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="admin-modal-overlay" onClick={() => setEditing(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">✏ Edit User</div>
              <button className="modal-close" onClick={() => setEditing(null)}><FaTimes /></button>
            </div>
            <div className="admin-modal-body">
              <div className="user-edit-info">
                <div className="user-edit-avatar">{initials(editing)}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{editing.firstName} {editing.lastName}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{editing.email}</div>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 20 }}>
                <label className="form-label">Role</label>
                <select
                  className="form-control"
                  value={editing.role}
                  onChange={e => setEditing(v => ({ ...v, role: e.target.value }))}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Loyalty Tier</label>
                <select
                  className="form-control"
                  value={editing.tier || 'Blue'}
                  onChange={e => setEditing(v => ({ ...v, tier: e.target.value }))}
                >
                  {['Blue', 'Silver', 'Gold', 'Platinum'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Account Status</label>
                <select
                  className="form-control"
                  value={editing.isActive !== false ? 'true' : 'false'}
                  onChange={e => setEditing(v => ({ ...v, isActive: e.target.value === 'true' }))}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive (Suspended)</option>
                </select>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : <><FaSave style={{ marginRight: 6 }} />Save Changes</>}
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
              <div className="admin-modal-title" style={{ color: '#ef4444' }}>🗑 Delete User?</div>
              <button className="modal-close" onClick={() => setDelId(null)}><FaTimes /></button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: '#6b7280' }}>This will permanently delete the user account.</p>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setDelId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
