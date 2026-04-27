import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';

export function DoctorAdmittedPatients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    api.admittedPatients().then(setPatients).catch(() => setPatients([]));
  }, []);

  return (
    <div className="stack">
      <PageHeader
        title="Admitted IPD Patients"
        subtitle="Monitor admitted patients, room type, diagnosis, and current care status."
      />
      <div className="stats-grid">
        <StatCard label="Admitted Patients" value={patients.length} tone="teal" />
      </div>
      <section className="panel">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Room</th>
                <th>Disease</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    No admitted patients found.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.roomType || '-'}</td>
                    <td>{patient.disease}</td>
                    <td>{patient.assignedDoctor?.name || '-'}</td>
                    <td>{patient.status}</td>
                    <td className="inline-actions">
                      <Link className="text-link" to={`/operations?patient=${patient._id}`}>
                        Operations
                      </Link>
                      <Link className="text-link" to={`/patients/${patient._id}/discharge`}>
                        Discharge
                      </Link>
                      <Link className="text-link" to={`/prescriptions/${patient._id}`}>
                        Record
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
