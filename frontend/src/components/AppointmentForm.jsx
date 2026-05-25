import { DoctorDropdown } from './DoctorDropdown';
import { SlotSelector } from './SlotSelector';

export function AppointmentForm({ form, setForm, doctors, onSubmit, onReset, onCancel, saving }) {
  const update = (name) => (e) => setForm((current) => ({ ...current, [name]: e.target.value }));

  return (
    <form onSubmit={onSubmit} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="grid gap-4 md:grid-cols-2">
        <input value={form.patientName} onChange={update('patientName')} placeholder="Full Name" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
        <input value={form.age} onChange={update('age')} placeholder="Age" type="number" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
        <select value={form.gender} onChange={update('gender')} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none">
          <option value="">Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input value={form.phone} onChange={update('phone')} placeholder="Phone Number" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
        <select value={form.visitType} onChange={update('visitType')} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none">
          {['OPD', 'IPD', 'Follow-up', 'Emergency'].map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <DoctorDropdown doctors={doctors} value={form.doctor} onChange={update('doctor')} />
        <input type="date" value={form.date} onChange={update('date')} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
        <input value={form.reason} onChange={update('reason')} placeholder="Symptoms / Reason" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none md:col-span-2" />
      </div>

      <div className="mt-6">
        <div className="mb-3 text-sm font-semibold text-slate-700">Available Slots</div>
        <SlotSelector value={form.slot} onChange={(slot) => setForm((current) => ({ ...current, slot }))} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Appointment'}</button>
        <button type="button" onClick={onReset} className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700">Reset</button>
        <button type="button" onClick={onCancel} className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700">Cancel</button>
      </div>
    </form>
  );
}
