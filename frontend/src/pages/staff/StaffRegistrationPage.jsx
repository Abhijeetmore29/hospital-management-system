import StaffHeader from '../../components/StaffHeader';

const StaffRegistrationPage = () => {
  return (
    <div className="space-y-5">
      <StaffHeader title="Registration" subtitle="Patient intake and token generation" />
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {['Patient Name', 'Phone', 'Doctor', 'Department', 'Purpose', 'Fee'].map((item) => (
            <input key={item} placeholder={item} className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none" />
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white">Save & Token</button>
        </div>
      </div>
    </div>
  );
};

export { StaffRegistrationPage };
