import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { DashboardSection } from '../components/DashboardSection';
import StaffHeader from '../components/StaffHeader';

export function DoctorDashboard({ compact = false } = {}) {
  const [summary, setSummary] = useState(null);
  const [waitingPatients, setWaitingPatients] = useState([]);
  const basePath = compact ? '/staff' : '/doctor';
  const navigate = useNavigate();

  useEffect(() => {
    api.dashboardSummary().then(setSummary).catch(() => setSummary(null));
    api.opdQueue().then(setWaitingPatients).catch(() => setWaitingPatients([]));
  }, []);

  const stats = [
    ['Total Patients', summary?.totalPatients ?? 0, 'blue'],
    ["Today's Appointments", summary?.todayAppointments ?? 0, 'cyan'],
    ['Completed Records', summary?.completedRecords ?? 0, 'green'],
    ['Pending Records', summary?.pendingRecords ?? 0, 'amber'],
    ['Admitted IPD', summary?.admittedPatients ?? 0, 'blue'],
    ['Waiting OPD', summary?.waitingOpdPatients ?? 0, 'amber'],
    ['Transactions', summary?.totalTransactions ?? 0, 'cyan'],
    ['Operations', summary?.totalOperations ?? 0, 'green'],
    ['Revenue', `Rs. ${summary?.totalRevenue ?? 0}`, 'blue']
  ];
  const quickActions = [
    ['Register Patient', `${basePath}/registration`],
    ['Add Appointment', `${basePath}/appointments`],
    ['Create Lab Request', `${basePath}/laboratory`],
    ['Generate Bill', `${basePath}/billing`],
    ['Admit Patient', `${basePath}/ipd`],
    ['Schedule Operation', `${basePath}/operations`]
  ];
  const summaryCards = [
    ['OPD Patients', stats[5][1], 'amber'],
    ['IPD Admissions', stats[4][1], 'blue'],
    ['Lab Tests', stats[6][1], 'cyan'],
    ['Revenue', stats[8][1], 'green'],
    ['Emergency Cases', 4, 'red'],
    ['Discharges', 12, 'emerald']
  ];
  const patients = (waitingPatients || []).slice(0, 5);
  const timeline = [
    ['09:30 AM', 'Consultation', 'Amit Sharma', 'blue'],
    ['11:00 AM', 'Follow-up', 'Neha Verma', 'cyan'],
    ['02:00 PM', 'Surgery', 'Critical OT', 'amber']
  ];
  const beds = [['ICU Beds', 82], ['General Beds', 64], ['Emergency Beds', 91], ['Private Rooms', 76]];
  const lab = [['Pending Tests', 12, 'yellow'], ['In Progress', 6, 'blue'], ['Completed', 48, 'green'], ['Critical Reports', 2, 'red']];
  const revenue = [['Today Revenue', 'Rs. 18,400'], ['Weekly Revenue', 'Rs. 1.24L'], ['Pending Payments', 'Rs. 22,000'], ['Insurance Claims', '14']];
  const alerts = ['Emergency patient waiting', 'Lab report ready', 'Payment pending', 'Surgery scheduled'];
  const availability = [['Available', 'green'], ['In Consultation', 'amber'], ['Off Duty', 'red']];
  const system = [['Active Staff', 42], ['Active Doctors', 18], ['Available Rooms', 26], ['System Health', '99%']];

  return (
    <div className="p-6 space-y-6">
      {compact ? <StaffHeader title="Staff Dashboard" subtitle="Registration, queue, billing, and patient workflow overview." /> : null}
      {!compact ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-600">Hospital Module</div>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Doctor Dashboard</h2>
          <p className="mt-2 text-sm text-slate-500">Enterprise view for patient flow, appointments, and clinical operations.</p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.slice(0, 4).map(([label, value, tone]) => <StatCard key={label} label={label} value={value} tone={tone} />)}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.slice(4, 8).map(([label, value, tone]) => <StatCard key={label} label={label} value={value} tone={tone} />)}
      </div>
      <div className="mt-4 max-w-sm">
        <StatCard label={stats[8][0]} value={stats[8][1]} tone={stats[8][2]} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <DashboardSection title="OPD Patients Waiting" action={<button onClick={() => navigate(`${basePath}/opd-waiting`)} className="text-sm font-medium text-blue-600">View all</button>}>
          <div className="space-y-3">
            {patients.map((p) => (
              <div key={p._id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <div className="font-medium text-slate-900">{p.patient?.name}</div>
                  <div className="text-sm text-slate-500">{p.patient?.disease}</div>
                </div>
                <Link className="text-sm font-semibold text-blue-600" to={`/prescriptions/${p.patient?._id}`}>Open</Link>
              </div>
            ))}
            {!patients.length && <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">No OPD patients waiting.</div>}
          </div>
        </DashboardSection>
        <DashboardSection title="Chart / Occupancy">
          <div className="grid gap-4">
            {[
              ['General', 78],
              ['Semi Private', 62],
              ['Private', 88]
            ].map(([label, value]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-sm text-slate-600"><span>{label}</span><span>{value}%</span></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardSection title="Quick Actions">
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map(([label, to]) => <Link key={label} to={to} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white">{label}</Link>)}
          </div>
        </DashboardSection>
        <DashboardSection title="Today Summary">
          <div className="grid gap-3 sm:grid-cols-2">
            {summaryCards.map(([label, value, tone]) => <StatCard key={label} label={label} value={value} tone={tone} />)}
          </div>
        </DashboardSection>
        <DashboardSection title="Live OPD Queue">
          <div className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Active Queue</div>
          <div className="max-h-72 space-y-3 overflow-auto pr-1">
            {patients.map((p, i) => (
              <div key={p._id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium text-slate-900">{p.patient?.name}</div>
                  <span className="text-slate-500">T0{i + 1}</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-slate-500"><span>{p.patient?.disease}</span><span>{p.doctor?.name || 'Dr. ---'}</span><span>12m</span></div>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <DashboardSection title="Recent Patients">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500">{['Patient', 'Doctor', 'Department', 'Status', 'Billing'].map((h) => <th key={h} className="pb-3 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {patients.map((p) => <tr key={p._id} className="border-t hover:bg-slate-50"><td className="py-3"><div className="font-medium text-slate-900">{p.patient?.name}</div><div className="text-xs text-slate-500">{p.patient?.phone || '-'}</div></td><td className="py-3 text-slate-600">{p.doctor?.name || '-'}</td><td className="py-3 text-slate-600">{p.patient?.disease || '-'}</td><td className="py-3"><span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Active</span></td><td className="py-3"><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">Paid</span></td></tr>)}
              </tbody>
            </table>
          </div>
        </DashboardSection>
        <DashboardSection title="Appointment Timeline">
          <div className="space-y-3">
            {timeline.map(([time, title, name, tone]) => <div key={time} className="flex gap-3 rounded-2xl bg-slate-50 px-4 py-3"><div className={`mt-1 h-3 w-3 rounded-full ${tone === 'blue' ? 'bg-blue-500' : tone === 'cyan' ? 'bg-cyan-500' : 'bg-amber-500'}`} /><div><div className="text-sm font-semibold text-slate-900">{title}</div><div className="text-xs text-slate-500">{time} Â· {name}</div></div></div>)}
          </div>
        </DashboardSection>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardSection title="Bed Occupancy">
          <div className="space-y-4">{beds.map(([label, value]) => <div key={label}><div className="mb-2 flex justify-between text-sm"><span>{label}</span><span>{value}%</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${value}%` }} /></div></div>)}</div>
        </DashboardSection>
        <DashboardSection title="Laboratory Status">
          <div className="grid gap-3 sm:grid-cols-2">{lab.map(([label, value, tone]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">{label}</div><div className={`mt-2 text-2xl font-bold ${tone === 'red' ? 'text-red-600' : tone === 'green' ? 'text-green-600' : tone === 'blue' ? 'text-blue-600' : 'text-amber-600'}`}>{value}</div></div>)}</div>
        </DashboardSection>
        <DashboardSection title="Revenue Analytics">
          <div className="grid gap-3 sm:grid-cols-2">{revenue.map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-xl font-bold text-slate-900">{value}</div></div>)}</div>
          <div className="mt-4 h-28 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100" />
        </DashboardSection>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <DashboardSection title="Notifications">
          <div className="max-h-64 space-y-2 overflow-auto pr-1">{alerts.map((item) => <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{item}</div>)}</div>
        </DashboardSection>
        <DashboardSection title="Doctor Availability">
          <div className="grid gap-3 sm:grid-cols-3">{availability.map(([label, tone]) => <div key={label} className="rounded-2xl bg-slate-50 px-4 py-4"><div className={`mb-2 inline-flex h-3 w-3 rounded-full ${tone === 'green' ? 'bg-green-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`} /><div className="text-sm font-medium text-slate-900">{label}</div></div>)}</div>
        </DashboardSection>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-4">
        {system.map(([label, value]) => <StatCard key={label} label={label} value={value} />)}
      </div>
    </div>
  );
}
