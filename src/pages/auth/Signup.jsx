import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | checking | sending | error
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

    setStatus('checking');

    try {
      // Safely extract ONLY the root protocol and domain name (e.g., https://xyz.supabase.co)
      const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const urlObject = new URL(rawUrl.includes('://') ? rawUrl : `https://${rawUrl}`);
      const cleanBaseUrl = urlObject.origin; 
      
      const functionUrl = `${cleanBaseUrl}/functions/v1/validate-signup`;

      let validation = null;
      try {
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          },
          body: JSON.stringify({ email: trimmedEmail }),
        });
        validation = await response.json();
      } catch (fetchErr) {
        console.warn('Direct fetch failed, falling back to invoke:', fetchErr);
        const { data } = await supabase.functions.invoke('validate-signup', {
          body: { email: trimmedEmail },
        });
        validation = data;
      }

      if (!validation || validation.error) {
        setStatus('error');
        setErrorMsg(
          validation?.error ||
            'This email is not a recognized school email. Please ensure your department domain is correct.'
        );
        return;
      }

      if (validation.allowed === false) {
        setStatus('error');
        setErrorMsg(
          validation.error ||
            'This email is not authorized. Please try using your campus address format.'
        );
        return;
      }

      // Step 2: domain is verified - call authentication OTP sequence
      setStatus('sending');
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: { shouldCreateUser: true },
      });

      if (otpError) {
        setStatus('error');
        setErrorMsg(otpError.message || 'Could not send verification code. Please try again.');
        return;
      }

      navigate('/verify-otp', { state: { email: trimmedEmail, schoolName: validation.schoolName } });
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  }

  const isBusy = status === 'checking' || status === 'sending';

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
                ? 'Sending code...'
                : 'Send verification code'}
            </button>

            <p className="mt-4 text-xs text-[var(--text-muted)] text-center">
              Accepted domains include seecs, smme, scme, scee, nbs, sada, s3h, sns,
              asab, sines, nshs, nls, nipcons, and uspcase.
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