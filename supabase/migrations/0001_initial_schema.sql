-- ============================================================================
-- Campus P2P Marketplace — Initial Schema
-- NUST H-12 Islamabad, email-domain-gated marketplace
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ALLOWED EMAIL DOMAINS
-- Source of truth for which NUST H-12 school domains may sign up.
-- Kept as a table (not hardcoded) so it can be updated without a redeploy.
-- ----------------------------------------------------------------------------
create table if not exists public.allowed_domains (
  domain text primary key,
  school_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- IMPORTANT: NUST schools do NOT all follow one consistent pattern.
-- SEECS is the one confirmed exception: @seecs.edu.pk (no "nust" in it).
-- Other schools use the shared @student.nust.edu.pk domain rather than
-- their own subdomain. Both patterns are seeded below as confirmed; the
-- per-school ".nust.edu.pk" subdomains are kept too since some schools
-- may issue mail under their own subdomain in addition to the shared one.
-- VERIFY against real student emails before going live — see README.
insert into public.allowed_domains (domain, school_name) values
  ('seecs.edu.pk', 'School of Electrical Engineering & Computer Science'),
  ('student.nust.edu.pk', 'NUST (shared student domain, all schools)'),
  ('seecs.nust.edu.pk', 'School of Electrical Engineering & Computer Science'),
  ('smme.nust.edu.pk', 'School of Mechanical & Manufacturing Engineering'),
  ('scme.nust.edu.pk', 'School of Chemical & Materials Engineering'),
  ('scee.nust.edu.pk', 'School of Civil & Environmental Engineering'),
  ('nbs.nust.edu.pk', 'NUST Business School'),
  ('sada.nust.edu.pk', 'School of Art, Design & Architecture'),
  ('s3h.nust.edu.pk', 'School of Social Sciences & Humanities'),
  ('sns.nust.edu.pk', 'School of Natural Sciences'),
  ('asab.nust.edu.pk', 'Atta-ur-Rahman School of Applied Biosciences'),
  ('sines.nust.edu.pk', 'School of Interdisciplinary Engineering & Sciences'),
  ('nshs.nust.edu.pk', 'NUST School of Health Sciences'),
  ('nls.nust.edu.pk', 'NUST Law School'),
  ('nipcons.nust.edu.pk', 'NUST Institute of Peace & Conflict Studies'),
  ('uspcase.nust.edu.pk', 'US-Pakistan Center for Advanced Studies in Energy')
on conflict (domain) do nothing;

comment on table public.allowed_domains is
  'Whitelist of NUST H-12 Islamabad school email domains permitted to sign up. Deliberately excludes other-campus domains (EME, MCE, MCS, PNEC, CAE, NBC).';

-- ----------------------------------------------------------------------------
-- 2. PROFILES
-- One row per authenticated user, extends Supabase auth.users.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  school_domain text not null references public.allowed_domains(domain),
  phone_number text not null,
  hostel_or_address text not null,
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Extended user profile. phone_number and hostel_or_address are the contact details revealed to interested buyers.';

-- ----------------------------------------------------------------------------
-- 3. LISTINGS
-- ----------------------------------------------------------------------------
create type public.listing_category as enum (
  'appliances',       -- fridges, coolers, irons
  'furniture',        -- mattresses, chairs, tables
  'books',            -- textbooks, notes
  'electronics',      -- calculators, laptops, gadgets
  'project_equipment',-- drafters, lab equipment
  'other'
);

create type public.listing_condition as enum (
  'new',
  'like_new',
  'good',
  'fair',
  'worn'
);

create type public.listing_status as enum (
  'active',
  'sold',
  'removed'
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 100),
  description text not null check (char_length(description) between 10 and 2000),
  price numeric(12,2) not null check (price >= 0),
  category public.listing_category not null,
  condition public.listing_condition not null,
  photo_url text,
  status public.listing_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_listings_category on public.listings(category);
create index if not exists idx_listings_seller on public.listings(seller_id);
create index if not exists idx_listings_created_at on public.listings(created_at desc);

-- ----------------------------------------------------------------------------
-- 4. CONTACT REVEAL LOG
-- Tracks when a buyer reveals a seller's contact info — supports the
-- "hidden until clicked" UX and gives us an abuse-detection signal
-- (e.g. one account mass-revealing hundreds of listings rapidly).
-- ----------------------------------------------------------------------------
create table if not exists public.contact_reveals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  revealed_at timestamptz not null default now(),
  unique (listing_id, viewer_id)
);

create index if not exists idx_contact_reveals_viewer on public.contact_reveals(viewer_id, revealed_at desc);

-- ----------------------------------------------------------------------------
-- 5. REPORTS (basic moderation hook)
-- ----------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (char_length(reason) between 5 and 500),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. updated_at triggers
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();