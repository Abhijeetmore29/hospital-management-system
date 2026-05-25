import { useEffect, useState } from 'react';
import { api } from '../../services/api';

const PERMS = ['Dashboard', 'Appointments', 'Registration', 'OPD Queue', 'IPD', 'Laboratory', 'Pharmacy', 'Billing', 'Patients', 'Operations'];
const roles = ['Receptionist', 'Nurse', 'Laboratory', 'Billing', 'Pharmacy', 'Staff'];

const empty = { name: '', email: '', phone: '', staffRole: 'Staff', password: '', confirmPassword: '', permissions: [], isActive: true };
const paymentEmpty = { doctor: '', upiId: '', upiPayeeName: '', bankName: '', accountHolderName: '', accountNumber: '', ifscCode: '', qrCodeUrl: '', opdFee: '', ipdAcFee: '', ipdNonAcFee: '' };

const toggle = (list, item) => list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

export default function DoctorAdminPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [password, setPassword] = useState({ id: '', password: '', confirmPassword: '' });
  const [selectedId, setSelectedId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [payment, setPayment] = useState(paymentEmpty);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.adminStaff();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      setError(e?.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    api.doctors()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setDoctors(list);
        if (!payment.doctor && list[0]?._id) {
          setPayment((current) => ({ ...current, doctor: list[0]._id }));
        }
      })
      .catch(() => setDoctors([]));
  }, []);
  useEffect(() => {
    if (!payment.doctor) return;
    api.paymentSettings(payment.doctor)
      .then((data) => {
        if (!data) {
          setPayment((current) => ({ ...current, ...paymentEmpty, doctor: current.doctor }));
          return;
        }
        setPayment({
          doctor: data.doctor?._id || data.doctor || '',
          upiId: data.upiId || '',
          upiPayeeName: data.upiPayeeName || '',
          bankName: data.bankName || '',
          accountHolderName: data.accountHolderName || '',
          accountNumber: data.accountNumber || '',
          ifscCode: data.ifscCode || '',
          qrCodeUrl: data.qrCodeUrl || '',
          opdFee: data.opdFee ?? '',
          ipdAcFee: data.ipdAcFee ?? '',
          ipdNonAcFee: data.ipdNonAcFee ?? ''
        });
      })
      .catch(() => {});
  }, [payment.doctor]);

  const selected = rows.find((r) => r._id === selectedId) || null;
  const savePayment = async (e) => {
    e.preventDefault();
    setPaymentSaving(true);
    setPaymentMessage('');
    try {
      await api.savePaymentSettings({
        ...payment,
        opdFee: payment.opdFee === '' ? 0 : Number(payment.opdFee),
        ipdAcFee: payment.ipdAcFee === '' ? 0 : Number(payment.ipdAcFee),
        ipdNonAcFee: payment.ipdNonAcFee === '' ? 0 : Number(payment.ipdNonAcFee)
      });
      setPaymentMessage('Payment settings saved.');
    } catch (e) {
      setPaymentMessage(e?.message || 'Failed to save payment settings');
    } finally {
      setPaymentSaving(false);
    }
  };
  const uploadQr = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPayment((current) => ({ ...current, qrCodeUrl: String(reader.result || '') }));
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, permissions: Array.isArray(form.permissions) ? form.permissions : [] };
    try {
      if (form._id) {
        await api.updateAdminStaff(form._id, payload);
      } else {
        await api.createAdminStaff(payload);
      }
      setForm(empty);
      await load();
    } catch (e) {
      setError(e?.message || 'Failed to save staff');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-600">Hospital Module</div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Admin Access</h1>
        <p className="mt-2 text-sm text-slate-500">Staff management and access control</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Create Staff</h3>
          <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2">
            <input className="w-full rounded-2xl border px-4 py-3" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="w-full rounded-2xl border px-4 py-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="w-full rounded-2xl border px-4 py-3" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <select className="w-full rounded-2xl border px-4 py-3" value={form.staffRole} onChange={(e) => setForm({ ...form, staffRole: e.target.value })}>
              {roles.map((r) => <option key={r}>{r}</option>)}
            </select>
            {!form._id && <input className="w-full rounded-2xl border px-4 py-3" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
            {!form._id && <input className="w-full rounded-2xl border px-4 py-3" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />}
            <div className="md:col-span-2">
              <div className="mb-3 text-sm font-semibold text-slate-700">Permissions</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {PERMS.map((p) => <button key={p} type="button" onClick={() => setForm({ ...form, permissions: toggle(Array.isArray(form.permissions) ? form.permissions : [], p) })} className={`rounded-2xl border px-4 py-3 text-left text-sm ${(Array.isArray(form.permissions) ? form.permissions : []).includes(p) ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}>{p}</button>)}
              </div>
            </div>
            <div className="flex gap-3 md:col-span-2">
              <button className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white">{form._id ? 'Update Staff' : 'Create Staff'}</button>
              <button type="button" onClick={() => setForm(empty)} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">Cancel</button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Password Management</h3>
          <div className="mt-4 grid gap-3">
            <select className="w-full rounded-2xl border px-4 py-3" value={password.id} onChange={(e) => setPassword({ ...password, id: e.target.value })}>
              <option value="">Select staff</option>
              {(Array.isArray(rows) ? rows : []).map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
            <input className="w-full rounded-2xl border px-4 py-3" type="password" placeholder="New Password" value={password.password} onChange={(e) => setPassword({ ...password, password: e.target.value })} />
            <input className="w-full rounded-2xl border px-4 py-3" type="password" placeholder="Confirm Password" value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} />
            <button
              className="rounded-full bg-slate-900 px-5 py-3 font-semibold text-white"
              onClick={async () => { await api.resetAdminStaffPassword(password.id, password); setPassword({ id: '', password: '', confirmPassword: '' }); load(); }}
              type="button"
            >
              Reset Password
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Billing Payment Settings</h3>
        <form onSubmit={savePayment} className="mt-4 grid gap-4 md:grid-cols-2">
          <select className="w-full rounded-2xl border px-4 py-3" value={payment.doctor} onChange={(e) => setPayment({ ...payment, doctor: e.target.value })}>
            <option value="">Select doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>{doctor.name}</option>
            ))}
          </select>
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="UPI ID" value={payment.upiId} onChange={(e) => setPayment({ ...payment, upiId: e.target.value })} />
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="Payee Name" value={payment.upiPayeeName} onChange={(e) => setPayment({ ...payment, upiPayeeName: e.target.value })} />
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="Bank Name" value={payment.bankName} onChange={(e) => setPayment({ ...payment, bankName: e.target.value })} />
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="Account Holder Name" value={payment.accountHolderName} onChange={(e) => setPayment({ ...payment, accountHolderName: e.target.value })} />
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="Account Number" value={payment.accountNumber} onChange={(e) => setPayment({ ...payment, accountNumber: e.target.value })} />
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="IFSC Code" value={payment.ifscCode} onChange={(e) => setPayment({ ...payment, ifscCode: e.target.value })} />
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">QR Code Image</span>
            <input type="file" accept="image/*" className="w-full rounded-2xl border px-4 py-3" onChange={(e) => uploadQr(e.target.files?.[0])} />
          </label>
          <input className="w-full rounded-2xl border px-4 py-3" type="number" min="0" placeholder="OPD Fee" value={payment.opdFee} onChange={(e) => setPayment({ ...payment, opdFee: e.target.value })} />
          <input className="w-full rounded-2xl border px-4 py-3" type="number" min="0" placeholder="IPD AC Fee" value={payment.ipdAcFee} onChange={(e) => setPayment({ ...payment, ipdAcFee: e.target.value })} />
          <input className="w-full rounded-2xl border px-4 py-3" type="number" min="0" placeholder="IPD Non-AC Fee" value={payment.ipdNonAcFee} onChange={(e) => setPayment({ ...payment, ipdNonAcFee: e.target.value })} />
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button type="submit" disabled={paymentSaving} className="rounded-full bg-cyan-600 px-5 py-3 font-semibold text-white disabled:opacity-60">
              {paymentSaving ? 'Saving...' : 'Save Payment Settings'}
            </button>
            <button type="button" onClick={() => setPayment(paymentEmpty)} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
              Reset
            </button>
          </div>
          {paymentMessage ? <p className="md:col-span-2 text-sm text-slate-600">{paymentMessage}</p> : null}
        </form>
        {payment.qrCodeUrl ? <img src={payment.qrCodeUrl} alt="QR preview" className="mt-4 h-28 w-28 rounded-2xl border object-contain" /> : null}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Staff Table</h3>
          <button onClick={load} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {['Name', 'Email', 'Phone', 'Role', 'Status', 'Created Date', 'Actions'].map((h) => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.name}</td>
                  <td className="px-4 py-3 text-slate-600">{r.email}</td>
                  <td className="px-4 py-3 text-slate-600">{r.phone || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{r.staffRole}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.isActive ? 'Active' : 'Disabled'}</span></td>
                  <td className="px-4 py-3 text-slate-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => { setForm({ ...r, password: '', confirmPassword: '' }); setSelectedId(r._id); }} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold">Edit</button>
                      <button onClick={() => setSelectedId(r._id)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold">Permissions</button>
                      <button onClick={async () => { await api.updateAdminStaff(r._id, { isActive: !r.isActive }); load(); }} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold">Disable</button>
                      <button onClick={async () => { await api.deleteAdminStaff(r._id); load(); }} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Staff Access Control</h3>
          <button
            onClick={async () => { if (selected) { await api.updateAdminStaffPermissions(selected._id, { permissions: Array.isArray(selected.permissions) ? selected.permissions : [] }); await load(); } }}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Save Permissions
          </button>
        </div>
        {selected ? (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {PERMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  const permissions = toggle(Array.isArray(selected.permissions) ? selected.permissions : [], p);
                  setRows((current) => current.map((r) => (r._id === selected._id ? { ...r, permissions } : r)));
                }}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm ${(Array.isArray(selected?.permissions) ? selected.permissions : []).includes(p) ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}
              >
                {p}
                <span className={`h-5 w-10 rounded-full p-1 ${(Array.isArray(selected?.permissions) ? selected.permissions : []).includes(p) ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <span className={`block h-3 w-3 rounded-full bg-white transition ${(Array.isArray(selected?.permissions) ? selected.permissions : []).includes(p) ? 'translate-x-5' : ''}`} />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500">Select a staff member to manage access.</div>
        )}
      </section>
    </div>
  );
}
