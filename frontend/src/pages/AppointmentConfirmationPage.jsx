import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { publicApi } from '../services/api';

const Row = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
    <div className="mt-1 font-medium text-slate-900">{value || '-'}</div>
  </div>
);

export function AppointmentConfirmationPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const [appointment, setAppointment] = useState(state?.appointment || null);

  useEffect(() => {
    const id = searchParams.get('id');
    if (!appointment && id) {
      publicApi.appointment(id).then(setAppointment).catch(() => setAppointment(null));
    }
  }, [appointment, searchParams]);

  if (!appointment) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6">
        <div className="w-full rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Appointment Confirmation</h1>
          <p className="mt-2 text-slate-500">No appointment details found.</p>
          <div className="mt-6 flex gap-3">
            <Link to="/" className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white">Go Home</Link>
            <button onClick={() => navigate('/')} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Meditrack</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">Appointment Confirmation</h1>
            <p className="mt-1 text-slate-500">Your appointment request has been submitted successfully</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">Pending</span>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Row label="Patient Name" value={appointment.patientName} />
          <Row label="Phone" value={appointment.phone} />
          <Row label="Doctor" value={appointment.doctor?.name || '-'} />
          <Row label="Visit Type" value={appointment.visitType} />
          <Row label="Date" value={(appointment.date || appointment.appointmentDate) ? new Date(appointment.date || appointment.appointmentDate).toLocaleDateString() : '-'} />
          <Row label="Time Slot" value={appointment.slot || appointment.timeSlot} />
          <Row label="Reason" value={appointment.reason} />
          <Row label="Booking For" value={appointment.bookingFor || '-'} />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/" className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white">Back to Home</Link>
          <button onClick={() => window.print()} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">Print</button>
        </div>
      </div>
    </div>
  );
}
