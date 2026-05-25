import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';

export function PatientProfile() {
  const { patientId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    api.patientHistory(patientId).then(setData).catch(() => setData(null));
  }, [patientId]);

  if (!data) return <div className="p-6">Patient record not found.</div>;

  const { patient, appointments = [], payments = [] } = data;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Patient Profile" subtitle="Personal info, history, reports, medicines, and payments" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Name" value={patient?.name || '-'} />
        <StatCard label="Age" value={patient?.age ?? '-'} />
        <StatCard label="Phone" value={patient?.phone || '-'} />
        <StatCard label="Status" value={patient?.status || '-'} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="font-semibold text-slate-900">Personal Info</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm">
            <div>Name: {patient?.name || '-'}</div>
            <div>Gender: {patient?.gender || '-'}</div>
            <div>Age: {patient?.age ?? '-'}</div>
            <div>Phone: {patient?.phone || '-'}</div>
            <div>Disease: {patient?.disease || '-'}</div>
            <div>Doctor: {patient?.assignedDoctor?.name || '-'}</div>
          </div>
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="font-semibold text-slate-900">Consultation History</h3>
          <div className="mt-4 space-y-3">
            {appointments.slice(0, 5).map((item) => <div key={item._id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">{new Date(item.appointmentDate).toLocaleDateString()} - {item.doctor?.name || '-'} - {item.status}</div>)}
          </div>
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="font-semibold text-slate-900">Reports</h3>
          <div className="mt-4 text-sm text-slate-600">{patient?.requiredTests || 'No reports yet.'}</div>
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="font-semibold text-slate-900">Medicines</h3>
          <div className="mt-4 text-sm text-slate-600">{patient?.doctorPrescription || 'No medicines yet.'}</div>
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
          <h3 className="font-semibold text-slate-900">Payments</h3>
          <div className="mt-4 space-y-3">
            {payments.slice(0, 5).map((item) => <div key={item._id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">{item.billingType} - Rs. {item.amount} - {item.paymentMethod}</div>)}
            {!payments.length ? <div className="text-sm text-slate-500">No billing history.</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
