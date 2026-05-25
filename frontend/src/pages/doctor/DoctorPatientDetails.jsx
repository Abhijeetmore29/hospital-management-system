import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';

const Item = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
    <div className="mt-1 font-medium text-slate-900">{value || '-'}</div>
  </div>
);

export function DoctorPatientDetails() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    api.patientHistory(patientId).then(setData).catch(() => setData(null));
  }, [patientId]);

  if (!data) return <div className="p-6 text-slate-500">Loading patient details...</div>;

  const { patient, appointments = [], payments = [] } = data;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Patient Profile</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">{patient?.name || '-'}</h1>
          <p className="mt-1 text-slate-500">Patient information and visit history</p>
        </div>
        <button onClick={() => navigate(-1)} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">Back</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Item label="Full Name" value={patient?.name} />
        <Item label="Age" value={patient?.age} />
        <Item label="Gender" value={patient?.gender} />
        <Item label="Phone" value={patient?.phone} />
        <Item label="Status" value={patient?.status} />
        <Item label="Blood Group" value={patient?.bloodGroup} />
        <Item label="Doctor" value={patient?.assignedDoctor?.name} />
        <Item label="Department" value={patient?.assignedDoctor?.department || patient?.type} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Address & Disease</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-700">
            <div>Address: {patient?.address || '-'}</div>
            <div>Disease: {patient?.disease || '-'}</div>
            <div>Diagnosis: {patient?.diagnosis || '-'}</div>
          </div>
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Consultation History</h3>
          <div className="mt-4 space-y-3">
            {appointments.length ? appointments.map((item) => (
              <div key={item._id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                {new Date(item.appointmentDate).toLocaleDateString()} - {item.doctor?.name || '-'} - {item.status}
              </div>
            )) : <div className="text-sm text-slate-500">No appointments found.</div>}
          </div>
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900">Payments</h3>
          <div className="mt-4 space-y-3">
            {payments.length ? payments.map((item) => (
              <div key={item._id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                {item.billingType} - Rs. {item.amount} - {item.paymentMethod}
              </div>
            )) : <div className="text-sm text-slate-500">No billing history.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
