import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AppointmentForm } from '../../components/AppointmentForm';

const empty = { patientName: '', age: '', gender: 'Male', phone: '', visitType: 'OPD', doctor: '', date: '', slot: '', reason: '' };

export function CreateAppointment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.doctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    if (user?._id && user?.role === 'doctor') {
      setForm((current) => ({ ...current, doctor: current.doctor || user._id }));
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.patientName || !form.phone || !form.doctor || !form.date || !form.slot) {
      setMessage('Fill all required fields');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      await api.createAppointment({
        patientName: form.patientName,
        age: Number(form.age) || 0,
        gender: form.gender,
        phone: form.phone,
        doctor: form.doctor,
        visitType: form.visitType,
        date: form.date,
        slot: form.slot,
        reason: form.reason,
        status: 'pending'
      });
      window.dispatchEvent(new Event('appointment:changed'));
      navigate('/doctor/appointments', { replace: true });
    } catch (error) {
      setMessage(error?.message || 'Failed to save appointment');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-3xl font-bold text-slate-900">Create Appointment</h2>
        <p className="text-sm text-slate-500">Schedule a new patient appointment</p>
      </div>
      {message ? <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div> : null}
      <AppointmentForm
        form={form}
        setForm={setForm}
        doctors={doctors}
        onSubmit={handleSubmit}
        onReset={() => setForm({ ...empty, doctor: user?.role === 'doctor' ? user._id : '' })}
        onCancel={() => navigate('/doctor/appointments')}
        saving={saving}
      />
    </div>
  );
}
