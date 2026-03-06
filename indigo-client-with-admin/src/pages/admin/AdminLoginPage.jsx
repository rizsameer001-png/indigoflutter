import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../../services/api';
import useAuthStore from '../../store/authStore';
import './AdminLogin.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.data.user?.role !== 'admin') {
        toast.error('Access denied. Admin accounts only.');
        setLoading(false);
        return;
      }
      setAuth(res.data.user, res.data.token);
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-logo">
            <span className="logo-plane">✈</span>
            <span className="logo-text">IndiGo</span>
          </div>
          <div className="admin-badge">ADMIN PANEL</div>
          <h1>Administrator Login</h1>
          <p>Restricted access · Authorised personnel only</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@indigo.com"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="admin-hint">
            <span>🔑</span>
            <span>Default: <code>admin@indigo.com</code> / <code>admin@123</code></span>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? (
              <span className="loading-row"><span className="spinner-sm"></span> Authenticating...</span>
            ) : (
              '🔐 Sign In as Admin'
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/">← Back to IndiGo website</a>
        </div>
      </div>
    </div>
  );
}
