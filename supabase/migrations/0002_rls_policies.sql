-- ============================================================================
-- Row Level Security Policies
-- Default-deny: every table has RLS enabled, every access path is explicit.
-- ============================================================================

alter table public.allowed_domains enable row level security;
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.contact_reveals enable row level security;
alter table public.reports enable row level security;

-- ----------------------------------------------------------------------------
-- allowed_domains: readable by anyone (needed at signup, before auth exists),
-- writable by no one via the API (only via migrations / service role).
-- ----------------------------------------------------------------------------
create policy "allowed_domains_select_all"
  on public.allowed_domains for select
  using (true);

-- No insert/update/delete policy defined => blocked for all non-service-role
-- requests by default. This is intentional: the whitelist must not be
-- editable from the client under any circumstances.

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
-- Anyone authenticated can view *limited* public profile fields of others
-- (needed to show seller name on a listing). We achieve "limited fields"
-- by exposing a view (public_profiles) instead of relaxing this policy —
-- see below. This policy itself stays tight: a user can only read their
-- own full profile row directly.
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No delete policy: account deletion goes through a server-side function
-- (handle_account_deletion) so we can clean up listings/storage consistently.

-- ----------------------------------------------------------------------------
-- listings
-- ----------------------------------------------------------------------------
-- Any authenticated, non-banned user may view active listings.
create policy "listings_select_active"
  on public.listings for select
  using (
    status = 'active'
    and auth.uid() is not null
    and not exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_banned
    )
  );

-- Sellers can always see their own listings regardless of status.
create policy "listings_select_own"
  on public.listings for select
  using (auth.uid() = seller_id);

create policy "listings_insert_own"
  on public.listings for insert
  with check (
    auth.uid() = seller_id
    and not exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_banned
    )
  );

create policy "listings_update_own"
  on public.listings for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "listings_delete_own"
  on public.listings for delete
  using (auth.uid() = seller_id);

-- ----------------------------------------------------------------------------
-- contact_reveals
-- ----------------------------------------------------------------------------
create policy "contact_reveals_select_own"
  on public.contact_reveals for select
  using (auth.uid() = viewer_id);

create policy "contact_reveals_insert_own"
  on public.contact_reveals for insert
  with check (
    auth.uid() = viewer_id
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.status = 'active'
    )
  );

-- ----------------------------------------------------------------------------
-- reports
-- ----------------------------------------------------------------------------
create policy "reports_insert_own"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "reports_select_own"
  on public.reports for select
  using (auth.uid() = reporter_id);

-- ----------------------------------------------------------------------------
-- PUBLIC PROFILE VIEW
-- Exposes only the fields safe to show alongside a listing (name), keeping
-- phone/address out of any broad "select" policy. Contact info is fetched
-- separately through the get_seller_contact() function below, which logs
-- the reveal and can rate-limit it.
-- ----------------------------------------------------------------------------
create or replace view public.public_profiles as
  select id, full_name, school_domain
  from public.profiles;

grant select on public.public_profiles to authenticated;

-- ----------------------------------------------------------------------------
-- SECURE CONTACT REVEAL FUNCTION
-- Runs as definer so it can read profiles.phone_number/hostel_or_address
-- (which the row-level policy otherwise hides from non-owners), but only
-- returns them for an active listing, and logs the reveal for abuse
-- detection. This is the single sanctioned path to see a seller's contact
-- details — there is no RLS policy anywhere that exposes them directly.
-- ----------------------------------------------------------------------------
create or replace function public.get_seller_contact(p_listing_id uuid)
returns table (phone_number text, hostel_or_address text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seller_id uuid;
  v_recent_reveal_count int;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select seller_id into v_seller_id
  from public.listings
  where id = p_listing_id and status = 'active';

  if v_seller_id is null then
    raise exception 'Listing not found or inactive';
  end if;

  -- Basic abuse throttle: block if this user has revealed >40 contacts
  -- in the last hour (catches scraping bots without affecting normal use).
  select count(*) into v_recent_reveal_count
  from public.contact_reveals
  where viewer_id = auth.uid()
    and revealed_at > now() - interval '1 hour';

  if v_recent_reveal_count > 40 then
    raise exception 'Too many contact reveals — please slow down.';
  end if;

  insert into public.contact_reveals (listing_id, viewer_id)
  values (p_listing_id, auth.uid())
  on conflict (listing_id, viewer_id) do nothing;

  return query
    select p.phone_number, p.hostel_or_address
    from public.profiles p
    where p.id = v_seller_id;
end;
$$;

revoke all on function public.get_seller_contact(uuid) from public;
grant execute on function public.get_seller_contact(uuid) to authenticated;
