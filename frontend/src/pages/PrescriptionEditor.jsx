import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';

export function PrescriptionEditor() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState({ diagnosis: '', doctorPrescription: '', status: 'In Progress' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
      return;
    }

    setLoading(true);
    api.patient(patientId).then((data) => {
      setPatient(data);
      setForm({
        diagnosis: data.diagnosis || '',
        doctorPrescription: data.doctorPrescription || '',
        status: data.status || 'In Progress'
      });
      setLoading(false);
    }).catch(() => {
      setPatient(null);
      setLoading(false);
    });
  }, [patientId]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const updated = await api.updatePrescription(patientId, form);
      setPatient(updated);
      setMessage('Prescription saved successfully.');
      navigate(`/prescriptions/${patientId}/print`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="panel">Loading patient record...</div>;
  }

  if (!patient) {
    return <div className="panel">Patient record not found.</div>;
  }

  return (
    <div className="stack">
      <PageHeader
        title="Prescription Editor"
        subtitle={`Open record for ${patient.name}`}
        action={
          <Link className="secondary-button" to={`/prescriptions/${patientId}/print`}>
            Printable View
          </Link>
        }
      />
      <section className="panel">
        <div className="patient-summary">
          <div>
            <span>Patient</span>
            <strong>{patient.name}</strong>
          </div>
          <div>
            <span>Disease</span>
            <strong>{patient.disease}</strong>
          </div>
          <div>
            <span>Type</span>
            <strong>{patient.type}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{patient.status}</strong>
          </div>
        </div>
      </section>
      <section className="panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="full-span">
            <span>Diagnosis</span>
            <textarea name="diagnosis" rows="3" value={form.diagnosis} onChange={updateField} />
          </label>
          <label className="full-span">
            <span>Doctor Prescription / Notes</span>
            <textarea name="doctorPrescription" rows="6" value={form.doctorPrescription} onChange={updateField} required />
          </label>
          <label>
            <span>Status</span>
            <select name="status" value={form.status} onChange={updateField}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Discharged">Discharged</option>
            </select>
          </label>
          <div className="full-span actions-row">
            <button className="secondary-button" type="button" onClick={() => navigate('/patients')}>
              Back
            </button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Prescription'}
            </button>
          </div>
          {message ? <p className="form-message full-span">{message}</p> : null}
        </form>
      </section>
    </div>
  );
}
