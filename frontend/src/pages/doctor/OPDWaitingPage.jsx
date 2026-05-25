import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';

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

export default function OPDWaitingPage() {
  const [items, setItems] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [doctor, setDoctor] = useState('');
  const [status, setStatus] = useState('');

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

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => items.filter((p) => {
    const text = [p?.patient?.name || p?.patientName, p?.patient?.phone || p?.phone, p?.doctor?.name, p?._id].join(' ').toLowerCase();
    const day = p?.appointmentDate ? new Date(p.appointmentDate).toISOString().slice(0, 10) : '';
    return text.includes(search.toLowerCase()) && (!date || day === date) && (!doctor || p?.doctor?._id === doctor) && (!status || String(p?.status || '').toLowerCase() === status.toLowerCase());
  }), [items, search, date, doctor, status]);

  return (
    <div className="p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Hospital Module</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-800">OPD Patients Waiting</h1>
          <p className="mt-1 text-slate-500">Manage waiting consultations</p>
        </div>
        <button onClick={load} className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white">Refresh</button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        {['Total Waiting', 'In Consultation', 'Completed', 'Avg Wait Time'].map((item, index) => <div key={item} className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-slate-500">{item}</div><div className="mt-3 text-4xl font-bold text-slate-800">{index === 0 ? filtered.length : 0}</div></div>)}
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient" className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none" />
          <select value={doctor} onChange={(e) => setDoctor(e.target.value)} className="h-11 rounded-xl border border-slate-200 px-4 text-sm">
            <option value="">Doctor</option>
            {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-xl border border-slate-200 px-4 text-sm">
            <option value="">Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="in progress">In Progress</option>
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl border border-slate-200 px-4 text-sm" />
          <button onClick={() => { setSearch(''); setDate(''); setDoctor(''); setStatus(''); }} className="h-11 rounded-xl border border-slate-200 px-4 text-sm">Clear</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>{['Token', 'Patient', 'Doctor', 'Department', 'Waiting Time', 'Status', 'Actions'].map((h) => <th key={h} className="h-14 px-4 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((p, i) => (
                <tr key={p?._id || i} className="h-16 border-b hover:bg-slate-50">
                  <td className="px-4">#{String(p?._id || '').slice(-6)}</td>
                  <td className="px-4">
                    <div className="font-medium text-slate-900">{p?.patient?.name || p?.patientName || '-'}</div>
                    <div className="text-xs text-slate-500">{p?.patient?.phone || p?.phone || '-'}</div>
                  </td>
                  <td className="px-4">{p?.doctor?.name || '-'}</td>
                  <td className="px-4">{p?.patient?.disease || p?.visitType || '-'}</td>
                  <td className="px-4">12m</td>
                  <td className="px-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(p?.status)}`}>{statusLabel(p?.status)}</span></td>
                  <td className="px-4"><div className="flex gap-2"><button className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-semibold text-white">View</button><button className="rounded-xl bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-600">Call</button><button className="rounded-xl bg-green-100 px-3 py-2 text-xs font-semibold text-green-700">Complete</button></div></td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="px-4 py-16 text-center text-slate-500">No patients in queue</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
