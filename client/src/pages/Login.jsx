import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((currentForm) => ({ ...currentForm, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await login(form);
      navigate('/slots', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-stage">
        <section className="login-showcase" aria-label="ParkBay parking network">
          <div className="login-showcase-meta"><span><i /> PARKBAY / CITY NETWORK</span><span>EST. FOR YOUR EVERYDAY</span></div>
          <div className="login-showcase-copy">
            <p className="login-kicker">PARK A LITTLE BETTER</p>
            <h1>Your city.<br />Your <em>spot.</em></h1>
            <p>Find your place in the city and get on with what matters.</p>
          </div>
          <div className="login-showcase-footer"><span>BOOK A SPOT IN SECONDS</span><span>01 — 03</span></div>
        </section>

        <section className="login-panel">
          <div className="login-panel-heading">
            <p className="login-panel-kicker">WELCOME BACK</p>
            <h2>Good to see<br />you <em>again.</em></h2>
            <p>Log in to pick up where you left off.</p>
          </div>

          {error && <div role="alert" className="login-error">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <label>Email address
              <input name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" placeholder="you@example.com" required />
            </label>
            <label>Password
              <input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="current-password" placeholder="Enter your password" required />
            </label>
            <div className="login-form-options"><span>Secure sign in</span><Link to="/forgot-password">Forgot password?</Link></div>
            <button type="submit" disabled={loading}><span>{loading ? 'Logging in...' : 'Log in to ParkBay'}</span><b aria-hidden="true">&#8599;</b></button>
          </form>

          <p className="login-create-account">New to ParkBay? <Link to="/create-account">Create an account <span aria-hidden="true">&#8594;</span></Link></p>
          <div className="login-panel-foot"><span>© PARKBAY</span><span>MADE FOR THE WAY YOU MOVE</span></div>
        </section>
      </div>
    </main>
  );
}

export default Login;
