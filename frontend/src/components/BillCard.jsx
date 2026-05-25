export function BillCard({ label, value, tone = 'blue' }) {
  const ring = tone === 'green' ? 'ring-emerald-100' : tone === 'yellow' ? 'ring-amber-100' : tone === 'cyan' ? 'ring-cyan-100' : 'ring-blue-100';
  const text = tone === 'green' ? 'text-emerald-600' : tone === 'yellow' ? 'text-amber-600' : tone === 'cyan' ? 'text-cyan-600' : 'text-blue-600';
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ${ring}`}>
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${text}`}>{value}</div>
    </div>
  );
}
