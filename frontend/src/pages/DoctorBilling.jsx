import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';

const initialPricing = {
  opdFee: '',
  ipdAcFee: '',
  ipdNonAcFee: '',
  consultationFee: '',
  upiId: '',
  upiPayeeName: ''
};

export function DoctorBilling() {
  const [pricing, setPricing] = useState(initialPricing);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([
      api.pricingMine(),
      api.payments(),
      api.paymentSummary()
    ])
      .then(([pricingData, paymentData, summaryData]) => {
        setPricing({
          opdFee: pricingData.opdFee ?? '',
          ipdAcFee: pricingData.ipdAcFee ?? '',
          ipdNonAcFee: pricingData.ipdNonAcFee ?? '',
          consultationFee: pricingData.consultationFee ?? '',
          upiId: pricingData.upiId ?? '',
          upiPayeeName: pricingData.upiPayeeName ?? ''
        });
        setTransactions(paymentData);
        setSummary(summaryData);
      })
      .catch(() => {
        setTransactions([]);
        setSummary(null);
      });
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setPricing((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const saved = await api.savePricingMine({
        opdFee: Number(pricing.opdFee || 0),
        ipdAcFee: Number(pricing.ipdAcFee || 0),
        ipdNonAcFee: Number(pricing.ipdNonAcFee || 0),
        consultationFee: Number(pricing.consultationFee || 0),
        upiId: pricing.upiId || '',
        upiPayeeName: pricing.upiPayeeName || ''
      });

      setPricing({
        opdFee: saved.opdFee ?? '',
        ipdAcFee: saved.ipdAcFee ?? '',
        ipdNonAcFee: saved.ipdNonAcFee ?? '',
        consultationFee: saved.consultationFee ?? '',
        upiId: saved.upiId ?? '',
        upiPayeeName: saved.upiPayeeName ?? ''
      });
      setMessage('Pricing saved successfully.');

      const [paymentData, summaryData] = await Promise.all([api.payments(), api.paymentSummary()]);
      setTransactions(paymentData);
      setSummary(summaryData);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack">
      <PageHeader
        title="Pricing & Transactions"
        subtitle="Set billing prices for OPD, IPD AC, and IPD Non-AC, then review collected transactions."
      />
      <div className="stats-grid">
        <StatCard label="Transactions" value={summary?.count ?? 0} />
        <StatCard label="Total Revenue" value={`Rs. ${summary?.totalAmount ?? 0}`} tone="teal" />
        <StatCard label="OPD Bills" value={summary?.opdCount ?? 0} tone="green" />
        <StatCard label="IPD Bills" value={summary?.ipdCount ?? 0} tone="amber" />
      </div>

      <section className="panel">
        <div className="panel-head">
          <h3>Doctor Pricing Setup</h3>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            <span>OPD Fee</span>
            <input name="opdFee" type="number" min="0" value={pricing.opdFee} onChange={updateField} />
          </label>
          <label>
            <span>Consultation Fee</span>
            <input name="consultationFee" type="number" min="0" value={pricing.consultationFee} onChange={updateField} />
          </label>
          <label>
            <span>IPD AC Fee</span>
            <input name="ipdAcFee" type="number" min="0" value={pricing.ipdAcFee} onChange={updateField} />
          </label>
          <label>
            <span>IPD Non-AC Fee</span>
            <input name="ipdNonAcFee" type="number" min="0" value={pricing.ipdNonAcFee} onChange={updateField} />
          </label>
          <label>
            <span>UPI ID</span>
            <input name="upiId" value={pricing.upiId} onChange={updateField} placeholder="doctor@upi" />
          </label>
          <label>
            <span>UPI Payee Name</span>
            <input name="upiPayeeName" value={pricing.upiPayeeName} onChange={updateField} placeholder="Dr. Name" />
          </label>
          <div className="full-span actions-row">
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Pricing'}
            </button>
          </div>
          {message ? <p className="form-message full-span">{message}</p> : null}
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Transaction History</h3>
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
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.patient?.name}</td>
                    <td>{payment.doctor?.name}</td>
                    <td>{payment.billingType}</td>
                    <td>{payment.roomType || '-'}</td>
                    <td>Rs. {payment.amount}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>{new Date(payment.createdAt).toLocaleString()}</td>
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
