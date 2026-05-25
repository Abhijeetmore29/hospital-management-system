const tone = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700'
};

export function AppointmentCard({ appointment, onView, onEdit, onComplete, onCancel }) {
  const status = ['pending', 'confirmed', 'completed', 'cancelled'].includes(String(appointment.status).toLowerCase()) ? String(appointment.status).toLowerCase() : 'pending';
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">{appointment.patient?.name || appointment.patientName || '-'}</div>
          <div className="text-sm text-slate-500">{appointment.patient?.phone || appointment.phone || '-'}</div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[status]}`}>{status}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
        <div>Token: #{appointment._id.slice(-6)}</div>
        <div>{new Date(appointment.appointmentDate).toLocaleDateString()}</div>
        <div>{appointment.timeSlot}</div>
        <div>{appointment.visitType || appointment.reason || 'OPD'}</div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <button onClick={() => onView(appointment)} className="rounded-full bg-slate-100 px-3 py-2">Open</button>
        <button onClick={() => onEdit(appointment)} className="rounded-full bg-blue-50 px-3 py-2 text-blue-700">Confirm</button>
        <button onClick={() => onComplete(appointment)} className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">Complete</button>
        <button onClick={() => onCancel(appointment)} className="rounded-full bg-red-50 px-3 py-2 text-red-700">Cancel</button>
      </div>
    </article>
  );
}
