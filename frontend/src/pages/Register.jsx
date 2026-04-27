import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
  });
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
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.register(form);
      setSuccess('Account created successfully. Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-hero auth-hero-register">
          <div className="auth-brand">
            <div className="brand-mark brand-mark-large">HMS</div>
            <div>
              <p className="eyebrow">Hospital Management System</p>
              <h1>Build secure access for your clinical team.</h1>
            </div>
          </div>
          <p className="auth-lead">
            Add doctors and reception staff with role-specific access to billing, admissions, operations, and patient records.
          </p>
          <div className="feature-grid">
            <div className="feature-card">
              <strong>Doctor users</strong>
              <span>Clinical dashboard, prescriptions, admissions, and pricing.</span>
            </div>
            <div className="feature-card">
              <strong>Staff users</strong>
              <span>Patient registration, payments, and appointment handling.</span>
            </div>
            <div className="feature-card">
              <strong>Secure roles</strong>
              <span>JWT protected sessions with automatic redirect.</span>
            </div>
          </div>
        </section>
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-header">
            <p className="eyebrow">Create Account</p>
            <h2>Register a new user</h2>
            <p className="muted">Choose doctor or staff based on the access required.</p>
          </div>
          <label>
            <span>Name</span>
            <input name="name" value={form.name} onChange={updateField} required />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={updateField} required />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" value={form.password} onChange={updateField} required minLength={6} />
          </label>
          <label>
            <span>Role</span>
            <select name="role" value={form.role} onChange={updateField}>
              <option value="staff">Staff</option>
              <option value="doctor">Doctor</option>
            </select>
          </label>
          {error ? <p className="form-message error">{error}</p> : null}
          {success ? <p className="form-message">{success}</p> : null}
          <button className="primary-button full-width" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
