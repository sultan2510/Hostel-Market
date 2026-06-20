import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in dev rather than silently shipping a broken client.
  console.error(
    'Missing Supabase environment variables. Did you create a .env file from .env.example?',
  );
}

// IMPORTANT: only the public "anon" key ever ships to the browser.
// The service_role key must never appear in any frontend file or bundle —
// it lives only in Supabase project settings and Edge Function secrets.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
