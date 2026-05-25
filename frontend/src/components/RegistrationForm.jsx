export function RegistrationForm({ form, setForm, doctors, onSubmit, onReset }) {
  const doctorList = Array.isArray(doctors) ? doctors : [];
  const Field = ({ label, ...props }) => <label className="grid gap-2"><span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</span><input {...props} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]" /></label>;
  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Field label="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
        <label className="grid gap-2"><span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Gender</span><select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><option>Male</option><option>Female</option><option>Other</option></select></label>
        <Field label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Field label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Field label="Blood Group" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
        <Field label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <Field label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
        <label className="grid gap-2"><span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Doctor</span><select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><option value="">Select</option>{doctorList.map((d) => <option key={String(d?._id || d?.name)} value={d?._id}>{d?.name}</option>)}</select></label>
        <Field label="Appointment Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
        <Field label="Symptoms" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
        <Field label="Admission Type" value={form.admissionType} onChange={(e) => setForm({ ...form, admissionType: e.target.value })} />
        <Field label="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
        <Field label="ID Upload" value={form.idUpload} onChange={(e) => setForm({ ...form, idUpload: e.target.value })} />
        <Field label="Reports Upload" value={form.reportUpload} onChange={(e) => setForm({ ...form, reportUpload: e.target.value })} />
      </div>
      <div className="flex gap-3">
        <button className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white">Register Patient</button>
        <button type="button" onClick={onReset} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-600">Reset</button>
      </div>
    </form>
  );
}
