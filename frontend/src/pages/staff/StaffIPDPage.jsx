import StaffHeader from '../../components/StaffHeader';

const StaffIPDPage = () => {
  return (
    <div className="space-y-5">
      <StaffHeader title="IPD" subtitle="In patient admissions overview" />
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <div className="text-4xl">◌</div>
        <div className="mt-3 text-slate-500">No IPD admissions yet</div>
      </div>
    </div>
  );
};

export { StaffIPDPage };
