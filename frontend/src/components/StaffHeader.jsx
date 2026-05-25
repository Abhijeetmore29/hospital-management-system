import { useNavigate } from 'react-router-dom';

export default function StaffHeader({ title, subtitle }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.clear();
    navigate('/login');
  }

  return (
    <header className="mb-6 flex items-center justify-between rounded-3xl bg-white px-6 py-4 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-600">Hospital Module</div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600" aria-label="Notifications">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 17H9m9-2V11a6 6 0 10-12 0v4l-2 2h16l-2-2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">ST</div>
        <button onClick={logout} className="rounded-full border border-slate-200 bg-white px-5 py-2 font-semibold text-slate-700">
          Logout
        </button>
      </div>
    </header>
  );
}
