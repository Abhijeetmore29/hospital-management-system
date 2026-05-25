import StaffHeader from '../../components/StaffHeader';

const cards = ['Pending', 'In Progress', 'Completed', 'Reports'];

const LaboratoryPage = ({ compact = false } = {}) => {
  return (
    <div className="p-5 space-y-5">
      {compact ? <StaffHeader title="Laboratory" subtitle="Manage laboratory requests and reports" /> : <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Hospital Module</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-800">Laboratory</h1>
          <p className="mt-1 text-slate-500">Manage laboratory requests and reports</p>
        </div>
        <button className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-white">+ Add Test</button>
      </div>}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        {cards.map((item) => (
          <div key={item} className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-slate-500">{item}</p>
            <h2 className="mt-3 text-4xl font-bold text-slate-800">0</h2>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <h2 className="font-semibold text-slate-800">Laboratory Requests</h2>
          <input placeholder="Search patient..." className="rounded-2xl border px-4 py-2 outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-left">Patient</th>
                <th className="p-4 text-left">Doctor</th>
                <th className="p-4 text-left">Test</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-4">Amit Sharma</td>
                <td className="p-4">Dr. Priya</td>
                <td className="p-4">Blood Test</td>
                <td className="p-4"><span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">Pending</span></td>
                <td className="p-4"><button className="rounded-xl bg-cyan-500 px-4 py-2 text-white">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LaboratoryPage;
