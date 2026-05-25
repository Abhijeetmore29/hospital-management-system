const items = ['Profile', 'Dashboard', 'Appointments', 'Registration', 'OPD Queue', 'IPD', 'Laboratory', 'Billing', 'Patients', 'Operations'];

export function SidebarPreview({ title = 'Doctor Panel' }) {
  return (
    <aside className="hidden min-h-screen w-[320px] flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 p-6 text-white lg:flex">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 font-bold">M</div>
        <div>
          <div className="font-semibold">Meditrack</div>
          <div className="text-sm text-white/60">{title}</div>
        </div>
      </div>
      <nav className="mt-10 grid gap-2">
        {items.map((item, i) => (
          <div key={item} className={`rounded-2xl px-4 py-3 text-sm ${i === 1 ? 'bg-blue-600 text-white shadow-lg' : 'text-white/70 hover:bg-white/5'}`}>
            {item}
          </div>
        ))}
      </nav>
      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold">Hospital Workflow</div>
        <div className="mt-3 grid gap-2 text-sm text-white/70">
          {['Appointments', 'OPD Queue', 'Lab Requests', 'Patient Records', 'Billing'].map((item) => <div key={item}>• {item}</div>)}
        </div>
      </div>
    </aside>
  );
}
