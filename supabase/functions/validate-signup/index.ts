// supabase/functions/validate-signup/index.ts
//
// Gatekeeper for signup. The client calls this BEFORE triggering Supabase's
// own OTP email, so we can reject non-NUST-H12 emails with a clear message
// instead of silently sending an OTP to an address that will fail later.
//
// This is intentionally a separate, minimal server-side check: client-side
// validation can always be bypassed by a user editing JS in devtools or
// calling the API directly, so the real gate must live here.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // tighten to your deployed domain in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Basic shape check before we even hit the database.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const domain = normalizedEmail.split('@')[1];

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabaseAdmin
      .from('allowed_domains')
      .select('domain, school_name')
      .eq('domain', domain)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Domain lookup failed:', error);
      return new Response(JSON.stringify({ error: 'Internal error, please try again' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!data) {
      return new Response(
        JSON.stringify({
          allowed: false,
          error:
            'This email domain is not recognized as a NUST email. Please sign up with your official school email (e.g. @seecs.edu.pk or @student.nust.edu.pk).',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ allowed: true, schoolName: data.school_name }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Unexpected error in validate-signup:', err);
    return new Response(JSON.stringify({ error: 'Internal error, please try again' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});