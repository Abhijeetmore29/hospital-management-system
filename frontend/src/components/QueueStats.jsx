export function QueueStats({ stats }) {
  const items = [
    ['Waiting', stats.waiting, 'amber'],
    ['Screened', stats.screened, 'orange'],
    ['Completed', stats.completed, 'green'],
    ['Total', stats.total, 'blue']
  ];
  const tone = { amber: 'text-amber-700 bg-amber-50', orange: 'text-orange-700 bg-orange-50', green: 'text-emerald-700 bg-emerald-50', blue: 'text-blue-700 bg-blue-50' };
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([label, value, key]) => (
        <span key={label} className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[key]}`}>
          {label}: {value}
        </span>
      ))}
    </div>
  );
}
