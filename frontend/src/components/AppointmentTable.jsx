import { AppointmentCard } from './AppointmentCard';

const statusTone = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700'
};

export function AppointmentTable({ appointments, onView, onEdit, onComplete, onCancel }) {
  return (
    <>
      <div className="hidden overflow-auto rounded-3xl border border-slate-200 bg-white lg:block">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-50">
            <tr className="text-left text-slate-500">
              {['Token', 'Patient Name', 'Phone', 'Visit Type', 'Date', 'Time Slot', 'Status', 'Actions'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {appointments.length ? appointments.map((a) => {
              const status = ['pending', 'confirmed', 'completed', 'cancelled'].includes(String(a.status).toLowerCase()) ? String(a.status).toLowerCase() : 'pending';
              return (
                <tr key={a._id} className="border-t hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">#{a._id.slice(-6)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{a.patient?.name || a.patientName || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{a.patient?.phone || a.phone || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{a.visitType || a.reason || 'OPD'}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(a.appointmentDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-600">{a.timeSlot}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[status]}`}>{status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => onView(a)} className="rounded-full bg-slate-100 px-3 py-2">Open</button>
                      <button onClick={() => onEdit(a)} className="rounded-full bg-blue-50 px-3 py-2 text-blue-700">Confirm</button>
                      <button onClick={() => onComplete(a)} className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">Complete</button>
                      <button onClick={() => onCancel(a)} className="rounded-full bg-red-50 px-3 py-2 text-red-700">Cancel</button>
                    </div>
                  </td>
                </tr>
              );
            }) : <tr><td colSpan="8" className="px-4 py-10 text-center text-slate-500">No appointments found.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 lg:hidden">
        {appointments.length ? appointments.map((a) => <AppointmentCard key={a._id} appointment={a} onView={onView} onEdit={onEdit} onComplete={onComplete} onCancel={onCancel} />) : <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">No appointments found.</div>}
      </div>
    </>
  );
}
