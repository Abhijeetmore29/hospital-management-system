export function BillingTable({ bills = [] }) {
  const tone = {
    Paid: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Overdue: 'bg-red-100 text-red-700'
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="sticky top-0 bg-slate-50 text-slate-500">
            <tr>
              {['Bill ID', 'Patient', 'Doctor', 'Amount', 'Payment Mode', 'Status', 'Date', 'Actions'].map((h) => <th key={h} className="px-4 py-4 text-left font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {bills.length ? bills.map((bill) => (
              <tr key={bill._id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-4 font-medium text-slate-900">{bill._id}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">{bill.patient.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div className="font-medium text-slate-900">{bill.patient}</div>
                      <div className="text-xs text-slate-500">{bill.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-600">{bill.doctor}</td>
                <td className="px-4 py-4 text-slate-600">Rs. {bill.amount}</td>
                <td className="px-4 py-4 text-slate-600">{bill.mode}</td>
                <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[bill.status]}`}>{bill.status}</span></td>
                <td className="px-4 py-4 text-slate-600">{bill.date}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {['View', 'Print', 'Download', 'Mark Paid'].map((x) => <button key={x} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">{x}</button>)}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="px-4 py-16 text-center text-slate-500">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-xl">₹</div>
                  No billing records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
