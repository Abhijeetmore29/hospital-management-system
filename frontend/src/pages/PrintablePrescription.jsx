import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';

export function PrintablePrescription() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.patient(patientId)
      .then((data) => {
        setPatient(data);
        setLoading(false);
      })
      .catch(() => {
        setPatient(null);
        setLoading(false);
      });
  }, [patientId]);

  if (loading) {
    return <div className="panel">Loading printable prescription...</div>;
  }

  if (!patient) {
    return <div className="panel">Patient record not found.</div>;
  }

  return (
    <div className="stack">
      <PageHeader
        title="Printable Prescription"
        subtitle="Medical print layout with patient details and doctor notes."
        action={
          <button className="primary-button" onClick={() => window.print()}>
            Print Prescription
          </button>
        }
      />
      <section className="print-sheet">
        <div className="print-header">
          <h2>City Care Hospital</h2>
          <p>General Medicine and Multi-Speciality Care</p>
        </div>
        <div className="print-grid">
          <div>
            <span>Patient Name</span>
            <strong>{patient.name}</strong>
          </div>
          <div>
            <span>Age / Gender</span>
            <strong>
              {patient.age} / {patient.gender}
            </strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>{patient.phone}</strong>
          </div>
          <div>
            <span>Disease</span>
            <strong>{patient.disease}</strong>
          </div>
          <div>
            <span>Visit Type</span>
            <strong>{patient.type}</strong>
          </div>
          <div>
            <span>Date</span>
            <strong>{new Date(patient.updatedAt || patient.createdAt).toLocaleDateString()}</strong>
          </div>
        </div>
        <div className="print-section">
          <span>Doctor Notes</span>
          <pre>{patient.doctorPrescription || 'No prescription has been written yet.'}</pre>
        </div>
        <div className="print-section">
          <span>Diagnosis</span>
          <p>{patient.diagnosis || 'Pending review'}</p>
        </div>
        <div className="signature-block">
          <div>
            <span>Signature</span>
            <div className="signature-line" />
          </div>
        </div>
      </section>
    </div>
  );
}
