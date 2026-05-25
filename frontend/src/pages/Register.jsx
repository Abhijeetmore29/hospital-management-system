import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'staff' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.register(form);
      if (form.role === 'doctor') window.dispatchEvent(new Event('doctor:list:updated'));
      setSuccess('Account created successfully. Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1400&q=80"
          alt="Hospital"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-lg font-bold backdrop-blur">H</div>
            <div>
              <div className="font-semibold">HospitalCare</div>
              <div className="text-sm text-white/70">Modern Medical System</div>
            </div>
          </div>
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">Trusted Care</p>
            <h1 className="text-5xl font-bold leading-tight">Trusted Care, Treatment with Excellence</h1>
            <p className="mt-4 max-w-lg text-white/80">Secure access for doctors, staff, and hospital operations in one modern workflow.</p>
          </div>
        </div>
      </section>

      <main className="flex items-center justify-center px-4 py-10 lg:px-10">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[2rem] border border-blue-100 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white font-bold">H</div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Welcome back</p>
              <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Full Name</span><input name="name" value={form.name} onChange={updateField} required className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Email</span><input name="email" type="email" value={form.email} onChange={updateField} required className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Phone</span><input name="phone" value={form.phone} onChange={updateField} className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Password</span><input name="password" type="password" value={form.password} onChange={updateField} required minLength={6} className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Confirm Password</span><input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} required minLength={6} className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Role</span><select name="role" value={form.role} onChange={updateField} className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]"><option value="staff">Staff</option><option value="doctor">Doctor</option></select></label>
          </div>

          {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
          {success ? <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">{success}</p> : null}

          <div className="mt-6 grid gap-3">
            <button className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3.5 font-semibold text-white shadow-lg transition hover:translate-y-[-1px] hover:shadow-xl disabled:opacity-70" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
            <Link to="/" className="rounded-full border border-blue-100 px-5 py-3 text-center font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700">
              Back to Home
            </Link>
          </div>

          <p className="mt-4 text-center text-sm text-slate-600">
            Already have an account? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">Login</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
