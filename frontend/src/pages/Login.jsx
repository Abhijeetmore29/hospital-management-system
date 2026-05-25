import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [email, setEmail] = useState('doctor@hospital.com');
  const [password, setPassword] = useState('Doctor@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      if (user.role === 'doctor') {
        navigate('/doctor/dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/medical-imaging', { replace: true });
      } else {
        navigate('/staff/dashboard', { replace: true });
      }
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
              <div className="font-semibold">Meditrack</div>
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
              <h2 className="text-2xl font-bold text-slate-900">Sign in to Meditrack</h2>
            </div>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@hospital.com" required className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none ring-0 transition focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Password</span>
              <div className="relative">
                <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter password" required className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 pr-20 outline-none ring-0 transition focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-semibold text-blue-600">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" className="rounded border-blue-300 text-blue-600" />Remember me</label>
          </div>
          {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
          <button type="submit" disabled={loading} className="mt-6 w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3.5 font-semibold text-white shadow-lg transition hover:translate-y-[-1px] hover:shadow-xl disabled:opacity-70">
            {loading ? 'Signing in...' : 'Login'}
          </button>
          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/" className="rounded-full border border-blue-100 px-4 py-2 font-medium text-slate-600 hover:border-blue-200 hover:text-blue-700">Back to Home</Link>
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">Create account</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
