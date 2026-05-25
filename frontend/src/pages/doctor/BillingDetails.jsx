import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { BillingSummaryCard } from '../../components/BillingSummaryCard';
import { api } from '../../services/api';

export function BillingDetails() {
  const { billingId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    api.billing(billingId)
      .then((data) => setBill(data))
      .catch(() => setBill(null))
      .finally(() => setLoading(false));
  }, [billingId]);

  const markPaid = async () => {
    try {
      const updated = await api.markBillingPaid(billingId);
      setBill(updated);
      setMessage('Marked as paid.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) return <div className="p-6">Loading billing...</div>;
  if (!bill) return <div className="p-6">Billing record not found.</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Billing Details" subtitle="Patient billing information and payment status" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BillingSummaryCard label="Patient" value={bill.patient?.name || '-'} />
        <BillingSummaryCard label="Doctor" value={bill.doctor?.name || '-'} />
        <BillingSummaryCard label="Total" value={`Rs. ${bill.totalAmount ?? bill.amount ?? 0}`} tone="green" />
        <BillingSummaryCard label="Status" value={bill.status} tone={bill.status === 'Paid' ? 'green' : bill.status === 'Cancelled' ? 'red' : 'amber'} />
      </div>
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 text-sm">
          {[
            ['Patient Name', bill.patient?.name],
            ['Age', bill.patient?.age],
            ['Gender', bill.patient?.gender],
            ['Phone', bill.patient?.phone],
            ['Doctor Name', bill.doctor?.name],
            ['Visit Type', bill.appointment?.visitType || bill.appointment?.reason || '-'],
            ['Consultation Fee', bill.consultationFee ?? 0],
            ['Laboratory Charges', bill.laboratoryCharges ?? 0],
            ['Medicine Charges', bill.medicineCharges ?? 0],
            ['Additional Charges', bill.additionalCharges ?? 0],
            ['Total Amount', `Rs. ${bill.totalAmount ?? bill.amount ?? 0}`],
            ['Payment Status', bill.status],
            ['Payment Method', bill.paymentMethod || '-'],
            ['Billing Date', bill.billingDate ? new Date(bill.billingDate).toLocaleString() : '-']
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
              <div className="mt-1 font-semibold text-slate-900">{value}</div>
            </div>
          ))}
        </div>
      </section>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => window.print()} className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white">Print Bill</button>
        <button type="button" onClick={() => window.print()} className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700">Download Receipt</button>
        <button type="button" onClick={markPaid} className="rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white">Mark as Paid</button>
        <button type="button" onClick={() => navigate('/doctor/billing')} className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700">Back</button>
      </div>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      <section className="print:block hidden rounded-3xl bg-white p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Billing Details</h2>
          <p className="text-sm text-slate-500">Patient billing information and payment status</p>
        </div>
      </section>
    </div>
  );
}
