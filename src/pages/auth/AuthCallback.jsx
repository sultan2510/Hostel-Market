import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const schoolName = location.state?.schoolName;

  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | verifying | resending | error
  const [errorMsg, setErrorMsg] = useState('');

  // If someone lands here directly without going through Signup, send them back.
  if (!email) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicNavbar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-[var(--text-secondary)] mb-4">
              We couldn't find an email to verify. Please start sign up again.
            </p>
            <Link to="/signup" className="text-[var(--accent)] hover:underline">
              Back to sign up
            </Link>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  async function handleVerify(e) {
    e.preventDefault();
    setErrorMsg('');
    setStatus('verifying');

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'email',
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message || 'Invalid or expired code. Please try again.');
      return;
    }

    if (data?.session) {
      // New user → complete profile (name, phone, address) before entering the app.
      // Existing user → straight into the app.
      navigate('/complete-profile');
    }
  }

  async function handleResend() {
    setStatus('resending');
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      setErrorMsg(error.message || 'Could not resend code.');
    }
    setStatus('idle');
  }

  const isBusy = status === 'verifying' || status === 'resending';

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-semibold mb-2">Check your inbox</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              We sent a 6-digit code to <span className="text-[var(--text-primary)]">{email}</span>
              {schoolName ? <> ({schoolName})</> : null}.
            </p>
          </div>

          <form
            onSubmit={handleVerify}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6"
          >
            <label htmlFor="code" className="block text-sm font-medium mb-2">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              autoComplete="one-time-code"
              className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--bg-base)] border border-[var(--border-strong)] text-[var(--text-primary)] text-center text-2xl tracking-[0.3em] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] outline-none transition-colors"
              disabled={isBusy}
              required
            />

            {errorMsg && (
              <p className="mt-3 text-sm text-[var(--danger)]" role="alert">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isBusy || code.length !== 6}
              className="w-full mt-5 px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg-base)] font-medium hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'verifying' ? 'Verifying...' : 'Verify and continue'}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={isBusy}
              className="w-full mt-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-60"
            >
              {status === 'resending' ? 'Resending...' : "Didn't get a code? Resend"}
            </button>
          </form>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
