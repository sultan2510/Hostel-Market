import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

export default function Login() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your school email.');
      return;
    }

    setStatus('sending');

    // Note: shouldCreateUser is true here too — for an email that already
    // has an account, this just sends a fresh sign-in link without creating
    // a duplicate. With shouldCreateUser: false, Supabase can fail to send
    // an email at all under some conditions without a clear error, which is
    // exactly what caused login to silently not work.
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMsg(
        error.message?.includes('Signups not allowed')
          ? 'No account found for this email. Please sign up first.'
          : error.message || 'Could not send sign-in link. Please try again.',
      );
      return;
    }

    setStatus('sent');
  }

  const isBusy = status === 'sending';

  if (status === 'sent') {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicNavbar />
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md text-center">
            <h1 className="font-display text-3xl font-semibold mb-3">Check your inbox</h1>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              We sent a sign-in link to <span className="text-[var(--text-primary)]">{email.trim()}</span>.
              Open it on this device to log in.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Use a different email
            </button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-semibold mb-2">Log in</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Enter your school email and we'll send you a sign-in link.
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
              placeholder="yourname@seecs.edu.pk"
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
              {isBusy ? 'Sending link...' : 'Send sign-in link'}
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