import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDisplayName } from '../utils/displayName';
import { isImageDataUrl } from '../utils/imageData';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  let items = [];
  if (user?.role === 'doctor') {
    items = [
      { to: '/doctor/profile', label: 'Doctor Profile' },
      { to: '/doctor/dashboard', label: 'Dashboard' },
      { to: '/appointments', label: 'Appointments' },
      { to: '/patients', label: 'Patient Record' },
      { to: '/operations', label: 'Operations' },
      { to: '/doctor/admitted-patients', label: 'Admitted Patients' },
      { to: '/medical-imaging', label: 'Medical Images' },
      { to: '/doctor/billing', label: 'Pricing & Transactions' }
    ];
  } else if (user?.role === 'admin') {
    items = [
      { to: '/medical-imaging', label: 'Medical Imaging' },
      { to: '/patients', label: 'Patient Records' },
      { to: '/appointments', label: 'Appointments' }
    ];
  } else {
    items = [
      { to: '/staff/dashboard', label: 'Dashboard' },
      { to: '/payments', label: 'Payments' },
      { to: '/medical-imaging', label: 'Medical Imaging' },
      { to: '/operations', label: 'Operations' },
      { to: '/patients/add', label: 'Add Patient' },
      { to: '/patients', label: 'Patient List' },
      { to: '/appointments', label: 'Appointments' }
    ];
  }

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
              <span>{user?.role === 'doctor' ? 'Doctor Portal' : user?.role === 'admin' ? 'Admin Portal' : 'Reception Portal'}</span>
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
            {user?.role === 'doctor' ? (
              isImageDataUrl(user?.profilePicture) ? (
                <img className="profile-avatar profile-avatar-topbar" src={user.profilePicture} alt="Doctor profile" />
              ) : (
                <div className="profile-avatar profile-avatar-topbar profile-avatar-fallback">
                  {user?.name?.slice(0, 2)?.toUpperCase() || 'DR'}
                </div>
              )
            ) : user?.role === 'admin' ? (
              <div className="profile-avatar profile-avatar-topbar profile-avatar-fallback">
                {user?.name?.slice(0, 2)?.toUpperCase() || 'AD'}
              </div>
            ) : null}
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
