import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { updateProfile } from '../services/api';
import useAuthStore from '../store/authStore';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    gender: user?.gender || 'Male',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: 700 }}>
      <h1 style={{ fontFamily: 'Poppins', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>My Profile</h1>

      {/* Loyalty */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0052a5, #1a73e8)', color: 'white', marginBottom: 24 }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>IndiGo Blue Member</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{user?.tier} Tier</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Loyalty Points</div>
            <div style={{ fontSize: 36, fontWeight: 900 }}>{user?.loyaltyPoints || 0}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Personal Information</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-control" value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-control" value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email (read-only)</label>
                <input className="form-control" value={user?.email || ''} readOnly style={{ background: '#f9fafb' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-control" value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
