import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load profile:', error.message);
      setProfile(null);
      return;
    }
    setProfile(data);
  }

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      setSession(initialSession);
      if (initialSession?.user) {
        loadProfile(initialSession.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }

  async function refreshProfile() {
    if (session?.user) {
      await loadProfile(session.user.id);
    }
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isAuthenticated: !!session?.user,
    hasCompletedProfile: !!profile,
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
