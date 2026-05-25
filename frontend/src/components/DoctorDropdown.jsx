export function DoctorDropdown({ doctors = [], value, onChange }) {
  return (
    <select value={value} onChange={onChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none">
      <option value="">Select Doctor</option>
      {doctors.map((doctor) => (
        <option key={doctor._id} value={doctor._id}>
          Dr. {doctor.name}
        </option>
      ))}
    </select>
  );
}
