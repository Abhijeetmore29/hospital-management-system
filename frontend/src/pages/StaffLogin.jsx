import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';

export function StaffLogin() {
  const [email, setEmail] = useState('staff@hospital.com');
  const [password, setPassword] = useState('Staff@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      localStorage.setItem('staffToken', localStorage.getItem('hms_token') || '');
      navigate('/staff/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Staff Login" subtitle="Staff Portal">
      <p className="mb-6 text-sm text-slate-500">Sign in to manage registration, queue, billing, and reports.</p>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Email" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Password" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]" />
        <div className="flex items-center justify-between text-sm text-slate-600">
          <label className="flex items-center gap-2"><input type="checkbox" className="rounded border-slate-300 text-blue-600" />Remember me</label>
          <button type="button" className="text-blue-600">Forgot password?</button>
        </div>
        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
        <button className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3.5 font-semibold text-white shadow-lg transition hover:scale-[1.01]" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        <Link to="/" className="rounded-full border border-slate-200 px-5 py-3 text-center font-semibold text-slate-600">Back to Home</Link>
        <p className="text-center text-sm text-slate-600">Already have account? <Link to="/login" className="text-blue-600">Login</Link></p>
      </form>
    </AuthLayout>
  );
}
