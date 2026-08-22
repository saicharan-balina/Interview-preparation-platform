import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/practice',  label: 'Practice' },
  { to: '/interview', label: 'Interview' },
  { to: '/revision',  label: 'Revision' },
  { to: '/profile',   label: 'Profile' },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">FP</div>
        <div>
          <div className="navbar-title">FacePrep</div>
          <div className="navbar-subtitle">Interview Platform</div>
        </div>
      </div>

      <div className="nav-section">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Powered by AI
        </div>
      </div>
    </nav>
  );
}
