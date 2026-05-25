import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import StaffHeader from '../../components/StaffHeader';

export default function IPDPage({ compact = false } = {}) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');

  useEffect(() => {
    api.admittedPatients().then((d) => setItems(Array.isArray(d) ? d : [])).catch(() => setItems([]));
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((p) => {
        const text = [p?.name, p?.phone, p?.assignedDoctor?.name, p?._id].join(' ').toLowerCase();
        return text.includes(search.toLowerCase()) && (tab === 'All' || (tab === 'Admitted' && p?.status === 'Admitted') || (tab === 'Discharged' && p?.status === 'Discharged'));
      }),
    [items, search, tab]
  );

  const stats = [
    ['Admitted', items.filter((p) => p?.status === 'Admitted').length],
    ['Today', items.filter((p) => new Date(p?.createdAt).toDateString() === new Date().toDateString()).length],
    ['Pending DC', items.filter((p) => p?.status !== 'Discharged').length],
    ['Beds %', `${Math.min(99, items.length * 3)}%`]
  ];

  return (
    <div className="p-6 space-y-5">
      {compact ? <StaffHeader title="IPD" subtitle="In patient admissions overview" /> : null}
      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
            {['All', 'Admitted', 'Discharged'].map((x) => <button key={x} onClick={() => setTab(x)} className={`rounded-xl px-4 py-2 text-sm ${tab === x ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}>{x}</button>)}
          </div>
          <div className="flex flex-1 flex-wrap justify-end gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient" className="h-11 min-w-56 rounded-xl border border-slate-200 px-4 text-sm outline-none" />
            <button className="h-11 rounded-xl border border-slate-200 px-4 text-sm">Filters</button>
            <button onClick={() => api.admittedPatients().then((d) => setItems(Array.isArray(d) ? d : [])).catch(() => setItems([]))} className="h-11 rounded-xl border border-slate-200 px-4 text-sm">Refresh</button>
            <button className="h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white">+ Admit Patient</button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-slate-500">
                <tr>{['Serial #', 'Patient', 'Room / Bed', 'Consultant', 'Admission Date', 'Days', 'Status', 'Actions'].map((h) => <th key={h} className="h-14 px-4 text-left font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.length ? filtered.map((p, i) => (
                  <tr key={p?._id || i} className="h-16 border-b hover:bg-slate-50">
                    <td className="px-4">{i + 1}</td>
                    <td className="px-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">{(p?.name || 'P').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}</div>
                        <div><div className="font-medium text-slate-900">{p?.name}</div><div className="text-xs text-slate-500">{p?.phone || '-'}</div></div>
                      </div>
                    </td>
                    <td className="px-4 font-medium text-slate-600">{p?.roomType || 'A-102'}</td>
                    <td className="px-4 text-slate-600">{p?.assignedDoctor?.name || '-'}</td>
                    <td className="px-4 text-slate-600">{new Date(p?.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 text-slate-600">3</td>
                    <td className="px-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${p?.status === 'Discharged' ? 'bg-green-100 text-green-700' : p?.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{p?.status || 'Admitted'}</span></td>
                    <td className="px-4"><div className="flex gap-2"><button className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-semibold text-white">View</button><button className="rounded-xl bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-600">Edit</button><button className="rounded-xl bg-slate-100 px-3 py-2 text-xs">Discharge</button></div></td>
                  </tr>
                )) : <tr><td colSpan="8" className="px-4 py-16 text-center text-slate-500">No IPD admissions yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
