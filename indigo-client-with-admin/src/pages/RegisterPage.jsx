import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../services/api';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register(form);
      setAuth(res.data.user, res.data.token);
      toast.success('Account created! Welcome aboard! ✈️');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide card">
        <div className="card-body">
          <div className="auth-logo">✈️ IndiGo</div>
          <h2>Create Account</h2>
          <p>Join millions of happy travellers</p>
          <form onSubmit={handleSubmit}>
            <div className="auth-grid">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-control" value={form.firstName} onChange={e=>update('firstName',e.target.value)} required placeholder="First name" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className="form-control" value={form.lastName} onChange={e=>update('lastName',e.target.value)} required placeholder="Last name" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-control" value={form.email} onChange={e=>update('email',e.target.value)} required placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input type="tel" className="form-control" value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="10-digit number" />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" className="form-control" value={form.password} onChange={e=>update('password',e.target.value)} required placeholder="Min 6 characters" minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
