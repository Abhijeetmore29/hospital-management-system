import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import StaffHeader from '../components/StaffHeader';
import { PatientFormModal } from '../components/PatientFormModal';

const empty = {
  title: '',
  firstName: '',
  lastName: '',
  phone: '',
  age: '',
  month: '',
  sex: 'Male',
  weight: '',
  locality: '',
  taluka: '',
  district: '',
  doctorId: '',
  department: '',
  purpose: '',
  referredBy: '',
  fee: '',
  payment: '',
  remark: ''
};

const Field = (props) => <input {...props} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" />;
const Label = ({ children }) => <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{children}</div>;

export default function RegistrationPage({ compact = false } = {}) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(empty);
  const [tab, setTab] = useState('Patient & Visit');
  const [q, setQ] = useState(' ');
  const [queueSearch, setQueueSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState('');
  const [open, setOpen] = useState(false);

  const loadData = () => {
    Promise.all([api.patients(), api.doctors()])
      .then(([p, d]) => {
        setPatients(Array.isArray(p) ? p : []);
        setDoctors(Array.isArray(d) ? d : []);
      })
      .catch(() => {
        setPatients([]);
        setDoctors([]);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayQueue = useMemo(
    () =>
      patients.filter((p) => {
        const name = [p?.name, p?.phone, p?.disease, p?._id].join(' ').toLowerCase();
        return name.includes(queueSearch.toLowerCase()) && (!queueFilter || p?.type === queueFilter);
      }),
    [patients, queueSearch, queueFilter]
  );

  const stats = {
    reg: patients.filter((p) => new Date(p?.createdAt).toDateString() === new Date().toDateString()).length,
    opd: patients.filter((p) => p?.type === 'OPD').length,
    ipd: patients.filter((p) => p?.type === 'IPD').length,
    pending: patients.filter((p) => p?.status === 'Pending').length
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const save = (e) => {
    e.preventDefault();
    api.createPatient({
      name: `${form.firstName} ${form.lastName}`.trim(),
      age: form.age,
      gender: form.sex,
      phone: form.phone,
      address: [form.locality, form.taluka, form.district].filter(Boolean).join(', '),
      disease: form.purpose || form.remark || 'General',
      type: 'OPD',
      assignedDoctor: form.doctorId
    })
      .then(() => {
        setForm(empty);
        return api.patients();
      })
      .then((p) => setPatients(Array.isArray(p) ? p : []))
      .catch(() => {});
  };

  return (
    <div className="p-6 space-y-6">
      {!compact ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-700">+</span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Registration</div>
              <div className="text-sm text-slate-500">Patient intake module</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-slate-200 bg-white px-3 py-2" aria-label="Notifications" />
            <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">DR</div>
              <span className="text-sm font-medium text-slate-700">Doctor</span>
            </div>
          </div>
        </div>
      ) : (
        <StaffHeader title="Registration" subtitle="Patient intake and token generation" />
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-1 items-center gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient..." className="h-11 w-full max-w-2xl rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-blue-300" />
          <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">New Patient</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><div className="text-sm text-slate-500">Today's Registrations</div><div className="mt-2 text-3xl font-bold text-slate-900">{stats.reg}</div></div>
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><div className="text-sm text-slate-500">OPD Patients</div><div className="mt-2 text-3xl font-bold text-blue-600">{stats.opd}</div></div>
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><div className="text-sm text-slate-500">IPD Patients</div><div className="mt-2 text-3xl font-bold text-emerald-600">{stats.ipd}</div></div>
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><div className="text-sm text-slate-500">Pending Approval</div><div className="mt-2 text-3xl font-bold text-amber-600">{stats.pending}</div></div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-200">
        {['Patient & Visit', 'Additional Details'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px rounded-t-2xl px-4 py-3 text-sm font-semibold ${tab === t ? 'bg-white text-blue-600 ring-1 ring-slate-200' : 'text-slate-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <form onSubmit={save} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-6">
            {['title', 'firstName', 'lastName', 'phone', 'age', 'month', 'sex', 'weight', 'locality', 'taluka', 'district'].map((k) => (
              <div key={k}>
                <Label>{k}</Label>
                <Field name={k} value={form[k]} onChange={onChange} placeholder={k} />
              </div>
            ))}
            <div className="md:col-span-2">
              <Label>Doctor</Label>
              <select name="doctorId" value={form.doctorId} onChange={onChange} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
                <option value="">Select</option>
                {doctors.map((d) => (
                  <option key={d?._id} value={d?._id}>
                    {d?.name}
                  </option>
                ))}
              </select>
            </div>
            {['department', 'purpose', 'referredBy', 'fee', 'payment', 'remark'].map((k) => (
              <div key={k}>
                <Label>{k}</Label>
                <Field name={k} value={form[k]} onChange={onChange} placeholder={k} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <button className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">Save & Token</button>
            <button type="button" onClick={() => setForm(empty)} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600">Reset</button>
          </div>
        </form>

        <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">Today's OPD Queue</h3>
            <div className="flex gap-2">
              <input value={queueSearch} onChange={(e) => setQueueSearch(e.target.value)} placeholder="Search" className="h-10 rounded-full border border-slate-200 px-3 text-sm" />
              <select value={queueFilter} onChange={(e) => setQueueFilter(e.target.value)} className="h-10 rounded-full border border-slate-200 px-3 text-sm">
                <option value="">Filter</option>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
              </select>
              <button onClick={() => { setQueueSearch(''); setQueueFilter(''); }} className="h-10 rounded-full border border-slate-200 px-3 text-sm">Refresh</button>
            </div>
          </div>
          <div className="grid min-h-[420px] place-items-center rounded-2xl bg-slate-50 text-center text-slate-500">
            {todayQueue.length ? (
              <div className="w-full space-y-2 p-2">
                {todayQueue.slice(0, 6).map((p) => (
                  <div key={p?._id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{p?.name}</div>
                      <div className="text-xs text-slate-500">{p?.phone}</div>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{p?.status || 'Pending'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="mt-2 text-sm">No patients checked in yet today</div>
              </div>
            )}
          </div>
        </section>
      </div>

      <PatientFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => {
          setOpen(false);
          loadData();
        }}
      />
    </div>
  );
}
