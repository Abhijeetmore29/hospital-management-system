export function BillingSummaryCard({ label, value, tone = 'blue' }) {
  const ring = tone === 'green' ? 'ring-emerald-100' : tone === 'amber' ? 'ring-amber-100' : tone === 'red' ? 'ring-red-100' : 'ring-blue-100';
  const text = tone === 'green' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-600' : tone === 'red' ? 'text-red-600' : 'text-blue-600';

  return (
    <article className={`rounded-3xl bg-white p-5 shadow-sm ring-1 ${ring}`}>
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-2 text-2xl font-bold ${text}`}>{value}</div>
    </article>
  );
}
