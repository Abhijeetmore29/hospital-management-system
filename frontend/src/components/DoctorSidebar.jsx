import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const doctorItems = [
  ['Dashboard', '/doctor/dashboard'],
  ['Appointments', '/doctor/appointments'],
  ['Registration', '/doctor/registration'],
  ['OPD Queue', '/doctor/opd-queue'],
  ['IPD', '/doctor/ipd'],
  ['Laboratory', '/doctor/laboratory'],
  ['Billing', '/doctor/billing'],
  ['Patients', '/doctor/patients'],
  ['Operations', '/doctor/operations'],
  ['Profile', '/doctor/profile']
];

export function DoctorSidebar({ items = doctorItems, subtitle = 'Doctor Panel' }) {
  const { user } = useAuth();
  const showAdmin = user?.role === 'doctor' && (user?.canAccessAdmin || user?.isAdmin);
  const navItems = items === doctorItems && showAdmin
    ? [...items.slice(0, 9), ['Admin Access', '/doctor/admin'], ...items.slice(9)]
    : items;

  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 p-5 text-white lg:flex">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-cyan-500 text-lg font-bold shadow-lg">M</div>
        <div>
          <div className="font-semibold">Meditrack</div>
          <div className="text-sm text-white/60">{subtitle}</div>
        </div>
      </div>
      <nav className="mt-8 grid gap-2">
        {navItems.map(([label, to]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-white/70 hover:bg-white/5'}`
            }
          >
            <span className="h-2.5 w-2.5 rounded-full bg-current opacity-70" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
