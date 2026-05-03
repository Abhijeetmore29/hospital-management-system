import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';

export function DoctorDashboard() {
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [admittedPatients, setAdmittedPatients] = useState([]);
  const [waitingPatients, setWaitingPatients] = useState([]);

  useEffect(() => {
    api.dashboardSummary().then(setSummary).catch(() => setSummary(null));
    api.todayAppointments().then(setAppointments).catch(() => setAppointments([]));
    api.admittedPatients().then(setAdmittedPatients).catch(() => setAdmittedPatients([]));
    api.waitingOpdPatients().then(setWaitingPatients).catch(() => setWaitingPatients([]));
  }, []);

  return (
    <div className="stack">
      <PageHeader
        title="Doctor Dashboard"
        subtitle="Track patient load, today's appointments, and pending records."
      />
      <div className="stats-grid">
        <StatCard label="Total Patients" value={summary?.totalPatients ?? 0} />
        <StatCard label="Today's Appointments" value={summary?.todayAppointments ?? 0} tone="teal" />
        <StatCard label="Completed Records" value={summary?.completedRecords ?? 0} tone="green" />
        <StatCard label="Pending Records" value={summary?.pendingRecords ?? 0} tone="amber" />
        <StatCard label="Admitted IPD" value={summary?.admittedPatients ?? 0} tone="green" />
        <StatCard label="Waiting OPD" value={summary?.waitingOpdPatients ?? 0} tone="amber" />
        <StatCard label="Transactions" value={summary?.totalTransactions ?? 0} />
        <StatCard label="Operations" value={summary?.totalOperations ?? 0} tone="amber" />
        <StatCard label="Revenue" value={`Rs. ${summary?.totalRevenue ?? 0}`} tone="teal" />
      </div>
      <section className="panel">
        <div className="panel-head">
          <h3>OPD Patients Waiting</h3>
          <span className="muted">Pending and in-progress OPD patients</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Disease</th>
                <th>Assigned Doctor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {waitingPatients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No OPD patients are waiting right now.
                  </td>
                </tr>
              ) : (
                waitingPatients.map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.name}</td>
                    <td>{patient.disease}</td>
                    <td>{patient.assignedDoctor?.name || '-'}</td>
                    <td>
                      <span className={`status-pill ${patient.status.toLowerCase()}`}>{patient.status}</span>
                    </td>
                    <td className="inline-actions">
                      <Link className="text-link" to={`/prescriptions/${patient._id}`}>
                        Open Record
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <div className="panel-head">
          <h3>Today's Appointments</h3>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Disease</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No appointments scheduled for today.
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{appointment.patient?.name}</td>
                    <td>{appointment.patient?.disease}</td>
                    <td>{appointment.timeSlot}</td>
                    <td>
                      <span className={`status-pill ${appointment.status.toLowerCase()}`}>{appointment.status}</span>
                    </td>
                    <td>
                      <Link className="text-link" to={`/prescriptions/${appointment.patient?._id}`}>
                        Open Record
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <div className="panel-head">
          <h3>Admitted IPD Patients</h3>
          <Link className="text-link" to="/doctor/admitted-patients">
            View all
          </Link>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Room</th>
                <th>Disease</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admittedPatients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No admitted IPD patients found.
                  </td>
                </tr>
              ) : (
                admittedPatients.map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.name}</td>
                    <td>{patient.roomType || '-'}</td>
                    <td>{patient.disease}</td>
                    <td>{patient.status}</td>
                    <td className="inline-actions">
                      <Link className="text-link" to={`/patients/${patient._id}/discharge`}>
                        Discharge
                      </Link>
                      <Link className="text-link" to={`/operations?patient=${patient._id}`}>
                        Operation
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      <div className="quick-actions">
        <Link className="primary-button" to="/patients">
          View Patients
        </Link>
        <Link className="secondary-button" to="/doctor/billing">
          Pricing & Transactions
        </Link>
        <Link className="secondary-button" to="/doctor/profile">
          Doctor Profile
        </Link>
        <Link className="secondary-button" to="/operations">
          Operations
        </Link>
        <Link className="secondary-button" to="/appointments">
          Open Appointments
        </Link>
      </div>
    </div>
  );
}
