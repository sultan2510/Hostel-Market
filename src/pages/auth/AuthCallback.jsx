import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AuthCallback() {
  const { isAuthenticated, hasCompletedProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [waitedTooLong, setWaitedTooLong] = useState(false);

  useEffect(() => {
    // supabaseClient.js has detectSessionInUrl: true, so the Supabase
    // client automatically parses the access token out of the URL and
    // establishes a session shortly after this page mounts — we just need
    // to wait for AuthContext to pick that up via onAuthStateChange.
    if (loading) return;

    if (isAuthenticated) {
      navigate(hasCompletedProfile ? '/app' : '/complete-profile', { replace: true });
    }
  }, [isAuthenticated, hasCompletedProfile, loading, navigate]);

  useEffect(() => {
    // If nothing happens within a few seconds, the link was probably
    // invalid/expired — give the person a way out instead of an infinite
    // spinner.
    const timer = setTimeout(() => setWaitedTooLong(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-6">
      <div className="text-center max-w-sm">
        {!waitedTooLong ? (
          <p className="text-[var(--text-secondary)]">Signing you in...</p>
        ) : (
          <>
            <p className="text-[var(--text-secondary)] mb-4">
              This link may have expired or already been used.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Back to log in
            </button>
          </>
        )}
      </div>
    </div>
  );
}