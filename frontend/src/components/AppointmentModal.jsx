import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../services/api';

const visitTypes = ['OPD', 'IPD', 'Follow-up', 'Emergency'];
const bookingFor = ['Myself', 'Family'];
const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

const empty = {
  title: 'Mr',
  firstName: '',
  lastName: '',
  mobile: '',
  age: '',
  gender: 'Male',
  visitType: 'OPD',
  bookingFor: 'Myself',
  doctorId: '',
  date: '',
  slot: '',
  notes: ''
};

export function AppointmentModal({ onClose }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    publicApi.doctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const appointment = await publicApi.createAppointment({
        patientName: `${form.title} ${form.firstName} ${form.lastName}`.trim(),
        phone: form.mobile,
        doctor: form.doctorId,
        visitType: form.visitType,
        date: form.date,
        slot: form.slot,
        reason: form.notes,
        bookingFor: form.bookingFor,
        age: form.age,
        gender: form.gender
      });
      navigate(`/appointment/confirmation?id=${appointment._id}`, {
        replace: true,
        state: {
          appointment
        }
      });
    } catch (e) {
      setError(e?.message || 'Failed to submit booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-3xl bg-white p-5 shadow-2xl transition-all duration-300 md:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Book an Appointment</h2>
            <p className="mt-1 text-sm text-slate-500">Meditrack Hospital</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">X</button>
        </div>

        <form className="grid gap-4" onSubmit={submit}>
          {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          {success ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

          <div className="grid gap-4 md:grid-cols-3">
            <select className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}>
              {['Mr', 'Mrs', 'Ms', 'Dr'].map((v) => <option key={v}>{v}</option>)}
            </select>
            <input className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <input className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <input className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" placeholder="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            <input type="number" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            <select className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              {['Male', 'Female', 'Other'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Visit Type</p>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 md:grid-cols-4">
              {visitTypes.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm({ ...form, visitType: v })}
                  className={`rounded-xl px-3 py-2 text-sm font-medium shadow-sm transition-all duration-300 ${form.visitType === v ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Booking For</p>
            <div className="grid grid-cols-2 gap-2">
              {bookingFor.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm({ ...form, bookingFor: v })}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-300 ${form.bookingFor === v ? 'border-cyan-300 bg-cyan-50 text-cyan-700' : 'border-slate-200 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <select className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name}{doctor.specialization ? ` - ${doctor.specialization}` : ''}
                </option>
              ))}
            </select>
            <input type="date" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <select className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>
              <option value="">Time Slot</option>
              {timeSlots.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>

          <textarea className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 outline-none" placeholder="Symptoms / Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3.5 font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit Booking Request'}
          </button>

          <p className="text-center text-sm text-slate-500">WhatsApp confirmation will be sent after approval.</p>
        </form>
      </div>
    </div>
  );
}
