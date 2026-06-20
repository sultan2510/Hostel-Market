-- ============================================================================
-- Defense in depth: enforce the domain whitelist INSIDE the database too.
--
-- The validate-signup Edge Function is the friendly first line of defense
-- (gives the user a clear error before an OTP email even goes out). But a
-- determined user could call supabase.auth.signUp() directly from devtools
-- and skip the edge function entirely. This trigger makes that pointless:
-- even if they get an OTP and "sign up", their auth.users row gets rejected
-- at the database level unless their email domain is on the whitelist.
-- ============================================================================

create or replace function public.enforce_allowed_email_domain()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_domain text;
  v_is_allowed boolean;
begin
  v_domain := split_part(new.email, '@', 2);

  select exists (
    select 1 from public.allowed_domains
    where domain = lower(v_domain) and is_active = true
  ) into v_is_allowed;

  if not v_is_allowed then
    raise exception 'Signup rejected: % is not a recognized NUST H-12 school email domain', v_domain;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_email_domain on auth.users;
create trigger trg_enforce_email_domain
  before insert on auth.users
  for each row execute function public.enforce_allowed_email_domain();
