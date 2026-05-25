import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';

const empty = { vitals: '', symptoms: '', diagnosis: '', clinicalNotes: '', doctorPrescription: '', requiredTests: '', followUp: '' };

export function ConsultationPage() {
  const { appointmentId } = useParams();
  const [data, setData] = useState(null);
  const [form, setForm] = useState(empty);

  useEffect(() => {
    api.consultation(appointmentId).then((d) => {
      setData(d);
      setForm({
        vitals: d?.patient?.vitals || '',
        symptoms: d?.patient?.disease || '',
        diagnosis: d?.patient?.diagnosis || '',
        clinicalNotes: d?.patient?.doctorPrescription || '',
        doctorPrescription: d?.patient?.doctorPrescription || '',
        requiredTests: d?.patient?.requiredTests || '',
        followUp: ''
      });
    }).catch(() => setData(null));
  }, [appointmentId]);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const save = (payload) => api.saveConsultation(appointmentId, payload);

  if (!data) return <div className="p-6">Loading consultation...</div>;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Patient Consultation" subtitle="Consultation workflow and clinical notes" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Patient" value={data.patient?.name || '-'} />
        <StatCard label="Doctor" value={data.doctor?.name || '-'} />
        <StatCard label="Visit Type" value={data.appointment?.visitType || 'OPD'} tone="cyan" />
        <StatCard label="Status" value={data.appointment?.status || 'pending'} tone="green" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-2xl border px-4 py-3" value={form.vitals} onChange={update} name="vitals" placeholder="Vitals" />
            <input className="rounded-2xl border px-4 py-3" value={form.symptoms} onChange={update} name="symptoms" placeholder="Symptoms" />
            <textarea className="rounded-2xl border px-4 py-3 md:col-span-2" rows="3" value={form.diagnosis} onChange={update} name="diagnosis" placeholder="Diagnosis" />
            <textarea className="rounded-2xl border px-4 py-3 md:col-span-2" rows="4" value={form.clinicalNotes} onChange={update} name="clinicalNotes" placeholder="Clinical notes" />
            <textarea className="rounded-2xl border px-4 py-3 md:col-span-2" rows="4" value={form.doctorPrescription} onChange={update} name="doctorPrescription" placeholder="Prescription section" />
            <textarea className="rounded-2xl border px-4 py-3 md:col-span-2" rows="3" value={form.requiredTests} onChange={update} name="requiredTests" placeholder="Laboratory tests" />
            <input className="rounded-2xl border px-4 py-3 md:col-span-2" value={form.followUp} onChange={update} name="followUp" placeholder="Follow-up option" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => save({ ...form, status: 'pending' })} className="rounded-full border px-5 py-3 font-semibold">Save Draft</button>
            <button type="button" onClick={() => save({ ...form, complete: true, status: 'completed' })} className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white">Complete Consultation</button>
            <button type="button" onClick={() => save({ ...form, sendToLab: true, status: 'confirmed' })} className="rounded-full bg-cyan-600 px-5 py-3 font-semibold text-white">Send to Laboratory</button>
            <button type="button" onClick={() => save({ ...form, followUp: true, status: 'pending' })} className="rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white">Mark Follow-up</button>
          </div>
        </section>
        <section className="space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="text-sm font-semibold text-slate-500">Previous History</div>
            <div className="mt-3 space-y-3">
              {(data.history || []).slice(0, 5).map((item) => <div key={item._id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{new Date(item.appointmentDate).toLocaleDateString()} - {item.doctor?.name || '-'} - {item.status}</div>)}
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="text-sm font-semibold text-slate-500">Patient Info</div>
            <div className="mt-3 grid gap-3 text-sm">
              <div>Name: {data.patient?.name || '-'}</div>
              <div>Age: {data.patient?.age ?? '-'}</div>
              <div>Phone: {data.patient?.phone || '-'}</div>
              <div>Doctor: {data.doctor?.name || '-'}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
