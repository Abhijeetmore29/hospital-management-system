export function StatCard({ label, value, tone = 'blue' }) {
  const ring = tone === 'cyan' ? 'ring-cyan-100' : tone === 'green' ? 'ring-emerald-100' : tone === 'amber' ? 'ring-amber-100' : tone === 'red' ? 'ring-red-100' : tone === 'emerald' ? 'ring-emerald-100' : 'ring-blue-100';
  const text = tone === 'cyan' ? 'text-cyan-600' : tone === 'green' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-600' : tone === 'red' ? 'text-red-600' : tone === 'emerald' ? 'text-emerald-600' : 'text-blue-600';
  return (
    <article className={`rounded-3xl bg-white p-5 shadow-sm ring-1 ${ring}`}>
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${text}`}>{value}</div>
    </article>
  );
}
