import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import StaffHeader from '../components/StaffHeader';

const statusLabel = (value) => {
  const v = String(value || 'pending').toLowerCase();
  if (v === 'confirmed') return 'Confirmed';
  if (v === 'completed') return 'Completed';
  if (v === 'in progress') return 'In Progress';
  return 'Pending';
};

const statusClass = (value) => {
  const v = String(value || 'pending').toLowerCase();
  if (v === 'confirmed') return 'bg-blue-100 text-blue-700';
  if (v === 'completed') return 'bg-green-100 text-green-700';
  if (v === 'in progress') return 'bg-cyan-100 text-cyan-700';
  return 'bg-yellow-100 text-yellow-700';
};

export default function OPDQueuePage({ compact = false } = {}) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [items, setItems] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [doctor, setDoctor] = useState('');
  const [status, setStatus] = useState('');
  const [rows, setRows] = useState(10);
  const [selected, setSelected] = useState(null);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignDoctor, setReassignDoctor] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [menuId, setMenuId] = useState('');

  const load = () => {
    Promise.all([api.opdQueue(), api.doctors()])
      .then(([queue, doctorData]) => {
        setItems(Array.isArray(queue) ? queue : []);
        setDoctors(Array.isArray(doctorData) ? doctorData : []);
      })
      .catch(() => {
        setItems([]);
        setDoctors([]);
      });
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const refresh = () => load();
    window.addEventListener('appointment:changed', refresh);
    return () => window.removeEventListener('appointment:changed', refresh);
  }, []);

  useEffect(() => {
    const close = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuId('');
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const filtered = useMemo(() => items.filter((p) => {
    const text = [p?.patient?.name || p?.patientName, p?.patient?.phone || p?.phone, p?.doctor?.name, p?._id].join(' ').toLowerCase();
    const day = p?.appointmentDate ? new Date(p.appointmentDate).toISOString().slice(0, 10) : '';
    return text.includes(search.toLowerCase()) && (!date || day === date) && (!doctor || p?.doctor?.name === doctor) && (!status || String(p?.status || '').toLowerCase() === status.toLowerCase());
  }).slice(0, rows), [items, search, date, doctor, status, rows]);

  const consult = (row) => navigate(`/doctor/consult/${row?._id}`);
  const openProfile = (row) => navigate(`/patients/${row?.patient?._id}/profile`);
  const markCompleted = (row) => api.updateAppointment(row._id, { status: 'completed' }).then(() => { load(); window.dispatchEvent(new Event('appointment:changed')); });
  const cancelQueue = (row) => api.updateAppointment(row._id, { status: 'cancelled' }).then(() => { load(); window.dispatchEvent(new Event('appointment:changed')); });
  const printPrescription = (row) => navigate(`/prescriptions/${row?._id}/print`);
  const doReassign = async (e) => {
    e.preventDefault();
    if (!selected) return;
    await api.reassignAppointment(selected._id, { doctorId: reassignDoctor, reason: reassignReason, status: 'confirmed' });
    setReassignOpen(false);
    setSelected(null);
    setReassignDoctor('');
    setReassignReason('');
    load();
    window.dispatchEvent(new Event('appointment:changed'));
  };

  return (
    <div className="p-6 space-y-5">
      {compact ? <StaffHeader title="OPD Queue" subtitle="Manage waiting patients" /> : null}
      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient" className="h-11 min-w-56 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl border border-slate-200 px-4 text-sm" />
          <input value={doctor} onChange={(e) => setDoctor(e.target.value)} placeholder="Doctor" className="h-11 rounded-xl border border-slate-200 px-4 text-sm" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-xl border border-slate-200 px-4 text-sm">
            <option value="">Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="in progress">In Progress</option>
          </select>
          <button onClick={() => { setSearch(''); setDate(''); setDoctor(''); setStatus(''); }} className="h-11 rounded-xl border border-slate-200 px-4 text-sm">Clear</button>
          <button onClick={load} className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white">Refresh</button>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>
                {['#', 'Patient', 'Doctor', 'Wait Time', 'Screened', 'Status', 'Fee', 'Actions'].map((h) => <th key={h} className="h-14 px-4 text-left font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((p, i) => (
                <tr key={p?._id || i} className="h-16 border-b odd:bg-slate-50/50 hover:bg-slate-50">
                  <td className="px-4 text-slate-500">{i + 1}</td>
                  <td className="px-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        {(p?.patient?.name || p?.patientName || 'P').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{p?.patient?.name || p?.patientName || '-'}</div>
                        <div className="text-xs text-slate-500">{p?.patient?.phone || p?.phone || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 text-slate-600">{p?.doctor?.name || '-'}</td>
                  <td className="px-4"><span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">12m</span></td>
                  <td className="px-4"><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">Pending</span></td>
                  <td className="px-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(p?.status)}`}>{statusLabel(p?.status)}</span></td>
                  <td className="px-4"><span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">Rs. 0</span></td>
                  <td className="px-4">
                    <div className="relative flex items-center gap-2" ref={menuId === p?._id ? menuRef : null}>
                      <button type="button" onClick={() => consult(p)} className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-semibold text-white">Consult</button>
                      <button type="button" onClick={() => { setSelected(p); setReassignDoctor(p?.doctor?._id || ''); setReassignReason(''); setReassignOpen(true); }} className="rounded-xl bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-600">Reassign</button>
                      <button type="button" onClick={() => openProfile(p)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs">Open</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setMenuId(menuId === p?._id ? '' : p?._id); }} className="rounded-xl bg-slate-100 px-3 py-2 text-xs">More</button>
                      {menuId === p?._id ? (
                        <div className="absolute right-0 top-12 z-20 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl" onClick={(e) => e.stopPropagation()}>
                          <button type="button" onClick={() => { openProfile(p); setMenuId(''); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50">View Details</button>
                          <button type="button" onClick={() => { markCompleted(p); setMenuId(''); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50">Mark Completed</button>
                          <button type="button" onClick={() => { cancelQueue(p); setMenuId(''); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50">Cancel Queue</button>
                          <button type="button" onClick={() => { printPrescription(p); setMenuId(''); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50">Print Prescription</button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="px-4 py-16 text-center text-slate-500">No patients in queue</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="flex items-center justify-between rounded-3xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
        <div className="text-sm text-slate-600">Rows: {filtered.length}</div>
        <div className="text-sm text-slate-600">Page 1</div>
        <select value={rows} onChange={(e) => setRows(Number(e.target.value))} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </footer>

      {reassignOpen && selected ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onClick={() => setReassignOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={doReassign} className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold">Reassign Doctor</h3>
            <div className="mt-4 grid gap-3">
              <select value={reassignDoctor} onChange={(e) => setReassignDoctor(e.target.value)} className="rounded-2xl border px-4 py-3">
                <option value="">Select Doctor</option>
                {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              <input value={reassignReason} onChange={(e) => setReassignReason(e.target.value)} placeholder="Reason" className="rounded-2xl border px-4 py-3" />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setReassignOpen(false)} className="rounded-full border px-4 py-2">Cancel</button>
              <button type="submit" className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-white">Save</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
