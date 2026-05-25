import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BillCard } from '../../components/BillCard';
import StaffHeader from '../../components/StaffHeader';
import { api } from '../../services/api';

export default function BillingPage({ compact = false } = {}) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [billings, setBillings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState('');
  const [billId, setBillId] = useState('');
  const [status, setStatus] = useState('');

  const loadData = () => {
    Promise.all([api.appointments(), api.billings(), api.paymentSummary()])
      .then(([appointmentData, billingData, summaryData]) => {
        setAppointments(Array.isArray(appointmentData) ? appointmentData : []);
        setBillings(Array.isArray(billingData) ? billingData : []);
        setSummary(summaryData || null);
      })
      .catch(() => {
        setAppointments([]);
        setBillings([]);
        setSummary(null);
      });
  };

  useEffect(loadData, []);

  const rows = useMemo(() => {
    const billingByAppointment = Object.fromEntries(
      billings
        .filter((bill) => bill.appointment?._id)
        .map((bill) => [bill.appointment._id, bill])
    );

    return appointments
      .map((appointment) => {
        const bill = billingByAppointment[appointment._id] || null;
        const patient = appointment.patient || {};
        return {
          _id: bill?._id || appointment._id,
          appointmentId: appointment._id,
          billingId: bill?._id || '',
          patientName: patient.name || '-',
          phone: patient.phone || '-',
          doctorName: appointment.doctor?.name || '-',
          visitType: appointment.visitType || appointment.reason || 'OPD',
          amount: bill?.totalAmount ?? bill?.amount ?? 0,
          paymentStatus: bill?.status || 'Pending',
          billingDate: bill?.billingDate || appointment.createdAt
        };
      })
      .filter((row) => {
        const haystack = [row.patientName, row.phone, row.doctorName, row.visitType, row._id, row.appointmentId]
          .join(' ')
          .toLowerCase();
        return haystack.includes(search.toLowerCase()) && (!billId || haystack.includes(billId.toLowerCase())) && (!status || row.paymentStatus === status);
      })
      .sort((a, b) => new Date(b.billingDate) - new Date(a.billingDate));
  }, [appointments, billings, search, status, billId]);

  return (
    <div className="space-y-6">
      {compact ? <StaffHeader title="Billing" subtitle="Manage invoices and payments" /> : (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Billing Management</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-800">Manage patient invoices and payments</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              const target = rows.find((row) => !row.billingId) || rows[0];
              if (target?.appointmentId) {
                navigate(`/doctor/billing/create/${target.appointmentId}`);
              }
            }}
            className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Create Bill
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BillCard label="Total Revenue" value={`Rs. ${summary?.totalAmount ?? 0}`} tone="blue" />
        <BillCard label="Pending Payments" value={billings.filter((bill) => bill.status !== 'Paid').length} tone="yellow" />
        <BillCard label="Paid Bills" value={billings.filter((bill) => bill.status === 'Paid').length} tone="green" />
        <BillCard label="Appointments" value={appointments.length} tone="cyan" />
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid flex-1 gap-3 md:grid-cols-3">
            <input className="w-full rounded-2xl border px-4 py-3" placeholder="Search patient" value={search} onChange={(e) => setSearch(e.target.value)} />
            <input className="w-full rounded-2xl border px-4 py-3" placeholder="Bill ID / Appointment ID" value={billId} onChange={(e) => setBillId(e.target.value)} />
            <select className="w-full rounded-2xl border px-4 py-3" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Payment status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <button type="button" onClick={loadData} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700">
            Refresh
          </button>
        </div>
      </section>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>
                {['Patient', 'Phone', 'Doctor', 'Visit Type', 'Amount', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} className="px-4 py-4 text-left font-medium">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length ? rows.map((row) => (
                <tr key={row._id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-4 font-medium text-slate-900">{row.patientName}</td>
                  <td className="px-4 py-4 text-slate-600">{row.phone}</td>
                  <td className="px-4 py-4 text-slate-600">{row.doctorName}</td>
                  <td className="px-4 py-4 text-slate-600">{row.visitType}</td>
                  <td className="px-4 py-4 text-slate-600">Rs. {row.amount}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${row.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : row.paymentStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {row.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={!row.billingId} onClick={() => row.billingId && navigate(`/doctor/billing/view/${row.billingId}`)} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40">
                        View
                      </button>
                      <button type="button" onClick={() => navigate(`/doctor/billing/create/${row.appointmentId}`)} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                        Bill
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-4 py-16 text-center text-slate-500">No billing records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
