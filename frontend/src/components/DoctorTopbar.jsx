import { useNavigate } from 'react-router-dom';
import { formatDisplayName } from '../utils/displayName';
import { useAuth } from '../context/AuthContext';

export function DoctorTopbar({
  title = 'Doctor Dashboard',
  subtitle = 'Welcome,',
  logoutTo = '/doctor/login',
  extraLogoutKeys = []
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    extraLogoutKeys.forEach((key) => localStorage.removeItem(key));
    navigate(logoutTo, { replace: true });
  };

  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-600">Hospital Module</div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle} {formatDisplayName(user)}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">N</button>
        <button onClick={handleLogout} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm">Logout</button>
      </div>
    </header>
  );
}
