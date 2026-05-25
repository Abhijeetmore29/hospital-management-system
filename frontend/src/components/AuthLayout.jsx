import { Link } from 'react-router-dom';
import { SidebarPreview } from './SidebarPreview';

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <SidebarPreview title={subtitle} />
      <main className="flex flex-1 flex-col justify-center p-4 lg:p-8">
        <div className="mb-4 flex justify-end gap-3 text-slate-500">
          <button className="rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">🔔</button>
          <Link to="/" className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">Back</Link>
        </div>
        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 font-bold text-white">M</div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Welcome back</p>
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              </div>
            </div>
            <Link to="/" className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600">Home</Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
