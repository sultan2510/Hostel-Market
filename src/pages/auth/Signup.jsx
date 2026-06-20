import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | checking | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your school email.');
      return;
    }

    setStatus('checking');

    try {
      // Step 1: pre-check the domain via our edge function for a friendly
      // error message before we send any sign-in link.
      const { data: validation, error: fnError } = await supabase.functions.invoke(
        'validate-signup',
        { body: { email: trimmedEmail } },
      );

      if (fnError) {
        setStatus('error');
        setErrorMsg('Could not verify your email right now. Please try again in a moment.');
        return;
      }

      if (!validation?.allowed) {
        setStatus('error');
        setErrorMsg(
          validation?.error ||
            'This email is not a recognized NUST email (e.g. @seecs.edu.pk, @student.nust.edu.pk).',
        );
        return;
      }

      // Step 2: domain is good — send the magic sign-in link.
      // emailRedirectTo tells Supabase where to send the user back to after
      // they click the link in their inbox — our AuthCallback route, which
      // picks up the session and routes them onward.
      setStatus('sending');
      const { error: linkError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (linkError) {
        setStatus('error');
        setErrorMsg(linkError.message || 'Could not send sign-in link. Please try again.');
        return;
      }

      setStatus('sent');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  }

  const isBusy = status === 'checking' || status === 'sending';

  if (status === 'sent') {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicNavbar />
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md text-center">
            <h1 className="font-display text-3xl font-semibold mb-3">Check your inbox</h1>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              We sent a sign-in link to <span className="text-[var(--text-primary)]">{email.trim()}</span>.
              Open it on this device to finish signing up.
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
            <h1 className="font-display text-3xl font-semibold mb-2">Sign up</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Only verified campus department emails can join — dayscholars and
              hostellites both welcome.
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
              {status === 'checking'
                ? 'Checking email...'
                : status === 'sending'
                ? 'Sending link...'
                : 'Send sign-in link'}
            </button>

            <p className="mt-4 text-xs text-[var(--text-muted)] text-center">
              SEECS students use @seecs.edu.pk. All other schools use
              @student.nust.edu.pk.
            </p>
          </form>

          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--accent)] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}