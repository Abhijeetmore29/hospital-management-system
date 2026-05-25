import { QueueRow } from './QueueRow';

export function QueueTable({ items, ...handlers }) {
  return (
    <div className="overflow-auto rounded-3xl border border-slate-200 bg-white">
      <table className="min-w-[1000px] w-full text-sm">
        <thead className="sticky top-0 bg-slate-50 text-slate-500">
          <tr>
            {['#', 'Patient', 'Doctor', 'Wait Time', 'Screened', 'Status', 'Fee', 'Actions'].map((h) => <th key={h} className="px-3 py-3 text-left font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.length ? items.map((item, i) => <QueueRow key={item?._id || i} item={item} index={i} {...handlers} />) : <tr><td colSpan="8" className="px-3 py-16 text-center text-slate-500">No patients in queue</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
