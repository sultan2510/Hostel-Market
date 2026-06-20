import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

export default function Login() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your school email.');
      return;
    }

    setStatus('sending');

    // Note: we don't re-run the domain pre-check here. If the account
    // already exists, it could only have been created through a validated
    // domain (enforced by the database trigger), so this is safe — and it
    // also means a typo'd email just gets a normal "OTP sent" flow rather
    // than confusingly being told the domain is invalid.
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: { shouldCreateUser: false },
    });

    if (error) {
      setStatus('error');
      setErrorMsg(
        error.message?.includes('Signups not allowed')
          ? 'No account found for this email. Please sign up first.'
          : error.message || 'Could not send code. Please try again.',
      );
      return;
    }

    navigate('/verify-otp', { state: { email: trimmedEmail } });
  }

  const isBusy = status === 'sending';

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-semibold mb-2">Log in</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Enter your school email and we'll send you a one-time code.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6"
          >
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              School email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@seecs.nust.edu.pk"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--bg-base)] border border-[var(--border-strong)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] outline-none transition-colors"
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
              disabled={isBusy}
              className="w-full mt-5 px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg-base)] font-medium hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isBusy ? 'Sending code...' : 'Send code'}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[var(--accent)] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
