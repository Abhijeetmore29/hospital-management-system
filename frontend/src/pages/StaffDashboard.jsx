import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { DashboardSection } from '../components/DashboardSection';
import StaffHeader from '../components/StaffHeader';

export function StaffDashboard() {
  const [summary, setSummary] = useState(null);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    api.dashboardSummary().then(setSummary).catch(() => setSummary(null));
    api.opdQueue().then(setQueue).catch(() => setQueue([]));
  }, []);

  return (
    <div className="space-y-6">
      <StaffHeader title="Staff Dashboard" subtitle="Registration, queue, billing, and patient workflow overview." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Patients" value={summary?.totalPatients ?? 0} />
        <StatCard label="OPD Cases" value={summary?.opdPatients ?? 0} tone="teal" />
        <StatCard label="IPD Cases" value={summary?.ipdPatients ?? 0} tone="green" />
        <StatCard label="Today's Appointments" value={summary?.todayAppointments ?? 0} tone="amber" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <DashboardSection title="Quick Operations">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link className="rounded-2xl bg-blue-600 px-4 py-3 text-center font-semibold text-white" to="/patients/add">Register Patient</Link>
            <Link className="rounded-2xl border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700" to="/patients">Patient List</Link>
            <Link className="rounded-2xl border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700" to="/appointments">Appointments</Link>
            <Link className="rounded-2xl border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700" to="/payments">Payments</Link>
          </div>
        </DashboardSection>
        <DashboardSection title="OPD Queue">
          <div className="space-y-3">
            {queue.slice(0, 5).map((p) => (
              <div key={p._id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <div className="font-medium text-slate-900">{p.patient?.name}</div>
                  <div className="text-sm text-slate-500">{p.patient?.disease}</div>
                </div>
                <Link className="text-sm font-semibold text-blue-600" to="/appointments">Open</Link>
              </div>
            ))}
            {!queue.length && <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">No OPD patients waiting.</div>}
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
