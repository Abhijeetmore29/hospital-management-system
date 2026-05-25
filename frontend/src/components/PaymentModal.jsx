export function PaymentModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Save Payment</h2>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">X</button>
        </div>
        <div className="grid gap-4">
          {['Patient Name', 'Bill Amount', 'Transaction ID'].map((label) => <input key={label} className="w-full rounded-2xl border px-4 py-3" placeholder={label} />)}
          <select className="w-full rounded-2xl border px-4 py-3"><option>Payment Method</option><option>Cash</option><option>UPI</option><option>Card</option><option>Insurance</option></select>
          <textarea className="min-h-28 w-full rounded-2xl border px-4 py-3" placeholder="Notes" />
          <div className="flex gap-3">
            <button className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white">Save Payment</button>
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
