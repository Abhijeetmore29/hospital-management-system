import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDisplayName } from '../utils/displayName';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = user?.role === 'doctor'
    ? [
        { to: '/doctor/dashboard', label: 'Dashboard' },
        { to: '/doctor/billing', label: 'Pricing & Transactions' },
        { to: '/doctor/admitted-patients', label: 'Admitted Patients' },
        { to: '/operations', label: 'Operations' },
        { to: '/patients', label: 'Patient Records' },
        { to: '/appointments', label: 'Appointments' }
      ]
    : [
        { to: '/staff/dashboard', label: 'Dashboard' },
        { to: '/payments', label: 'Payments' },
        { to: '/operations', label: 'Operations' },
        { to: '/patients/add', label: 'Add Patient' },
        { to: '/patients', label: 'Patient List' },
        { to: '/appointments', label: 'Appointments' }
      ];

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-mark">HMS</div>
            <div>
              <strong>Hospital System</strong>
              <span>{user?.role === 'doctor' ? 'Doctor Portal' : 'Reception Portal'}</span>
            </div>
          </div>
          <nav className="nav">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <button className="secondary-button full-width" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Medical Operations</p>
            <h1>Welcome, {formatDisplayName(user)}</h1>
          </div>
          <div className="topbar-meta">
            <span className="role-pill">{user?.role}</span>
          </div>
        </header>
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
