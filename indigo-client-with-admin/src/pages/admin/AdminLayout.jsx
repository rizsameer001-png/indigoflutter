import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  FaChartBar, FaPlane, FaTicketAlt, FaUsers,
  FaTags, FaBars, FaTimes, FaSignOutAlt, FaHome
} from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import './AdminLayout.css';

const NAV = [
  { to: '/admin/dashboard', icon: <FaChartBar />, label: 'Dashboard' },
  { to: '/admin/flights',   icon: <FaPlane />,    label: 'Flights'   },
  { to: '/admin/bookings',  icon: <FaTicketAlt />, label: 'Bookings'  },
  { to: '/admin/users',     icon: <FaUsers />,     label: 'Users'     },
  { to: '/admin/offers',    icon: <FaTags />,      label: 'Offers'    },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FaPlane className="sidebar-plane" />
            {!collapsed && <span>IndiGo Admin</span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? n.label : undefined}
            >
              <span className="nav-icon">{n.icon}</span>
              {!collapsed && <span className="nav-label">{n.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="/" className="sidebar-link" target="_blank" rel="noreferrer" title="View Site">
            <span className="nav-icon"><FaHome /></span>
            {!collapsed && <span className="nav-label">View Site</span>}
          </a>
          <button className="sidebar-link logout-btn" onClick={handleLogout} title="Logout">
            <span className="nav-icon"><FaSignOutAlt /></span>
            {!collapsed && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="topbar-toggle" onClick={() => setCollapsed(c => !c)}>
              <FaBars />
            </button>
          </div>
          <div className="topbar-right">
            <div className="admin-user-chip">
              <div className="admin-avatar">{user?.firstName?.[0]?.toUpperCase()}</div>
              <div className="admin-user-info">
                <span className="admin-name">{user?.firstName} {user?.lastName}</span>
                <span className="admin-role-tag">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
