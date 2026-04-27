import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';

export function DischargePatient() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState({
    dischargeDate: new Date().toISOString().slice(0, 10),
    dischargeSummary: ''
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.patient(patientId)
      .then((data) => {
        setPatient(data);
        setForm((current) => ({
          ...current,
          dischargeSummary: data.dischargeSummary || ''
        }));
      })
      .catch(() => setPatient(null));
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
      await api.dischargePatient(patientId, form);
      setMessage('Patient discharged successfully.');
      navigate('/doctor/admitted-patients');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!patient) {
    return <div className="panel">Loading patient record...</div>;
  }

  return (
    <div className="stack">
      <PageHeader
        title="Discharge Patient"
        subtitle={`Complete discharge for ${patient.name}`}
      />
      <section className="panel">
        <div className="patient-summary">
          <div>
            <span>Patient</span>
            <strong>{patient.name}</strong>
          </div>
          <div>
            <span>Room</span>
            <strong>{patient.roomType || '-'}</strong>
          </div>
          <div>
            <span>Doctor</span>
            <strong>{patient.assignedDoctor?.name || '-'}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{patient.status}</strong>
          </div>
        </div>
      </section>
      <section className="panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Discharge Date</span>
            <input name="dischargeDate" type="date" value={form.dischargeDate} onChange={updateField} required />
          </label>
          <label className="full-span">
            <span>Discharge Summary</span>
            <textarea
              name="dischargeSummary"
              rows="6"
              value={form.dischargeSummary}
              onChange={updateField}
              placeholder="Add final diagnosis, treatment summary, follow-up advice, and discharge notes."
              required
            />
          </label>
          <div className="full-span actions-row">
            <button type="button" className="secondary-button" onClick={() => navigate('/doctor/admitted-patients')}>
              Cancel
            </button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Discharging...' : 'Discharge Patient'}
            </button>
          </div>
          {message ? <p className="form-message full-span">{message}</p> : null}
        </form>
      </section>
    </div>
  );
}

