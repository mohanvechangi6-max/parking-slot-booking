import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';

function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (token) {
        if (password.length < 6) throw new Error('Password must be at least 6 characters long.');
        if (password !== confirmation) throw new Error('Passwords do not match.');
        const response = await authService.resetPassword({ token, password });
        setMessage(response.message);
      } else {
        const response = await authService.requestPasswordReset({ email });
        setMessage(response.message);
        setResetUrl(response.resetUrl || '');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to reset your password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-slate-500">Account recovery</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">{token ? 'Choose a new password' : 'Forgot your password?'}</h1>
          <p className="mt-2 text-sm text-slate-500">{token ? 'Use a password with at least 6 characters.' : 'Enter your account email and we’ll help you reset it.'}</p>
        </div>

        {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div role="status" className="mb-5 break-words rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
          {resetUrl && <p className="mt-2"><a className="font-semibold underline" href={resetUrl}>Open development reset link</a></p>}
        </div>}

        {!message.includes('Password updated') && (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {token ? (
              <>
                <label className="block text-sm font-medium text-slate-700">New password
                  <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
                </label>
                <label className="block text-sm font-medium text-slate-700">Confirm new password
                  <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={6} />
                </label>
              </>
            ) : (
              <label className="block text-sm font-medium text-slate-700">Email
                <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
              </label>
            )}
            <button className="w-full rounded-lg bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : token ? 'Reset password' : 'Send reset link'}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-slate-500"><Link className="font-semibold text-slate-950 underline underline-offset-4" to="/login">Back to log in</Link></p>
      </section>
    </main>
  );
}

export default ForgotPassword;
