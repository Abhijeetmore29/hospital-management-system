import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { AppointmentTable } from '../components/AppointmentTable';
import { useAuth } from '../context/AuthContext';

const empty = { patientId: '', doctorId: '', appointmentDate: '', timeSlot: '', reason: '', patientName: '', age: '', gender: '', phone: '', department: '', type: '', notes: '' };

export function DoctorAppointments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => {
    const query = [date ? `date=${encodeURIComponent(date)}` : '', status ? `status=${encodeURIComponent(status)}` : ''].filter(Boolean).join('&');
    Promise.all([api.appointments(query ? `?${query}` : ''), api.patients(), api.doctors()])
      .then(([a, p, d]) => { setAppointments(a); setPatients(p); setDoctors(d); })
      .catch(() => { setAppointments([]); setPatients([]); setDoctors([]); });
  };

  useEffect(load, [status, date]);
  useEffect(() => {
    const refresh = () => load();
    window.addEventListener('appointment:changed', refresh);
    return () => window.removeEventListener('appointment:changed', refresh);
  }, [status, date]);

  useEffect(() => {
    if (user?._id && user?.role === 'doctor') {
      setForm((current) => (current.doctorId ? current : { ...current, doctorId: user._id }));
    }
  }, [user]);

  const filtered = useMemo(() => appointments.filter((a) => [a.patient?.name, a.patient?.phone, a.visitType, a._id].join(' ').toLowerCase().includes(search.toLowerCase())), [appointments, search]);
  const norm = (s) => (s ? String(s).toLowerCase() : 'pending');
  const stat = {
    total: appointments.length,
    pending: appointments.filter((a) => norm(a.status) === 'pending').length,
    confirmed: appointments.filter((a) => norm(a.status) === 'confirmed').length,
    completed: appointments.filter((a) => norm(a.status) === 'completed').length,
    cancelled: appointments.filter((a) => norm(a.status) === 'cancelled').length
  };

  async function submit(e) {
    e.preventDefault();
    const doctorId = form.doctorId || (user?.role === 'doctor' ? user._id : '');
    if (!doctorId || !form.patientName || !form.phone || !form.appointmentDate) {
      setMessage('Fill all required fields');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const doctor = doctors.find((d) => d._id === doctorId) || { _id: doctorId };
      let patient = patients.find((p) => p._id === form.patientId);
      if (!patient && form.patientName && form.phone) {
        patient = patients.find((p) => String(p?.name || '').toLowerCase() === form.patientName.toLowerCase() && String(p?.phone || '') === String(form.phone));
      }
      if (!patient) {
        patient = await api.createPatient({
          name: form.patientName,
          age: Number(form.age) || 0,
          gender: form.gender || 'Other',
          phone: form.phone,
          address: form.department || 'Appointment Booking',
          disease: form.reason || form.notes || 'Appointment',
          type: 'OPD',
          assignedDoctor: doctor._id
        });
      }

      if (editingId) {
        await api.updateAppointment(editingId, {
          appointmentDate: form.appointmentDate,
          timeSlot: form.timeSlot,
          reason: [form.type, form.notes].filter(Boolean).join(' - ') || form.reason || 'Appointment',
          visitType: form.type || 'OPD',
          doctor: doctor._id,
          patient: patient._id,
          status: 'pending'
        });
      } else {
        const created = await api.createAppointment({
          patientId: patient._id,
          doctorId: doctor._id,
          appointmentDate: form.appointmentDate,
          timeSlot: form.timeSlot,
          visitType: form.type || 'OPD',
          reason: [form.type, form.notes].filter(Boolean).join(' - ') || form.reason || 'Appointment',
          status: 'pending'
        });
        setAppointments((current) => [created, ...current]);
      }
      await load();
      window.dispatchEvent(new Event('appointment:changed'));
      setMessage('Appointment saved successfully');
      setOpen(false);
      setEditingId('');
      setForm({ ...empty, doctorId: user?.role === 'doctor' ? user._id : '' });
    } catch (error) {
      setMessage(error?.message || 'Failed to save appointment');
    } finally {
      setSaving(false);
    }
  }

  function setEdit(a) {
    setForm({
      ...empty,
      patientName: a.patient?.name || '',
      doctorName: a.doctor?.name || '',
      appointmentDate: a.appointmentDate?.slice?.(0, 10) || '',
      timeSlot: a.timeSlot || '',
      reason: a.reason || '',
      type: a.visitType || '',
      patientId: a.patient?._id || '',
      doctorId: a.doctor?._id || ''
    });
    setEditingId(a._id);
    setOpen(true);
  }

  function patch(id, patch) { api.updateAppointment(id, patch).then(() => { load(); window.dispatchEvent(new Event('appointment:changed')); }); }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Appointments</h2>
          <p className="text-sm text-slate-500">Doctor appointment scheduling and patient visits</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient" className="rounded-full border border-slate-200 bg-white px-4 py-2 outline-none" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2 outline-none" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2 outline-none">
            <option value="">All Status</option>
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
          <button onClick={load} className="rounded-full border border-slate-200 bg-white px-4 py-2">Refresh</button>
          <button onClick={() => navigate('/doctor/appointments/create')} className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-white">Add Appointment</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Appointments" value={stat.total} />
        <StatCard label="Pending" value={stat.pending} tone="amber" />
        <StatCard label="Confirmed" value={stat.confirmed} tone="cyan" />
        <StatCard label="Completed" value={stat.completed} tone="green" />
        <StatCard label="Cancelled" value={stat.cancelled} tone="red" />
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {message ? <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div> : null}
        <AppointmentTable
          appointments={filtered}
          onView={setEdit}
          onEdit={(a) => patch(a._id, { status: 'confirmed' })}
          onComplete={(a) => patch(a._id, { status: 'completed' })}
          onCancel={(a) => patch(a._id, { status: 'cancelled' })}
        />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <form onSubmit={submit} className="w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Add Appointment</h3>
              <button type="button" onClick={() => setOpen(false)}>X</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} placeholder="Patient Name" className="rounded-2xl border px-4 py-3" />
              <input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Age" className="rounded-2xl border px-4 py-3" />
              <input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} placeholder="Gender" className="rounded-2xl border px-4 py-3" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="rounded-2xl border px-4 py-3" />
              <select value={form.doctorId || ''} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="rounded-2xl border px-4 py-3"><option value="">Select Doctor</option>{doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}</select>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Department" className="rounded-2xl border px-4 py-3" />
              <input type="date" value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} className="rounded-2xl border px-4 py-3" />
              <input value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })} placeholder="Time" className="rounded-2xl border px-4 py-3" />
              <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Appointment Type" className="rounded-2xl border px-4 py-3 md:col-span-2" />
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="rounded-2xl border px-4 py-3 md:col-span-2" />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => { setOpen(false); setEditingId(''); setMessage(''); }} className="rounded-full border px-4 py-2">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : editingId ? 'Update Appointment' : 'Save Appointment'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
