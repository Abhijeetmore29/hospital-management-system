import StaffHeader from '../../components/StaffHeader';

const StaffOPDQueuePage = () => {
  return (
    <div className="space-y-5">
      <StaffHeader title="OPD Queue" subtitle="Manage waiting patients" />
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr><th className="p-4 text-left">Patient</th><th className="p-4 text-left">Doctor</th><th className="p-4 text-left">Status</th></tr>
            </thead>
            <tbody><tr className="border-t"><td className="p-4">No patients checked in yet today</td><td className="p-4">-</td><td className="p-4">-</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export { StaffOPDQueuePage };
