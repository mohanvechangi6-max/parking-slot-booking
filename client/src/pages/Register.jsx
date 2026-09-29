import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((currentForm) => ({ ...currentForm, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Name, email, password, and password confirmation are required.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = form;
      await register(userData);
      navigate('/slots', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <video className="register-page-video" autoPlay muted loop playsInline aria-hidden="true" tabIndex={-1}>
        <source src="https://cdn.dribbble.com/userupload/42775319/file/original-aa4478d276126caa6e3c3b4c32de362e.mp4" type="video/mp4" />
      </video>
      <section className="register-shell">
        <div className="register-showcase">
          <div className="register-showcase-top"><span>ParkBay</span><span>01 / 03</span></div>
          <div className="register-showcase-copy">
            <p className="register-kicker">Your parking, simplified</p>
            <h1>Arrive<br /><em>better.</em></h1>
            <p>One account for clear availability, effortless reservations, and calmer city days.</p>
          </div>
          <div className="register-scan-card">
            <div><span className="scan-dot" /> Network status</div>
            <strong>Ready to park</strong>
            <span className="scan-line" />
          </div>
          <div className="register-showcase-foot"><span>LIVE PARKING NETWORK</span><span>25.2048 N / 55.2708 E</span></div>
        </div>

        <div className="register-form-panel">
          <div className="register-form-heading">
            <p className="register-kicker">Get started</p>
            <h2>Create your account</h2>
            <p>Reserve a better parking spot in less time.</p>
          </div>

        {error && (
          <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              placeholder="Your name"
              required
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </label>

          <div className="register-password-grid">
            <label>
              Password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="6+ characters"
                required
              />
            </label>

            <label>
              Confirm password
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Repeat password"
                required
              />
            </label>
          </div>

          <button
            className="register-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="register-login-link">
          Already registered? <Link to="/login">Log in</Link>
        </p>
        </div>
      </section>
    </main>
  );
}

export default Register;
