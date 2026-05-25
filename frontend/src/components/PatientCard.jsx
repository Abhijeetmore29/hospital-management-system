export function PatientCard({ patient, onView, onEdit, onAdmit, onDelete }) {
  const id = String(patient?._id || '');
  const date = new Date(patient?.createdAt);
  const tone = patient.status === 'Admitted' ? 'bg-blue-50 text-blue-700' : patient.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : patient.status === 'Registered' ? 'bg-cyan-50 text-cyan-700' : 'bg-amber-50 text-amber-700';
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">{patient.name}</div>
          <div className="text-sm text-slate-500">{patient.assignedDoctor?.name || '-'}</div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{patient.status}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
        <div>ID: {id.slice(-6)}</div><div>{patient.type}</div><div>{patient.gender}</div><div>{Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString()}</div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <button onClick={() => onView(patient)} className="rounded-full bg-slate-100 px-3 py-2">View</button>
        <button onClick={() => onEdit(patient)} className="rounded-full bg-blue-50 px-3 py-2 text-blue-700">Edit</button>
        <button onClick={() => onAdmit(patient)} className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">Admit</button>
        <button onClick={() => onDelete(patient)} className="rounded-full bg-red-50 px-3 py-2 text-red-700">Delete</button>
      </div>
    </article>
  );
}
