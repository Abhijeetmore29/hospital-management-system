import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';

export function PrintPrescription() {
  const { appointmentId } = useParams();
  const [record, setRecord] = useState(null);

  useEffect(() => {
    api.prescriptionByAppointment(appointmentId)
      .then(setRecord)
      .catch(() => api.patient(appointmentId).then((patient) => setRecord({ patient })).catch(() => setRecord(null)));
  }, [appointmentId]);

  if (!record) return <div className="p-6">Loading prescription...</div>;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Prescription"
        subtitle="Printable prescription sheet"
        action={
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white">Print</button>
            <button onClick={() => window.print()} className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700">Download PDF</button>
          </div>
        }
      />
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 print:shadow-none print:ring-0">
        <div className="border-b pb-4 text-center">
          <div className="text-2xl font-bold text-slate-900">Meditrack Hospital</div>
          <div className="text-sm text-slate-500">Hospital Header</div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div><span className="text-sm text-slate-500">Doctor</span><div className="font-semibold">{record.doctor?.name || '-'}</div></div>
          <div><span className="text-sm text-slate-500">Patient</span><div className="font-semibold">{record.patient?.name || '-'}</div></div>
          <div><span className="text-sm text-slate-500">Age / Gender</span><div className="font-semibold">{record.patient?.age ?? '-'} / {record.patient?.gender || '-'}</div></div>
          <div><span className="text-sm text-slate-500">Phone</span><div className="font-semibold">{record.patient?.phone || '-'}</div></div>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr><th className="px-4 py-3">Medicine</th><th className="px-4 py-3">Dosage</th><th className="px-4 py-3">Frequency</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Notes</th></tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3">{record.patient?.doctorPrescription || '-'}</td>
                <td className="px-4 py-3">-</td>
                <td className="px-4 py-3">-</td>
                <td className="px-4 py-3">-</td>
                <td className="px-4 py-3">{record.patient?.requiredTests || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-500">Instructions</div>
          <div className="mt-2 text-sm text-slate-700">{record.patient?.diagnosis || 'Follow doctor instructions.'}</div>
        </div>
        <div className="mt-8 text-right">
          <div className="inline-block border-t border-slate-400 pt-2 text-sm text-slate-600">Signature</div>
        </div>
      </section>
    </div>
  );
}
