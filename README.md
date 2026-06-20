# HostelMarket — NUST Campus P2P Marketplace

A closed-loop classifieds platform for NUST (H-12, Islamabad) students —
dayscholars and hostellites alike — to buy and sell items like mini-fridges,
mattresses, textbooks, calculators, and project equipment. Access is gated by
verified NUST school email + one-time code; buyers and sellers connect
directly and arrange payment/handoff themselves.

## Tech stack

- **Frontend:** React + Vite + Tailwind CSS, deployed on Vercel
- **Backend/Auth/DB:** Supabase (Postgres, Auth with email magic links, Storage, Edge Functions)
- **No payment processing in-app** — contact info (phone + address) is revealed to buyers on request; the transaction itself happens off-platform

---

## 1. Project structure

```
.
├── src/
│   ├── pages/
│   │   ├── public/        → Landing, About, Mission, How It Works, FAQ
│   │   ├── auth/          → Signup, Login, AuthCallback, CompleteProfile
│   │   └── app/            → Home (browse), ListingDetail, CreateListing, Profile
│   ├── components/
│   │   ├── public/        → PublicNavbar, PublicFooter
│   │   ├── auth/          → ProtectedRoute
│   │   ├── app/            → AppNavbar, ListingCard, FilterSidebar
│   │   └── shared/        → Badge (category/condition/status tags)
│   ├── context/AuthContext.jsx
│   └── lib/supabaseClient.js
├── supabase/
│   ├── migrations/         → SQL schema, RLS policies, storage setup, security trigger
│   └── functions/
│       └── validate-signup/ → Edge Function: domain whitelist pre-check
├── vercel.json
├── .env.example
└── README.md   (this file)
```

---

## 2. Set up Supabase (via the Vercel Marketplace)

This project is wired for Supabase (Postgres + Auth + Storage). Rather than
creating a standalone Supabase account, provision it directly from your
Vercel dashboard — same Supabase backend, just connected through Vercel's
integration flow:

1. Create your project on Vercel first (see Section 4 below if you haven't
   imported the GitHub repo yet) — you need a Vercel project to attach the
   integration to.
2. In your Vercel project dashboard, go to the **Storage** tab → **Browse
   Marketplace** (or **Create Database**).
3. Search for **Supabase**, select it, and click **Add Integration** /
   **Install**. Follow the prompts — this either creates a brand-new Supabase
   project or links an existing one, and handles the OAuth connection for you.
4. Once connected, Vercel auto-injects Supabase credentials into your
   project's **Environment Variables**. Open **Settings → Environment
   Variables** and confirm there are entries for your Supabase URL and anon
   key. If the variable names don't already match `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` (the names this codebase expects — see
   `src/lib/supabaseClient.js`), either rename them in Vercel's settings or
   add matching aliases.
5. From the Vercel **Storage** tab, click through to the linked Supabase
   project's dashboard (there's a direct link). Open its **SQL Editor** and
   run each file under `supabase/migrations/` in order — 0001, 0002, 0003,
   0004 — by pasting the contents of each and clicking Run. This creates all
   tables, RLS policies, the storage bucket, and the email-domain security
   trigger.

   **Alternative (CLI):** if you'd rather use the Supabase CLI against this
   same linked project:
   ```
   npm install -g supabase
   supabase login
   supabase link --project-ref your-project-ref
   supabase db push
   ```
6. Deploy the Edge Function against the same linked project:
   ```
   supabase functions deploy validate-signup
   ```
7. In the Supabase dashboard, go to **Authentication → Providers → Email**
   and make sure email sign-in is turned on, with email confirmations
   required. By default this sends a clickable magic sign-in link — Supabase's
   built-in email sender does not allow editing that template to show a typed
   code instead unless you configure custom SMTP. (Supabase's free tier sends
   these emails via its own shared service — for production scale with
   1000s of users, configure a custom SMTP provider under **Authentication →
   Settings → SMTP Settings** so deliverability and rate limits aren't
   capped by the shared default sender.)
8. **Set the Site URL** under **Authentication → URL Configuration** to your
   actual deployed Vercel URL (e.g. `https://your-app.vercel.app`), and add
   the same URL under **Redirect URLs**. This is what the magic link in the
   email points to — if left as `localhost`, the link will fail for anyone
   opening it outside your own dev machine.
9. **Double-check the allowed domains table** matches your actual school
   list. Run this in the SQL editor any time you need to add/remove a domain:
   ```sql
   insert into public.allowed_domains (domain, school_name)
   values ('newschool.nust.edu.pk', 'New School Name')
   on conflict (domain) do nothing;

   -- to disable a domain without deleting it:
   update public.allowed_domains set is_active = false where domain = 'somedomain.nust.edu.pk';
   ```

**For local development**, pull the same env vars Vercel generated instead of
hand-copying them:
```
npm install -g vercel
vercel link
vercel env pull .env
```
This writes a `.env` file with the exact values Vercel injected, so your
local app and deployed app stay in sync automatically.

---

## 3. Run locally

If you've already linked this project to Vercel (Section 2 above), pull the
real Supabase credentials Vercel generated:

```
npm install
vercel link
vercel env pull .env
npm run dev
```

**If you haven't set up Vercel yet** and just want to run against your own
Supabase project manually, copy `.env.example` to `.env` and fill in your
Supabase URL + anon key by hand instead:

```
npm install
cp .env.example .env
# edit .env and paste your Supabase URL + anon key
npm run dev
```

Open the printed `localhost` URL.

---

## 4. Deploy to Vercel (via GitHub)

1. Push this project to a new GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your
   GitHub repo.
3. Vercel will auto-detect the Vite framework from `vercel.json`. Leave build
   settings as-is.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon public key
   (Use the same values from your local `.env`. Never paste the `service_role`
   key here — it must never reach the frontend.)
5. Click **Deploy**.

Every future push to your main branch will auto-redeploy.

---

## 5. Security model (what protects this app, and what doesn't)

No software is "unhackable" — anyone promising that is overselling. What this
build does concretely:

- **Email-domain gating happens twice, independently:**
  1. The `validate-signup` Edge Function checks the domain before sending any
     sign-in link, so users get a clear error message.
  2. A Postgres trigger (`enforce_allowed_email_domain`, migration `0004`)
     rejects the signup at the database level even if someone bypasses the
     Edge Function and calls Supabase Auth directly from devtools. This is
     the real enforcement boundary — the Edge Function is just UX polish.
- **Row Level Security (RLS) is enabled on every table.** Each table has an
  explicit allow-list of policies; anything not explicitly permitted is
  denied by default — including the `allowed_domains` table itself, which
  cannot be edited from any client, only from the SQL editor or migrations.
- **Seller contact info (phone/address) is never exposed via a direct table
  policy.** It's only readable through the `get_seller_contact()` Postgres
  function, which requires authentication, checks the listing is active,
  logs the reveal (`contact_reveals` table), and throttles a single viewer to
  40 reveals/hour to blunt scraping.
- **Storage uploads are folder-scoped per user** (`{user_id}/filename`), so
  one user cannot overwrite or flood another user's files.
- **Inputs are constrained at the database level** (title/description length,
  non-negative price, enum-restricted category/condition) so malformed or
  abusive data can't be inserted even if client-side validation is skipped.
- **No service_role key, database password, or secret ever ships to the
  browser.** Only the public anon key (safe by design, restricted by RLS) is
  in frontend env vars.

What this does **not** cover, and what you should still do before/while
scaling to real users:
- Set up Supabase's **rate limiting** on auth endpoints (Dashboard →
  Authentication → Rate Limits) to slow down link-spam/brute-force attempts.
- Configure custom SMTP for sign-in emails once you're past Supabase's
  free-tier email volume (relevant once you have hundreds of signups in a
  short window, e.g. when freshers arrive).
- Add a moderation routine for the `reports` table (currently just collects
  reports — review and acting on them is a manual/human step).
- Consider periodic backups (Supabase Pro tier includes automated backups;
  free tier does not).

---

## 6. Scaling notes (targeting ~1,000 concurrent users)

- Supabase's free tier supports up to 500MB database storage and 50,000
  monthly active users on auth — comfortably above a single university's
  expected usage, but **storage and bandwidth** (listing photos) are the
  more likely bottleneck. Monitor usage under Project Settings → Usage, and
  upgrade to the Pro tier ($25/mo) before you hit free-tier caps, not after.
- Listings query already has indexes on `status`, `category`, `seller_id`,
  and `created_at` (migration `0001`) to keep the browse page fast as the
  listings table grows.
- Vercel's free (Hobby) tier is generally sufficient for this traffic level;
  upgrade to Pro if you need custom domains with higher bandwidth limits or
  team collaboration.