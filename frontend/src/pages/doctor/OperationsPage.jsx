import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffHeader from '../../components/StaffHeader';
import { api } from '../../services/api';

const OperationsPage = ({ compact = false } = {}) => {
  const navigate = useNavigate();
  const [operations, setOperations] = useState([]);
  const [search, setSearch] = useState('');
  const [surgeon, setSurgeon] = useState('');
  const [operationType, setOperationType] = useState('');

  const load = () => {
    api.operations()
      .then((data) => setOperations(Array.isArray(data) ? data : []))
      .catch(() => setOperations([]));
  };

  useEffect(() => {
    load();
  }, []);

  const surgeons = useMemo(
    () =>
      [...new Map(operations.map((op) => [op?.doctor?._id || op?.doctor?.name, op?.doctor?.name])).entries()].filter(
        ([value]) => Boolean(value)
      ),
    [operations]
  );

  const filtered = useMemo(
    () =>
      operations.filter((operation) => {
        const text = [operation?.patient?.name, operation?.doctor?.name, operation?.operationName, operation?._id].join(' ').toLowerCase();
        return (
          text.includes(search.toLowerCase()) &&
          (!surgeon || operation?.doctor?._id === surgeon || operation?.doctor?.name === surgeon) &&
          (!operationType || operation?.operationType === operationType)
        );
      }),
    [operations, search, surgeon, operationType]
  );

  const stats = {
    total: operations.length,
    today: operations.filter((op) => new Date(op?.scheduledDate).toDateString() === new Date().toDateString()).length,
    emergency: operations.filter((op) => op?.operationType === 'Emergency').length,
    rooms: new Set(operations.map((op) => op?.theatreRoom).filter(Boolean)).size
  };

  return (
    <div className="p-5 space-y-5">
      {compact ? (
        <StaffHeader title="Operations" subtitle="Manage surgical schedules and OT flow" />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Hospital Module</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-800">Operations</h1>
            <p className="mt-1 text-slate-500">Manage surgical schedules and OT flow</p>
          </div>
          <button type="button" onClick={() => navigate('/doctor/operations/create')} className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white">+ Schedule Operation</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        {[
          ['Total Operations', String(stats.total)],
          ["Today's Surgeries", String(stats.today).padStart(2, '0')],
          ['Emergency Cases', String(stats.emergency).padStart(2, '0')],
          ['Operation Rooms', String(stats.rooms).padStart(2, '0')]
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-slate-500">{label}</p>
            <h2 className="mt-3 text-4xl font-bold text-slate-800">{value}</h2>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div className="flex flex-wrap gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient..." className="rounded-2xl border px-4 py-2 outline-none" />
            <select value={surgeon} onChange={(e) => setSurgeon(e.target.value)} className="rounded-2xl border px-4 py-2 outline-none">
              <option value="">Surgeon</option>
              {surgeons.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select value={operationType} onChange={(e) => setOperationType(e.target.value)} className="rounded-2xl border px-4 py-2 outline-none">
              <option value="">Operation Type</option>
              {['Minor', 'Major', 'Emergency'].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <button onClick={load} className="rounded-2xl border px-4 py-2">Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Operation ID', 'Patient', 'Surgeon', 'Operation Type', 'Room', 'Date & Time', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="p-4 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((operation) => {
                  const dt = new Date(operation?.operationDate || operation?.scheduledDate || operation?.createdAt);
                  const statusTone =
                    operation.status === 'Scheduled'
                      ? 'bg-yellow-100 text-yellow-700'
                      : operation.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-700'
                        : operation.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700';

                  return (
                    <tr key={operation._id} className="border-t">
                      <td className="p-4">{String(operation._id).slice(-6)}</td>
                      <td className="p-4">{operation.patient?.name || '-'}</td>
                      <td className="p-4">{operation.doctor?.name || '-'}</td>
                      <td className="p-4">{operation.operationName || '-'}</td>
                      <td className="p-4">{operation.theatreRoom || '-'}</td>
                      <td className="p-4">{Number.isNaN(dt.getTime()) ? '-' : dt.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}>{operation.status || 'Scheduled'}</span>
                      </td>
                      <td className="p-4">
                        <button type="button" onClick={() => navigate(`/operations/${operation._id}/print`)} className="rounded-xl bg-cyan-500 px-4 py-2 text-white">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No operation records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OperationsPage;
