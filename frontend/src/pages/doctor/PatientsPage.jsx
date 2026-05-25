import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import StaffHeader from '../../components/StaffHeader';

const PatientsPage = ({ compact = false } = {}) => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [doctor, setDoctor] = useState('');
  const [status, setStatus] = useState('');

  const load = () => {
    api.patients().then((data) => setPatients(Array.isArray(data) ? data : [])).catch(() => setPatients([]));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const refresh = () => load();
    window.addEventListener('appointment:changed', refresh);
    return () => window.removeEventListener('appointment:changed', refresh);
  }, []);

  const filtered = useMemo(() => patients.filter((p) => {
    const text = [p?.name, p?.phone, p?.assignedDoctor?.name, p?._id].join(' ').toLowerCase();
    return text.includes(search.toLowerCase())
      && (!doctor || p?.assignedDoctor?._id === doctor || p?.assignedDoctor?.name === doctor)
      && (!status || String(p?.status || '').toLowerCase() === status.toLowerCase());
  }), [patients, search, doctor, status]);

  const counts = {
    total: patients.length,
    opd: patients.filter((p) => p?.type === 'OPD').length,
    ipd: patients.filter((p) => p?.type === 'IPD').length,
    follow: patients.filter((p) => String(p?.visitType || p?.status || '').toLowerCase().includes('pending')).length
  };

  return (
    <div className="p-5 space-y-5">
      {compact ? <StaffHeader title="Patients" subtitle="Manage patient records and follow ups" /> : <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Hospital Module</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-800">Patients</h1>
          <p className="mt-1 text-slate-500">Manage patient records and follow ups</p>
        </div>
        <button className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white">+ Add Patient</button>
      </div>}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        {[
          ['Total Patients', String(counts.total)],
          ['OPD Patients', String(counts.opd)],
          ['IPD Patients', String(counts.ipd)],
          ['Follow Ups', String(counts.follow)]
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-slate-500">{label}</p>
            <h2 className="mt-3 text-4xl font-bold text-slate-800">{value}</h2>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div className="flex flex-wrap gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient..." className="rounded-2xl border px-4 py-2 outline-none" />
            <select value={doctor} onChange={(e) => setDoctor(e.target.value)} className="rounded-2xl border px-4 py-2 outline-none">
              <option value="">Doctor</option>
              {[...new Map(patients.map((p) => [p?.assignedDoctor?._id || p?.assignedDoctor?.name, p?.assignedDoctor?.name])).entries()].map(([value, label]) => value ? <option key={value} value={value}>{label}</option> : null)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-2xl border px-4 py-2 outline-none">
              <option value="">Status</option>
              <option value="Pending">Pending</option>
              <option value="Admitted">Admitted</option>
              <option value="Completed">Completed</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>
          <button onClick={load} className="rounded-2xl border px-4 py-2">Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Patient ID', 'Patient', 'Doctor', 'Department', 'Last Visit', 'Status', 'Billing', 'Actions'].map((h) => <th key={h} className="p-4 text-left">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((row) => {
                const date = new Date(row?.updatedAt || row?.createdAt);
                const statusTone = row.status === 'Admitted' ? 'bg-green-100 text-green-700' : row.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : row.status === 'Discharged' ? 'bg-slate-100 text-slate-700' : 'bg-yellow-100 text-yellow-700';
                return (
                  <tr key={row._id} className="border-t">
                    <td className="p-4">{String(row._id).slice(-6)}</td>
                    <td className="p-4">{row.name}</td>
                    <td className="p-4">{row.assignedDoctor?.name || '-'}</td>
                    <td className="p-4">{row.department || row.type || '-'}</td>
                    <td className="p-4">{Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString()}</td>
                    <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}>{row.status || 'Pending'}</span></td>
                    <td className="p-4"><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">{row.paymentStatus || 'Pending'}</span></td>
                    <td className="p-4"><button type="button" onClick={() => navigate(`/doctor/patients/${row._id}/details`)} className="rounded-xl bg-cyan-500 px-4 py-2 text-white">View</button></td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="8" className="p-8 text-center text-slate-500">No patients found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;
