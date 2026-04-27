import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';

const emptyPayment = {
  patientId: '',
  doctorId: '',
  billingType: 'OPD',
  roomType: 'AC',
  amount: '',
  paymentMethod: 'Cash',
  transactionId: '',
  notes: ''
};

function resolveAutoAmount(pricingMap, doctorId, billingType, roomType) {
  const pricing = pricingMap[doctorId];
  if (!pricing) {
    return '';
  }

  if (billingType === 'OPD') {
    return pricing.opdFee ?? pricing.consultationFee ?? '';
  }

  if (billingType === 'IPD' && roomType === 'AC') {
    return pricing.ipdAcFee ?? '';
  }

  if (billingType === 'IPD' && roomType === 'Non-AC') {
    return pricing.ipdNonAcFee ?? '';
  }

  return '';
}

function getSelectedPricing(pricingMap, doctorId) {
  return pricingMap[doctorId] || null;
}

export function StaffPayments() {
  const [payments, setPayments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctorBundle, setDoctorBundle] = useState({ pricing: [], doctors: [] });
  const [form, setForm] = useState(emptyPayment);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.payments(), api.patients(), api.pricingAll()])
      .then(([paymentData, patientData, doctorData]) => {
        setPayments(paymentData);
        setPatients(patientData);
        setDoctorBundle(doctorData);
      })
      .catch(() => {
        setPayments([]);
        setPatients([]);
        setDoctorBundle({ pricing: [], doctors: [] });
      });
  }, []);

  const pricingMap = useMemo(() => {
    return Object.fromEntries(doctorBundle.pricing.map((item) => [item.doctor?._id, item]));
  }, [doctorBundle]);
  const selectedPricing = getSelectedPricing(pricingMap, form.doctorId);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === 'doctorId' || name === 'billingType' || name === 'roomType') {
        next.amount = resolveAutoAmount(
          pricingMap,
          name === 'doctorId' ? value : current.doctorId,
          name === 'billingType' ? value : current.billingType,
          name === 'roomType' ? value : current.roomType
        );
      }
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const payment = await api.createPayment({
        patientId: form.patientId,
        doctorId: form.doctorId,
        billingType: form.billingType,
        roomType: form.billingType === 'IPD' ? form.roomType : undefined,
        amount: form.amount === '' ? undefined : Number(form.amount),
        paymentMethod: form.paymentMethod,
        transactionId: form.transactionId,
        notes: form.notes
      });

      setPayments((current) => [payment, ...current]);
      setMessage('Payment saved successfully.');
      setForm(emptyPayment);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack">
      <PageHeader
        title="Payments"
        subtitle="Collect OPD and IPD payments using doctor-defined prices."
      />

      <section className="panel">
        <div className="panel-head">
          <h3>Collect Payment</h3>
        </div>
        {selectedPricing?.upiId ? (
          <div className="upi-banner">
            <div>
              <strong>UPI Payment Details</strong>
              <p>
                Pay to {selectedPricing.upiPayeeName || selectedPricing.doctor?.name || 'Doctor'} at {selectedPricing.upiId}
              </p>
              <p className="muted">Ask the patient to complete the UPI payment before saving the transaction.</p>
            </div>
            <div className="upi-chip">UPI</div>
          </div>
        ) : null}
        {form.paymentMethod === 'UPI' && !selectedPricing?.upiId ? (
          <p className="form-message error">
            This doctor has not configured a UPI ID yet. Please ask the doctor to add it in Pricing & Transactions.
          </p>
        ) : null}
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Patient</span>
            <select name="patientId" value={form.patientId} onChange={updateField} required>
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} - {patient.disease}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Doctor</span>
            <select name="doctorId" value={form.doctorId} onChange={updateField} required>
              <option value="">Select doctor</option>
              {doctorBundle.doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Billing Type</span>
            <select name="billingType" value={form.billingType} onChange={updateField}>
              <option value="OPD">OPD</option>
              <option value="IPD">IPD</option>
            </select>
          </label>
          {form.billingType === 'IPD' ? (
            <label>
              <span>Room Type</span>
              <select name="roomType" value={form.roomType} onChange={updateField}>
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
              </select>
            </label>
          ) : null}
          <label>
            <span>Amount</span>
            <input name="amount" type="number" min="0" value={form.amount} onChange={updateField} required />
          </label>
          <label>
            <span>Payment Method</span>
            <select name="paymentMethod" value={form.paymentMethod} onChange={updateField}>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </label>
          <label>
            <span>Transaction ID</span>
            <input name="transactionId" value={form.transactionId} onChange={updateField} />
          </label>
          <label className="full-span">
            <span>Notes</span>
            <textarea name="notes" rows="3" value={form.notes} onChange={updateField} />
          </label>
          <div className="full-span actions-row">
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
          {message ? <p className="form-message full-span">{message}</p> : null}
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Recent Payments</h3>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Type</th>
                <th>Room</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.patient?.name}</td>
                    <td>{payment.doctor?.name}</td>
                    <td>{payment.billingType}</td>
                    <td>{payment.roomType || '-'}</td>
                    <td>Rs. {payment.amount}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>{payment.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
