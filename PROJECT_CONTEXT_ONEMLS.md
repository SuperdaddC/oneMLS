# PROJECT_CONTEXT_ONEMLS.md
# Complete Project Context for AI Continuation
# Last updated: 2026-04-06

---

## WHAT IS THIS PROJECT

**OneMLS** is a national MLS (Multiple Listing Service) platform being built by **Mike Colyer** and his best friend **Larry**. The goal is to create a **single MLS for the entire United States**, fully independent of NAR (National Association of Realtors) and all state-level Realtor associations. It's a free-market, low-fee alternative to the 500+ fragmented local MLS systems that charge high fees and require NAR membership.

- **Repo:** `SuperdaddC/oneMLS` (GitHub, private repo)
- **Domain:** onemls.pro (already owned, currently running Larry's WordPress prototype)
- **Live prototype:** https://onemls.pro (WordPress + SQLite, built by Larry using Kimi LLM)
- **Login for WordPress site:** us: Larry, pw: homestar2026

---

## WHO IS BUILDING THIS

- **Mike Colyer** (GitHub: SuperdaddC) - Founder, also building ComplyWithJudy (CA compliance SaaS). Has Supabase expertise. Working from Windows 11 machine.
- **Larry** - Mike's best friend and co-builder. Built the original WordPress prototype locally with Kimi. Focused on the real estate domain knowledge.

---

## KEY BUSINESS DECISIONS MADE

- **Revenue model:** Low flat monthly fee with tiered plans (pricing TBD)
- **Launch markets:** California (primary), Colorado, Florida
- **Who can list:** Licensed agents + verified FSBO sellers
- **Timeline:** 1-2 months to live users
- **Biggest risk:** Understanding each state's contract requirements (different disclosures, forms, rules per state)
- **Post-NAR settlement:** Transparent commissions, no NAR membership required

---

## TECH STACK

| Layer | Technology | Details |
|-------|-----------|---------|
| Frontend | Next.js 16.2.2 | TypeScript, App Router with route groups |
| Styling | Tailwind CSS v4 | `@import "tailwindcss"` syntax |
| Backend/DB | Supabase | Postgres + Auth + Storage + Realtime |
| Auth | Supabase Auth | Email/password, with SSR middleware |
| Hosting | Vercel (planned) | Not yet deployed |
| Payments | Stripe (planned) | Not yet integrated |
| Maps | Mapbox GL JS (planned) | Not yet integrated |
| Domain | onemls.pro | Currently points to WordPress prototype |

---

## SUPABASE PROJECT

- **Project name:** bolt-native-database-58156818 (should be renamed to oneMLS)
- **Project ID/Ref:** `xntomzmazspwsfymhirf`
- **URL:** https://xntomzmazspwsfymhirf.supabase.co
- **Anon key:** In `.env.local` (not committed to repo)
- **Service role key:** Mike has it, not stored in repo
- **Organization:** The Colyer Team LLC
- **Plan:** Pro (paid)
- **Region:** Check dashboard - was having IPv6 connection issues from Windows

### Database Schema (fully deployed)

8 tables with RLS enabled on all:

1. **profiles** - Linked to auth.users via trigger. Fields: id, email, first_name, last_name, phone, role (agent/broker/fsbo/admin), license_number, license_state, brokerage_name, verified, plan, avatar_url
2. **properties** - MLS listings. Auto-generates mls_id like "ONE-2026-000001" via sequence. Fields: address, city, state, zip, price, beds, baths, sqft, property_type, photos, status, commission_rate, days_on_market (auto-computed)
3. **showings** - Showing requests between agents
4. **messages** - Agent-to-agent messaging
5. **contracts** - E-contracts with state-specific rules
6. **cma_reports** - Comparative Market Analysis reports
7. **trades_professionals** - Directory of inspectors, lenders, title companies, etc.
8. **saved_searches** - Saved search criteria with notification frequency

### Triggers
- `on_auth_user_created` -> `handle_new_user()` - Auto-creates profile row when user signs up
- `compute_dom_on_insert/update` -> `compute_days_on_market()` - Auto-calculates days on market
- `profiles_updated_at` / `properties_updated_at` -> `update_updated_at()` - Auto-updates timestamps

### Storage Buckets (NOT yet created)
The schema SQL had `insert into storage.buckets` lines that were removed because Supabase blocks direct SQL inserts to storage tables. These 3 buckets need to be created manually via the Supabase Storage UI:
- `property-photos` (public)
- `documents` (private)
- `avatars` (public)

Storage RLS policies were also NOT applied since they reference buckets that don't exist yet. The policies are in `supabase/schema.sql` at the bottom - apply them after creating the buckets.

---

## CURRENT STATE OF THE CODE

### File Structure
```
onemls/
  .claude/launch.json          - Dev server config
  .env.local                   - Supabase URL + anon key (gitignored)
  PLAN.md                      - Full 6-phase platform plan
  supabase/schema.sql          - Database schema (already deployed)
  src/
    middleware.ts               - Auth middleware (protects portal routes)
    lib/
      supabase.ts               - Browser Supabase client
      supabase-server.ts        - Server Supabase client (SSR)
      types.ts                  - TypeScript interfaces for all tables
    components/
      Sidebar.tsx               - Navigation sidebar (uses real auth data)
    app/
      layout.tsx                - Root layout (Geist font, metadata)
      page.tsx                  - Root "/" redirects to /login
      globals.css               - Full theme CSS (dark luxury theme)
      login/page.tsx            - Login page (wired to Supabase auth)
      register/page.tsx         - Registration (Agent/Broker vs FSBO flow)
      auth/callback/route.ts    - Email verification callback
      (portal)/                 - Route group for authenticated pages
        layout.tsx              - Portal layout (sidebar + header + breadcrumbs)
        dashboard/page.tsx      - Dashboard with stat cards + property grid
        my-listings/page.tsx    - Listings table with Create/Claim
        showings/page.tsx       - Under construction placeholder
        messages/page.tsx       - Coming soon placeholder
        cma/page.tsx            - CMA Reports table
        e-contracts/page.tsx    - Contracts table with sorting
        marketing-materials/page.tsx - Listing selector for materials
        showing-service/page.tsx - Calendar + stats + schedule buttons
        referrals/page.tsx      - Coming soon placeholder
        purchase-leads/page.tsx - Coming soon placeholder
        library/page.tsx        - Tabbed content (Manual, News, MBA)
        trades/page.tsx         - Category cards for trade professionals
        profile/page.tsx        - User profile form
```

### What's Wired to Supabase (Real Data)
- Login (signInWithPassword)
- Registration (signUp with user metadata)
- Auth middleware (route protection)
- Sidebar user display (reads auth.getUser())
- Logout button (signOut)

### What's Still Hardcoded/Static
- ALL portal page content (dashboard stats, property cards, listings tables, etc.) - still using hardcoded sample data, NOT reading from Supabase
- Dashboard stat numbers (Active Listings: 2, Pending: 2, etc.)
- Property cards (1234 S Monaco Parkway, etc.)
- My Listings table rows
- CMA, E-Contracts tables
- Showing Service calendar
- No property CRUD yet
- No public search page yet

---

## WHAT WAS JUST HAPPENING (WHERE WE LEFT OFF)

### Last Action: Fixing the signup trigger

The `handle_new_user()` trigger was failing with "Database error saving new user" when Mike tried to register with:
- Name: Michael Colyer
- Email: mjcolyer@gmail.com
- License: 01842442, California, The Colyer Team

The issue was the enum cast in the trigger function being too brittle. A fixed version of the trigger was provided but **NOT YET APPLIED**. Here is the fix that needs to be run in the Supabase SQL Editor:

```sql
create or replace function handle_new_user()
returns trigger as $$
declare
  user_role_val user_role;
begin
  begin
    user_role_val := (NEW.raw_user_meta_data->>'role')::user_role;
  exception when others then
    user_role_val := 'agent';
  end;

  if user_role_val is null then
    user_role_val := 'agent';
  end if;

  insert into public.profiles (id, email, first_name, last_name, phone, role, license_number, license_state, brokerage_name)
  values (
    NEW.id,
    NEW.email,
    coalesce(NEW.raw_user_meta_data->>'first_name', ''),
    coalesce(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone',
    user_role_val,
    NEW.raw_user_meta_data->>'license_number',
    NEW.raw_user_meta_data->>'license_state',
    NEW.raw_user_meta_data->>'brokerage_name'
  );
  return NEW;
end;
$$ language plpgsql security definer;
```

**ALSO:** After applying the fix, check Supabase Authentication > Users for any orphaned user entry for mjcolyer@gmail.com that was created by auth but failed the profile trigger. Delete it before re-registering.

---

## IMMEDIATE NEXT STEPS (in order)

1. **Apply the trigger fix** (SQL above) and test registration
2. **Delete orphaned auth user** if mjcolyer@gmail.com exists in auth.users without a matching profile
3. **Create storage buckets** manually in Supabase Storage UI (property-photos, documents, avatars)
4. **Apply storage RLS policies** from bottom of schema.sql after buckets exist
5. **Phase 2: Property CRUD** - Create/edit/delete listings with photo upload
6. **Wire dashboard** to real Supabase data instead of hardcoded values
7. **Public search page** with map (Mapbox) and filters
8. **Deploy to Vercel** on onemls.pro

---

## FULL PLATFORM PLAN

See `PLAN.md` in the repo root for the complete 6-phase roadmap:
- Phase 1: Foundation (DONE - Supabase, auth, schema)
- Phase 2: Core Features (property CRUD, search, showings, messaging)
- Phase 3: Compliance & Contracts (state-by-state contract requirements)
- Phase 4: Business Features (Stripe subscriptions, CMA generator, marketing)
- Phase 5: Launch Prep (Vercel deploy, SEO, admin dashboard, email)
- Phase 6: Growth (mobile app, RESO compliance, AI valuation, referrals)

---

## GIT HISTORY

```
ad2931a Add Supabase backend: auth, database schema, and middleware
f841d29 Add full platform plan document for Larry review
5b80b01 Add OneMLS Agent Portal - full recreation of HomeStar Properties
4a643fb Initial commit from Create Next App
```

---

## ENVIRONMENT SETUP

To run locally:
```bash
cd onemls
npm install
# Ensure .env.local exists with:
#   NEXT_PUBLIC_SUPABASE_URL=https://xntomzmazspwsfymhirf.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<the anon key>
npm run dev
```

Dev server runs on http://localhost:3000

### Tools on Mike's Windows Machine
- Node.js v24.13.0
- npm 11.0.0
- Git 2.52.0
- GitHub CLI (gh) installed at "C:\Program Files\GitHub CLI\gh.exe"
- GitHub auth: logged in as SuperdaddC
- No psql installed (used Node.js pg package for DB access attempts)
- Supabase CLI available via npx

### GitHub Authentication
- Credentials stored in Windows Credential Manager
- User: SuperdaddC
- Git config: user.name=SuperdaddC, credential.helper=manager

---

## DESIGN REFERENCE

The UI was recreated from the WordPress site at onemls.pro. Key design tokens:

- **Sidebar:** #0f172a (dark navy), 260px fixed width
- **Background:** #0a0a0f / #0b1120 (dark mode default)
- **Surface cards:** #161620 / #1c1c2e
- **Accent/Gold:** #c9a962 (buttons, highlights)
- **Primary blue:** #3b82f6 (active nav items)
- **Active badge:** Green (#10b981)
- **Pending badge:** Yellow/amber (#f59e0b)
- **Header:** 64px sticky, #111827
- **Font:** Geist (loaded via next/font/google)
- **3 theme variants** exist in CSS (Professional, Modern, Luxury) but only Luxury Dark is active
- **Light/Dark mode** toggle exists in dashboard settings panel

---

## IMPORTANT NOTES FOR NEXT SESSION

1. The Next.js 16 middleware file shows a deprecation warning about using "proxy" instead of "middleware". It still works but may need migration eventually.
2. The `.env.local` is gitignored - the next session needs to ensure it exists with the Supabase credentials.
3. Larry's WordPress prototype is still live at onemls.pro - it will eventually be replaced by the Vercel deployment.
4. The `pg` npm package was installed for direct database access attempts but isn't used in the app - can be removed from dependencies.
5. All portal pages use hardcoded sample data - none are connected to Supabase yet except auth.
6. Mike's memory files are at `C:\Users\ColyerTeam\.claude\projects\C--Users-ColyerTeam-Developer\memory\` - check `project_onemls.md` and `user_mike.md` for context.
