<!-- BEGIN:working-agreement -->
# AGENTS.md - OneMLS Working Agreement

You are improving an existing live project. Do not rewrite. Preserve what works. Learn current patterns first.

## Core rules

- Treat the app as production truth
- Smallest correct changes only
- Reuse existing conventions
- Before claiming a change works, verify it end-to-end in the appropriate way: build, smoke-test, load the URL, run the query, or run the test
- When adding a database migration, verify the migration SQL works before app code depends on it
- If a seed/sample script errors, fix it before moving on; do not leave partial data
- When a metric regresses, first check whether the code changed or the measurement is wrong
- If you're unsure whether a change is "small," it isn't — ask first
- Ask before destructive, architectural, or broad cross-cutting changes
- Updates to "Preferred patterns" and "Open issues / fragile areas" are append-only; do not delete existing entries without approval

## Workflow

1. Inspect relevant files first
2. Explain current behavior
3. Propose the smallest sensible change + risks
4. Implement incrementally
5. Verify it actually works end-to-end
6. Update AGENTS.md only if instructions, assumptions, commands, or fragile areas changed

<!-- END:working-agreement -->

---

## Stack & repo map

**Stack:** Next.js 16.2.2 (App Router, Turbopack), TypeScript, Tailwind CSS v4, Supabase (Postgres + Auth + Storage), Leaflet maps, deployed to Netlify at https://elaborate-torte-8efa88.netlify.app.

**Important: This is Next.js 16.** Breaking changes from older versions — `params` and `searchParams` are `Promise<>` in page components and must be `await`ed. Read `node_modules/next/dist/docs/` before using any unfamiliar API.

**Repo layout:**
```
src/
  app/
    page.tsx                   Landing page (public)
    (public)/                  Public route group (no sidebar)
      layout.tsx               Public nav + footer
      property/[id]/page.tsx   Property detail (SSR, OG tags)
      search/                  Map-based search
    (portal)/                  Authenticated route group
      layout.tsx               Sidebar + header + notifications
      dashboard/
      my-listings/             Listing CRUD + create wizard
      saved/
      open-houses/
      analytics/
      notifications/
      cma/
      collections/
      market-insights/
      market-updates/
      marketing-materials/     Social cards, flyers, QR, website
      email-campaigns/
      brand-kit/
      billing/
      admin/                   Role-gated
      api-docs/
      e-contracts/
      profile/
    api/reso/                  Public RESO Web API
    login/, register/, auth/callback/
  components/                  Shared UI (Sidebar, PublicNav, PropertyCard, etc.)
    marketing/                 Social card + PDF flyer templates
  lib/
    supabase.ts                Browser client
    supabase-server.ts         Server client (SSR)
    queries.ts                 Server-side Supabase queries
    types.ts                   DB type definitions
    location-apis.ts           Walk Score / GreatSchools / Census wrappers
    state-disclosures.ts       State contract disclosure rules
  middleware.ts                Auth gate for /(portal) routes
supabase/                      SQL migrations (run manually in SQL Editor)
scripts/                       Seed scripts (node scripts/seed-*.js)
legal/                         Federal + California RE law reference docs
```

**Supabase project:** `xntomzmazspwsfymhirf` (org: The Colyer Team LLC, plan: Pro). Tables with RLS enabled: profiles, properties, showings, messages, contracts, cma_reports, trades_professionals, saved_searches, saved_listings, open_houses, property_views, property_events, notifications, notification_preferences, collections, collection_items, brand_kits.

**Test users (both admins, Pro plan):**
- mike@thecolyerteam.com / OneMLS2026!
- larry.homestar@gmail.com / OneMLS2026!

---

## Commands

- **Frontend build:** `npx next build` (runs TypeScript check + Turbopack build; must pass before pushing)
- **Frontend dev:** `npm run dev` (http://localhost:3000)
- **Backend smoke test:** `curl -s https://elaborate-torte-8efa88.netlify.app/ -o /dev/null -w "%{http_code}"` (expect 200)
- **Database migration:** Open Supabase SQL Editor, paste from `supabase/*.sql`, Run. No CLI migration tooling.
- **Seed/sample data:** `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-<name>.js` (env vars required for service-role writes)
- **Tests:** No test suite yet. Verification is via build + manual smoke test on Netlify.
- **Git:** Commits auto-deploy to Netlify on push to `master`.

---

## Must not break

- **Auth flow:** login, register, `handle_new_user()` trigger, middleware protection of `(portal)` routes. Auth user IDs in `auth.users` are foreign-keyed from `profiles.id`.
- **Public routes render without a session:** `/`, `/search`, `/property/[id]`, `/api/reso/**`. The middleware must not gate them.
- **RLS policies:** All tables have RLS on. Never query from the client expecting service-role access. Use server components + `createServerSupabaseClient()` for reads that need privileged data.
- **MLS ID generation:** `properties.mls_id` uses the `mls_id_seq` sequence and the `generate_mls_id()` default. Do not set mls_id manually on insert.
- **Property photos contract:** `photos` is a `text[]` of full public URLs (Supabase Storage or Unsplash). First element is primary. Components assume this.
- **Image remote patterns:** Only `xntomzmazspwsfymhirf.supabase.co` and `images.unsplash.com` are allowed in `next.config.ts`. Adding a new source requires adding a pattern.
- **Env var contract:** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be set in `.env.local` locally and in Netlify for builds to succeed.
- **Next.js 16 async params:** Every `page.tsx` with dynamic segments must `await params`. Do not reintroduce sync access.

---

## Never without approval

- **Destructive DB changes:** DROP TABLE, DROP COLUMN, ALTER COLUMN TYPE on a populated column, TRUNCATE, deleting auth users.
- **Auth changes:** modifying `handle_new_user()`, changing RLS policies on profiles, changing middleware protected-route list.
- **Broad refactors:** renaming shared components used in >3 places, restructuring route groups, changing the design token palette.
- **Dependency swaps:** replacing Supabase, Next.js, Tailwind, Leaflet, or any framework-level library. Adding new deps > 100KB.
- **File moves affecting deploy/runtime paths:** moving anything out of `src/app/` or renaming `middleware.ts`, `next.config.ts`, `.env.local` keys.
- **Breaking API/schema changes:** renaming fields in `properties`, `profiles`, or RESO API response shape. Third-party consumers may depend on the RESO endpoint.
- **Secrets:** never commit `.env.local`, service role keys, passwords, or database credentials.

---

## Preferred patterns

- **Server components fetch data, client components handle interaction.** The property detail page is a server component that calls `getPropertyById()` in `lib/queries.ts`; interactive pieces (gallery, calculator, share) are separate client components.
- **Supabase access:** browser → `createClient()` from `lib/supabase.ts`. Server → `createServerSupabaseClient()` from `lib/supabase-server.ts`. Seed scripts → `@supabase/supabase-js` with service role key from env vars.
- **Route protection:** add the path prefix to the `isProtectedRoute` check in `src/middleware.ts`. Do not add auth guards inside individual page components.
- **Styling:** Tailwind utility classes inline. Shared design tokens in `src/app/globals.css` under `@theme`. Dark surface colors: `bg-[#0a0a0f]` (page), `bg-[#161620]` (card), `bg-[#1c1c2e]` (elevated). Gold accent: `#c9a962`. Muted text: `text-[#94a3b8]`. Border: `border-[#2a2a3a]`.
- **Dynamic imports for browser-only libs:** Leaflet must be imported via `next/dynamic({ ssr: false })` from a client wrapper (see `PropertyMapWrapper.tsx`). Do not import `leaflet` in server components.
- **PDF generation:** `@react-pdf/renderer` is lazy-loaded via dynamic import in `FlyerGenerator.tsx` to avoid bloating the main bundle. Follow this pattern for any heavy client-only library.
- **Image generation (social cards):** render React at fixed pixel dimensions, capture with `html-to-image` `toPng()`. Template components are in `src/components/marketing/templates/`.
- **`useSearchParams` requires Suspense:** any client component reading search params must be wrapped in `<Suspense>`. See `src/app/(portal)/my-listings/page.tsx` for the pattern.
- **Sidebar badges:** status counts (favorites, drafts, open houses) are fetched in `Sidebar.tsx`'s `useEffect` keyed on `pathname`. Add new badges by extending that effect, not by adding new fetches in each page.
- **New SQL migrations:** put in `supabase/<name>.sql`. Include `CREATE TABLE IF NOT EXISTS`, indexes, `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, and all RLS policies in one file. User runs it manually in SQL Editor.
- **Seed scripts:** read `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from env. Log success per row. On error, log and continue where safe. Name them `scripts/seed-<feature>.js`.
- **Legal reference docs:** contract features should cite the relevant file in `legal/federal/` or `legal/california/` in code comments so the legal basis is traceable.

---

## Open issues / fragile areas

- **Storage buckets may not exist:** `property-photos`, `documents`, `avatars` must be created manually in the Supabase Storage UI. The `supabase/schema.sql` bottom section has RLS policies to apply after buckets exist.
- **`bathrooms` column type:** may need `ALTER COLUMN bathrooms TYPE numeric(3,1)` to support 2.5 baths. Verify in dashboard before assuming the fix is live.
- **Admin RLS pending:** admin user management requires `CREATE POLICY "Admins can view/update all profiles" ON profiles` — may not be applied yet. Admin dashboard partially works without it (limited to verified profiles).
- **Bathrooms seed bug in `scripts/seed-market-data.js`:** generates invalid UUIDs for `viewer_id`. Insertion falls back to null for those rows. Fix if re-seeding.
- **No automated tests:** all verification is manual via build + smoke test on Netlify. Regressions may not be caught until a user hits them.
- **Middleware deprecation warning:** Next.js 16 prefers `proxy.ts` over `middleware.ts`. Functional but warns on every build.
- **Location API keys not configured:** `WALKSCORE_API_KEY` and `GREATSCHOOLS_API_KEY` are unset in production. Walk Score and School Ratings fall back to deterministic simulated data with visible disclaimers. Census data is live (no key needed).
- **No Stripe wiring:** `/billing` page is UI-only. Upgrade buttons show "Connect Stripe to enable payments". Plan field on profiles is mutable but no enforcement.
- **Next.js 16 `useSearchParams` footgun:** forgetting the Suspense boundary breaks production builds with a prerender error. Netlify catches it but local dev does not.
- **DNS not pointing to onemls.pro:** production URL is still the Netlify subdomain. The apex domain still points to Larry's WordPress prototype.
- **Unsplash demo photos:** sample listings use Unsplash URLs, not Supabase Storage. Real agent-uploaded photos will go to `property-photos` bucket once that is created.
- **`PROJECT_CONTEXT_ONEMLS.md`, `PLAN.md`, `COMPETITIVE_FEATURES.md` duplicate some content in this file.** Treat AGENTS.md as the source of truth; the others are historical/reference.
