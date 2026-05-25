import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Modal } from './Modal';

const initialForm = {
  name: '',
  age: '',
  gender: 'Male',
  address: '',
  phone: '',
  bloodGroup: '',
  disease: '',
  visitType: 'New',
  type: 'OPD',
  roomType: 'AC',
  appointmentDate: '',
  timeSlot: '09:00',
  doctorId: ''
};

export function PatientFormModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [doctors, setDoctors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;

    function loadDoctors() {
      api.doctors().then((data) => {
        if (active) {
          setDoctors(data);
        }
      }).catch(() => {
        if (active) {
          setDoctors([]);
        }
      });
    }

    loadDoctors();
    window.addEventListener('doctor:list:updated', loadDoctors);

    return () => {
      active = false;
      window.removeEventListener('doctor:list:updated', loadDoctors);
    };
  }, [open]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
        const patient = await api.createPatient({
          name: form.name,
          age: Number(form.age),
          gender: form.gender,
          address: form.address,
          phone: form.phone,
          bloodGroup: form.bloodGroup,
          disease: form.disease,
          visitType: form.visitType,
          type: form.type,
          roomType: form.type === 'IPD' ? form.roomType : undefined,
        appointmentDate: form.appointmentDate || undefined,
        assignedDoctor: form.doctorId || undefined
      });

      if (form.appointmentDate && form.doctorId) {
        await api.createAppointment({
          patientId: patient._id,
          doctorId: form.doctorId,
          appointmentDate: form.appointmentDate,
          timeSlot: form.timeSlot,
          reason: form.disease
        });
      }

      setMessage('Patient registered successfully');
      setForm(initialForm);

      if (onSaved) {
        onSaved(patient);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title="Register Patient" onClose={onClose}>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input name="name" value={form.name} onChange={updateField} required />
        </label>
        <label>
          <span>Age</span>
          <input name="age" type="number" min="0" value={form.age} onChange={updateField} required />
        </label>
        <label>
          <span>Gender</span>
          <select name="gender" value={form.gender} onChange={updateField}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          <span>Phone</span>
          <input name="phone" value={form.phone} onChange={updateField} required />
        </label>
        <label>
          <span>Blood Group</span>
          <input name="bloodGroup" value={form.bloodGroup} onChange={updateField} placeholder="O+, A-, B+" />
        </label>
        <label className="full-span">
          <span>Address</span>
          <textarea name="address" value={form.address} onChange={updateField} required rows="2" />
        </label>
        <label className="full-span">
          <span>Disease / Complaint</span>
          <input name="disease" value={form.disease} onChange={updateField} required />
        </label>
        <label>
          <span>Visit Type</span>
          <select name="visitType" value={form.visitType} onChange={updateField}>
            <option value="New">New</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Procedure">Procedure</option>
          </select>
        </label>
        <label>
          <span>Patient Type</span>
          <select name="type" value={form.type} onChange={updateField}>
            <option value="OPD">OPD</option>
            <option value="IPD">IPD</option>
          </select>
        </label>
        {form.type === 'IPD' ? (
          <label>
            <span>Room Type</span>
            <select name="roomType" value={form.roomType || 'AC'} onChange={updateField}>
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
            </select>
          </label>
        ) : null}
        <label>
          <span>Doctor</span>
          <select name="doctorId" value={form.doctorId} onChange={updateField}>
            <option value="">Select doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Appointment Date</span>
          <input name="appointmentDate" type="date" value={form.appointmentDate} onChange={updateField} />
        </label>
        <label>
          <span>Time Slot</span>
          <input name="timeSlot" type="time" value={form.timeSlot} onChange={updateField} />
        </label>
        <div className="full-span actions-row">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Saving...' : 'Save Patient'}
          </button>
        </div>
        {message ? <p className="form-message full-span">{message}</p> : null}
      </form>
    </Modal>
  );
}
