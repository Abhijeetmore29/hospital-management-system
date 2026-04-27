import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';

export function PatientList() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      api.patients(search).then(setPatients).catch(() => setPatients([]));
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="stack">
      <PageHeader title="Patient List" subtitle="Search patients and open records for follow-up or prescription review." />
      <section className="panel">
        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search by name, phone, or disease"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Link className="primary-button" to="/patients/add">
            Add Patient
          </Link>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Disease</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    No patients found.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.disease}</td>
                    <td>{patient.type}</td>
                    <td>{patient.status}</td>
                    <td className="inline-actions">
                      <Link className="text-link" to={`/prescriptions/${patient._id}`}>
                        Open
                      </Link>
                      <Link className="text-link" to={`/prescriptions/${patient._id}/print`}>
                        Print
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

