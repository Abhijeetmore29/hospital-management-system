import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [email, setEmail] = useState('doctor@hospital.com');
  const [password, setPassword] = useState('Doctor@123');
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
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/staff/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="login-shell">
        <section className="login-hero">
          <div className="login-hero-top">
            <div className="brand-mark brand-mark-large">HMS</div>
            <span className="status-chip">Secure Access</span>
          </div>

          <p className="eyebrow hero-eyebrow">Hospital Management System</p>
          <h1>Fast, secure access for clinical and reception workflows.</h1>
          <p className="auth-lead">
            One login for patient registration, admissions, billing, operations, prescriptions, and discharge management.
          </p>

          <div className="login-pill-row">
            <span>Doctor Portal</span>
            <span>Staff Portal</span>
            <span>IPD Workflow</span>
            <span>UPI Billing</span>
          </div>

          <div className="login-metrics">
            <div className="metric-card">
              <strong>24/7</strong>
              <span>Clinical access</span>
            </div>
            <div className="metric-card">
              <strong>Role</strong>
              <span>Based routing</span>
            </div>
            <div className="metric-card">
              <strong>Safe</strong>
              <span>JWT protected</span>
            </div>
          </div>

          <div className="demo-panel">
            <div className="demo-panel-header">
              <strong>Demo users</strong>
              <span>Ready to test</span>
            </div>
            <div className="demo-panel-grid">
              <div>
                <span>Doctor</span>
                <strong>doctor@hospital.com</strong>
                <small>Doctor@123</small>
              </div>
              <div>
                <span>Staff</span>
                <strong>staff@hospital.com</strong>
                <small>Staff@123</small>
              </div>
            </div>
          </div>
        </section>

        <form className="login-card" onSubmit={handleSubmit}>
          <div className="auth-card-header">
            <p className="eyebrow">Welcome back</p>
            <h2>Sign in to HMS</h2>
            <p className="muted">Use your registered doctor or staff credentials.</p>
          </div>

          <div className="login-form-grid">
            <label>
              <span>Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@hospital.com"
                required
              />
            </label>
            <label>
              <span>Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                required
              />
            </label>
          </div>

          {error ? <p className="form-message error">{error}</p> : null}

          <div className="login-actions">
            <button className="primary-button full-width" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <p className="auth-footer">
            Need an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
