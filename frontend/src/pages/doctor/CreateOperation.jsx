import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

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

export default function CreateOperation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.admittedPatients(), api.doctors()])
      .then(([admittedPatients, doctorList]) => {
        if (!active) return;
        setPatients(Array.isArray(admittedPatients) ? admittedPatients : []);
        setDoctors(Array.isArray(doctorList) ? doctorList : []);
        setForm((current) => ({ ...current, doctorId: user?.role === 'doctor' ? user._id : current.doctorId }));
      })
      .catch(() => {
        if (!active) return;
        setPatients([]);
        setDoctors([]);
      });

    return () => {
      active = false;
    };
  }, [user]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.createOperation({
        ...form,
        estimatedCost: form.estimatedCost === '' ? 0 : Number(form.estimatedCost),
        doctorId: user?.role === 'doctor' ? user._id : form.doctorId
      });
      window.dispatchEvent(new Event('operation:changed'));
      navigate('/doctor/operations');
    } catch (error) {
      setMessage(error.message || 'Unable to save operation');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-5 space-y-5">
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Hospital Module</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-800">Schedule Operation</h1>
        <p className="mt-1 text-slate-500">Create a new surgical schedule</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Patient</span>
            <select name="patientId" value={form.patientId} onChange={updateField} required className="rounded-2xl border px-4 py-3 outline-none">
              <option value="">Select admitted patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} - {patient.disease}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Doctor</span>
            {user?.role === 'doctor' ? (
              <input value={user?.name || ''} disabled className="rounded-2xl border px-4 py-3 outline-none bg-slate-50" />
            ) : (
              <select name="doctorId" value={form.doctorId} onChange={updateField} required className="rounded-2xl border px-4 py-3 outline-none">
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Operation Name</span>
            <input name="operationName" value={form.operationName} onChange={updateField} required className="rounded-2xl border px-4 py-3 outline-none" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Operation Type</span>
            <select name="operationType" value={form.operationType} onChange={updateField} className="rounded-2xl border px-4 py-3 outline-none">
              <option value="Minor">Minor</option>
              <option value="Major">Major</option>
              <option value="Emergency">Emergency</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <select name="status" value={form.status} onChange={updateField} className="rounded-2xl border px-4 py-3 outline-none">
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Scheduled Date</span>
            <input name="scheduledDate" type="date" value={form.scheduledDate} onChange={updateField} required className="rounded-2xl border px-4 py-3 outline-none" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Operation Date</span>
            <input name="operationDate" type="date" value={form.operationDate} onChange={updateField} className="rounded-2xl border px-4 py-3 outline-none" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Theatre Room</span>
            <input name="theatreRoom" value={form.theatreRoom} onChange={updateField} className="rounded-2xl border px-4 py-3 outline-none" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Anesthesia Type</span>
            <input name="anesthesiaType" value={form.anesthesiaType} onChange={updateField} className="rounded-2xl border px-4 py-3 outline-none" />
          </label>
          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Pre-Op Diagnosis</span>
            <textarea name="preOpDiagnosis" rows="3" value={form.preOpDiagnosis} onChange={updateField} className="rounded-2xl border px-4 py-3 outline-none" />
          </label>
          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Operation Notes</span>
            <textarea name="notes" rows="4" value={form.notes} onChange={updateField} className="rounded-2xl border px-4 py-3 outline-none" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Estimated Cost</span>
            <input name="estimatedCost" type="number" min="0" value={form.estimatedCost} onChange={updateField} className="rounded-2xl border px-4 py-3 outline-none" />
          </label>
        </div>

        {message ? <p className="mt-4 text-sm text-red-600">{message}</p> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Operation'}
          </button>
          <button type="button" onClick={() => setForm(initialForm)} className="rounded-2xl border px-5 py-3 font-semibold text-slate-700">
            Reset
          </button>
          <button type="button" onClick={() => navigate('/doctor/operations')} className="rounded-2xl border px-5 py-3 font-semibold text-slate-700">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
