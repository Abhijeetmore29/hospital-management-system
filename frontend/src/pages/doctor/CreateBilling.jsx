import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BillingSummaryCard } from '../../components/BillingSummaryCard';
import { PageHeader } from '../../components/PageHeader';
import { PaymentSection } from '../../components/PaymentSection';
import { api } from '../../services/api';

const empty = {
  consultationFee: 0,
  laboratoryCharges: 0,
  medicineCharges: 0,
  additionalCharges: 0,
  discount: 0,
  paymentMethod: 'Cash'
};

export function CreateBilling() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!appointmentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.consultation(appointmentId)
      .then((payload) => setData(payload))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  useEffect(() => {
    if (!data?.doctor?._id) return;
    api.paymentSettings(data.doctor._id).then(setSettings).catch(() => setSettings(null));
  }, [data]);

  const totalAmount = useMemo(() => {
    const sum = Number(form.consultationFee || 0) + Number(form.laboratoryCharges || 0) + Number(form.medicineCharges || 0) + Number(form.additionalCharges || 0) - Number(form.discount || 0);
    return Math.max(0, sum);
  }, [form]);

  const update = (e) => setForm((c) => ({ ...c, [e.target.name]: e.target.value }));

  const save = async (status = 'Pending') => {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        appointmentId,
        patientId: data?.patient?._id,
        doctorId: data?.doctor?._id,
        consultationFee: Number(form.consultationFee || 0),
        laboratoryCharges: Number(form.laboratoryCharges || 0),
        medicineCharges: Number(form.medicineCharges || 0),
        additionalCharges: Number(form.additionalCharges || 0),
        discount: Number(form.discount || 0),
        amount: totalAmount,
        paymentMethod: form.paymentMethod,
        status
      };
      const bill = await api.createBilling(payload);
      navigate(`/doctor/billing/view/${bill._id}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading bill form...</div>;
  if (!data) return <div className="p-6">Appointment not found.</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Create Bill" subtitle="Generate patient billing" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BillingSummaryCard label="Patient" value={data.patient?.name || '-'} />
        <BillingSummaryCard label="Doctor" value={data.doctor?.name || '-'} />
        <BillingSummaryCard label="Visit Type" value={data.appointment?.visitType || 'OPD'} />
        <BillingSummaryCard label="Total" value={`Rs. ${totalAmount}`} tone="green" />
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Patient</div>
            <div className="mt-1 font-semibold text-slate-900">{data.patient?.name}</div>
            <div className="text-slate-600">{data.patient?.age} / {data.patient?.gender}</div>
            <div className="text-slate-600">{data.patient?.phone}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Doctor</div>
            <div className="mt-1 font-semibold text-slate-900">{data.doctor?.name}</div>
            <div className="text-slate-600">{data.appointment?.reason || data.patient?.disease}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Consultation</div>
            <div className="mt-1 font-semibold text-slate-900">{data.patient?.diagnosis || '-'}</div>
            <div className="text-slate-600">{data.patient?.requiredTests || '-'}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2"><span className="text-sm text-slate-600">Consultation Fee</span><input type="number" name="consultationFee" value={form.consultationFee} onChange={update} className="rounded-2xl border px-4 py-3" /></label>
            <label className="grid gap-2"><span className="text-sm text-slate-600">Laboratory Charges</span><input type="number" name="laboratoryCharges" value={form.laboratoryCharges} onChange={update} className="rounded-2xl border px-4 py-3" /></label>
            <label className="grid gap-2"><span className="text-sm text-slate-600">Medicine Charges</span><input type="number" name="medicineCharges" value={form.medicineCharges} onChange={update} className="rounded-2xl border px-4 py-3" /></label>
            <label className="grid gap-2"><span className="text-sm text-slate-600">Additional Charges</span><input type="number" name="additionalCharges" value={form.additionalCharges} onChange={update} className="rounded-2xl border px-4 py-3" /></label>
            <label className="grid gap-2"><span className="text-sm text-slate-600">Discount</span><input type="number" name="discount" value={form.discount} onChange={update} className="rounded-2xl border px-4 py-3" /></label>
            <label className="grid gap-2"><span className="text-sm text-slate-600">Payment Method</span><select name="paymentMethod" value={form.paymentMethod} onChange={update} className="rounded-2xl border px-4 py-3"><option>Cash</option><option>UPI</option><option>Card</option><option>Online</option></select></label>
            <div className="md:col-span-2 rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Total Amount</div>
              <div className="text-3xl font-bold text-slate-900">Rs. {totalAmount}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => save('Pending')} disabled={saving} className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white">Generate Bill</button>
            <button type="button" onClick={() => save('Pending')} disabled={saving} className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700">Save Draft</button>
            <button type="button" onClick={() => window.print()} className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700">Print Bill</button>
            <Link to="/doctor/billing" className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700">Cancel</Link>
          </div>
          {message ? <p className="text-sm text-red-600">{message}</p> : null}
        </form>
        <PaymentSection settings={settings} />
      </section>
    </div>
  );
}
