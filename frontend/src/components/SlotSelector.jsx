const SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00'];

export function SlotSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {SLOTS.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => onChange(slot)}
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${value === slot ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700'}`}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}
