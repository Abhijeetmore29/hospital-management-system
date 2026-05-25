import { useState } from 'react';
import { Link } from 'react-router-dom';

const links = ['Home', 'Specialities', 'Doctors', 'Services', 'Contact'];

export function Navbar({ onBookAppointment }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3 font-semibold text-slate-900">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white shadow-sm">H</span>
          <span>HospitalCare</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-slate-600 hover:text-blue-600">
              {l}
            </a>
          ))}
          <button onClick={onBookAppointment} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm">
            Book Appointment
          </button>
          <Link to="/login" className="rounded-full border border-blue-200 px-5 py-2.5 text-sm font-semibold text-blue-700">
            Staff Login
          </Link>
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
      </div>
      {open && (
        <nav className="border-t border-blue-100 px-4 py-4 md:hidden">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="block py-2 text-sm text-slate-600">
              {l}
            </a>
          ))}
          <div className="mt-3 flex gap-3">
            <button onClick={onBookAppointment} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              Book Appointment
            </button>
            <Link to="/login" className="rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700">
              Staff Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
