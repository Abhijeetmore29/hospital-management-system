import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { PatientFormModal } from '../components/PatientFormModal';

export function StaffDashboard() {
  const [summary, setSummary] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.dashboardSummary().then(setSummary).catch(() => setSummary(null));
  }, []);

  return (
    <div className="stack">
      <PageHeader
        title="Staff Dashboard"
        subtitle="Register patients, schedule appointments, and prepare records for the doctor."
        action={
          <button className="primary-button" onClick={() => setShowModal(true)}>
            New Patient
          </button>
        }
      />
      <div className="stats-grid">
        <StatCard label="Total Patients" value={summary?.totalPatients ?? 0} />
        <StatCard label="OPD Cases" value={summary?.opdPatients ?? 0} tone="teal" />
        <StatCard label="IPD Cases" value={summary?.ipdPatients ?? 0} tone="green" />
        <StatCard label="Today's Appointments" value={summary?.todayAppointments ?? 0} tone="amber" />
      </div>
      <section className="panel">
        <div className="panel-head">
          <h3>Quick Operations</h3>
        </div>
        <div className="quick-actions">
          <Link className="primary-button" to="/patients/add">
            Register Patient
          </Link>
          <Link className="secondary-button" to="/patients">
            Search Patient List
          </Link>
          <Link className="secondary-button" to="/appointments">
            Appointment List
          </Link>
          <Link className="secondary-button" to="/payments">
            Payment Module
          </Link>
          <Link className="secondary-button" to="/operations">
            Operations
          </Link>
        </div>
      </section>
      <PatientFormModal open={showModal} onClose={() => setShowModal(false)} onSaved={() => setShowModal(false)} />
    </div>
  );
}
