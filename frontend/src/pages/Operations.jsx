import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';

const initialForm = {
  patientId: '',
  doctorId: '',
  operationName: '',
  operationType: 'Minor',
  status: 'Scheduled',
  scheduledDate: '',
  operationDate: '',
  theatreRoom: '',
  anesthesiaType: '',
  preOpDiagnosis: '',
  notes: '',
  estimatedCost: ''
};

export function Operations() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [operations, setOperations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    function loadData() {
      Promise.all([api.operations(), api.admittedPatients(), api.doctors()])
        .then(([ops, admittedPatients, doctorList]) => {
          if (!active) {
            return;
          }

          setOperations(ops);
          setPatients(admittedPatients);
          setDoctors(doctorList);
          setForm((current) => ({
            ...current,
            doctorId: user?.role === 'doctor' ? user._id : current.doctorId
          }));
        })
        .catch(() => {
          if (!active) {
            return;
          }

          setOperations([]);
          setPatients([]);
          setDoctors([]);
        });
    }

    loadData();
    window.addEventListener('doctor:list:updated', loadData);

    return () => {
      active = false;
      window.removeEventListener('doctor:list:updated', loadData);
    };
  }, [user]);

  useEffect(() => {
    const patientId = searchParams.get('patient');
    if (patientId) {
      setForm((current) => ({ ...current, patientId }));
    }
  }, [searchParams]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const operation = await api.createOperation({
        ...form,
        estimatedCost: form.estimatedCost === '' ? 0 : Number(form.estimatedCost),
        doctorId: user?.role === 'doctor' ? user._id : form.doctorId
      });

      setOperations((current) => [operation, ...current]);
      setMessage('Operation saved successfully.');
      setForm(initialForm);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  const canSelectDoctor = user?.role === 'staff';

  return (
    <div className="stack">
      <PageHeader
        title="Operation Module"
        subtitle="Capture complete operation details for admitted IPD patients."
      />

      <section className="panel">
        <div className="panel-head">
          <h3>Create Operation</h3>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Patient</span>
            <select name="patientId" value={form.patientId} onChange={updateField} required>
              <option value="">Select admitted patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} - {patient.disease}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Doctor</span>
            {canSelectDoctor ? (
              <select name="doctorId" value={form.doctorId} onChange={updateField} required>
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            ) : (
              <input value={user?.name || ''} disabled />
            )}
          </label>
          <label>
            <span>Operation Name</span>
            <input name="operationName" value={form.operationName} onChange={updateField} required />
          </label>
          <label>
            <span>Operation Type</span>
            <select name="operationType" value={form.operationType} onChange={updateField}>
              <option value="Minor">Minor</option>
              <option value="Major">Major</option>
              <option value="Emergency">Emergency</option>
            </select>
          </label>
          <label>
            <span>Status</span>
            <select name="status" value={form.status} onChange={updateField}>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>
          <label>
            <span>Scheduled Date</span>
            <input name="scheduledDate" type="date" value={form.scheduledDate} onChange={updateField} required />
          </label>
          <label>
            <span>Operation Date</span>
            <input name="operationDate" type="date" value={form.operationDate} onChange={updateField} />
          </label>
          <label>
            <span>Theatre Room</span>
            <input name="theatreRoom" value={form.theatreRoom} onChange={updateField} />
          </label>
          <label>
            <span>Anesthesia Type</span>
            <input name="anesthesiaType" value={form.anesthesiaType} onChange={updateField} />
          </label>
          <label className="full-span">
            <span>Pre-Op Diagnosis</span>
            <textarea name="preOpDiagnosis" rows="3" value={form.preOpDiagnosis} onChange={updateField} />
          </label>
          <label className="full-span">
            <span>Operation Notes</span>
            <textarea name="notes" rows="4" value={form.notes} onChange={updateField} />
          </label>
          <label>
            <span>Estimated Cost</span>
            <input name="estimatedCost" type="number" min="0" value={form.estimatedCost} onChange={updateField} />
          </label>
          <div className="full-span actions-row">
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Operation'}
            </button>
          </div>
          {message ? <p className="form-message full-span">{message}</p> : null}
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Operation Details</h3>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Operation</th>
                <th>Type</th>
                <th>Doctor</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {operations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-cell">
                    No operation records found.
                  </td>
                </tr>
              ) : (
                operations.map((operation) => (
                  <tr key={operation._id}>
                    <td>{operation.patient?.name}</td>
                    <td>{operation.operationName}</td>
                    <td>{operation.operationType}</td>
                    <td>{operation.doctor?.name}</td>
                    <td>{new Date(operation.scheduledDate).toLocaleDateString()}</td>
                    <td>{operation.status}</td>
                    <td>Rs. {operation.estimatedCost}</td>
                    <td className="inline-actions">
                      <Link className="text-link" to={`/operations/${operation._id}/print`}>
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
