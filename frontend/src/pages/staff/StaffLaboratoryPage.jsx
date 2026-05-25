import StaffHeader from '../../components/StaffHeader';

const StaffLaboratoryPage = () => {
  return (
    <div className="space-y-5">
      <StaffHeader title="Laboratory" subtitle="Manage laboratory requests and reports" />
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <div className="text-4xl">🧪</div>
        <div className="mt-3 text-slate-500">No laboratory requests found</div>
      </div>
    </div>
  );
};

export { StaffLaboratoryPage };
