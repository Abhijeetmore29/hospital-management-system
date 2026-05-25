const boxes = [
  ['OPD Today', 'opdPatients'],
  ['Appointments', 'todayAppointments'],
  ['IPD Admitted', 'admittedPatients'],
  ['Revenue', 'totalRevenue']
];

const mini = [
  ['Registrations', '36'],
  ['Lab Pending', '14'],
  ['Discharges Due', '9']
];

export function DashboardCards({ summary }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {boxes.map(([label, key]) => <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-bold text-slate-900">{key === 'totalRevenue' ? `Rs. ${summary?.[key] ?? 0}` : summary?.[key] ?? 0}</div></div>)}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {mini.map(([label, value]) => <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-2xl font-semibold text-blue-600">{value}</div></div>)}
      </div>
    </div>
  );
}
