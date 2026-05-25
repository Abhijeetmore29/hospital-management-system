import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Link } from 'react-router-dom';
import { AppointmentModal } from '../components/AppointmentModal';

const stats = [
  ['25+', 'Years of Service'],
  ['50K+', 'Patients Treated'],
  ['120+', 'Specialist Doctors'],
  ['24/7', 'Emergency Care']
];

const specs = ['Obstetrics', 'Pediatrics', 'General Medicine', 'Urology', 'Orthopedics', 'Sonography', 'Pathology & Lab', 'ICU'];
const why = ['Advanced diagnostics', 'Experienced doctors', 'Cashless support', 'Patient-first care'];
const doctors = [
  ['Dr. Sarah Khan', 'Cardiology', '12 years', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80'],
  ['Dr. Arjun Mehta', 'Orthopedics', '10 years', 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=400&q=80'],
  ['Dr. Neha Verma', 'Pediatrics', '8 years', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80']
];

export function LandingPage() {
  const [openAppointment, setOpenAppointment] = useState(false);

  return (
    <div className="bg-slate-50 text-slate-800">
      <Navbar onBookAppointment={() => setOpenAppointment(true)} />
      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-2 lg:px-8">
          <div className="flex flex-col justify-center gap-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Meditrack</p>
            <h1 className="max-w-xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl">Trusted Care, Treatment with Excellence</h1>
            <p className="max-w-xl text-lg text-slate-600">Modern medical care with specialists, diagnostics, and emergency support in one connected hospital experience.</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setOpenAppointment(true)} className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm">Book Appointment</button>
              <Link to="/login" className="rounded-full border border-blue-200 px-6 py-3 font-semibold text-blue-700">Staff Login</Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-blue-100">
            <img
              className="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
              alt="Hospital"
            />
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 pb-14 md:grid-cols-4 lg:px-8">
          {stats.map(([v, l]) => <div key={l} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-blue-100"><div className="text-3xl font-bold text-blue-600">{v}</div><div className="mt-1 text-sm text-slate-600">{l}</div></div>)}
        </section>
        {openAppointment && <AppointmentModal onClose={() => setOpenAppointment(false)} />}
        <section id="specialities" className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-slate-900">Specialities</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {specs.map((s) => <div key={s} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-blue-100">{s}</div>)}
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-2 lg:px-8">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-blue-100">
            <h2 className="text-3xl font-bold text-slate-900">Why Choose Us</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">{why.map((w) => <div key={w} className="rounded-2xl bg-blue-50 p-4 font-medium text-slate-700">{w}</div>)}</div>
          </div>
          <div id="doctors" className="grid gap-4">
            {doctors.map(([n, sp, ex, img]) => <div key={n} className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-blue-100"><img className="h-20 w-20 rounded-2xl object-cover" src={img} alt={n} /><div><div className="font-semibold text-slate-900">{n}</div><div className="text-sm text-blue-600">{sp}</div><div className="text-sm text-slate-500">{ex}</div></div></div>)}
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {['Patient care is excellent.', 'Staff is responsive and kind.', 'Clean, modern and reliable.'].map((t) => <div key={t} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-blue-100">{t}</div>)}
          </div>
        </section>
        <section id="contact" className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-2 lg:px-8">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-blue-100">
            <h2 className="text-3xl font-bold text-slate-900">Contact</h2>
            <p className="mt-3 text-slate-600">24/7 emergency support, appointment desk, and specialist consultation.</p>
          </div>
          <div className="rounded-[2rem] bg-blue-600 p-8 text-white shadow-sm">
            <div className="text-sm uppercase tracking-[0.25em] text-blue-100">Meditrack</div>
            <div className="mt-4 text-sm text-blue-50">Meditrack</div>
          </div>
        </section>
        <footer className="border-t border-blue-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-slate-500 lg:px-8">© 2026 Meditrack</div>
        </footer>
      </main>
    </div>
  );
}
