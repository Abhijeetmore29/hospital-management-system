export function QueueRow({ item, index, onConsult, onReassign, onDelete, onRefresh }) {
  const initials = (item?.name || 'P').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
  const wait = item?.waitTime || '12m';
  const screened = item?.screened ? 'Screened' : 'Pending';
  return (
    <tr className="border-t odd:bg-slate-50/60 hover:bg-slate-50">
      <td className="px-3 py-3 text-slate-500">{index + 1}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">{initials}</div>
          <div>
            <div className="font-medium text-slate-900">{item?.name}</div>
            <div className="text-xs text-slate-500">{item?.phone || '-'}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-slate-600">{item?.assignedDoctor?.name || '-'}</td>
      <td className="px-3 py-3"><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">{wait}</span></td>
      <td className="px-3 py-3"><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">{screened}</span></td>
      <td className="px-3 py-3"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">ACTIVE</span></td>
      <td className="px-3 py-3"><span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">Rs. {item?.fee || '0'}</span></td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onConsult(item)} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Consult</button>
          <button onClick={() => onReassign(item)} className="rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white">Reassign</button>
          <button onClick={() => onDelete(item)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs">Del</button>
          <button onClick={() => onRefresh()} className="rounded-xl bg-slate-100 px-3 py-2 text-xs">Refresh</button>
        </div>
      </td>
    </tr>
  );
}
