# PROJECT_CONTEXT_ONEMLS.md
# Complete Project Context for AI Continuation
# Last updated: 2026-04-10

---

## WHAT IS THIS PROJECT

**OneMLS** is a national MLS (Multiple Listing Service) platform being built by **Mike Colyer** and his best friend **Larry**. The goal is to create a **single MLS for the entire United States**, fully independent of NAR (National Association of Realtors) and all state-level Realtor associations. It's a free-market, low-fee alternative to the 500+ fragmented local MLS systems that charge high fees and require NAR membership.

- **Repo:** `SuperdaddC/oneMLS` (GitHub, private repo)
- **Domain:** onemls.pro (already owned, currently running Larry's WordPress prototype)
- **Live prototype:** https://onemls.pro (WordPress + SQLite, built by Larry using Kimi LLM)
- **Login for WordPress site:** us: Larry, pw: homestar2026
- **Deployed app:** https://elaborate-torte-8efa88.netlify.app (Netlify)

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
| Hosting | Netlify | Deployed at elaborate-torte-8efa88.netlify.app |
| Payments | Stripe (planned) | Not yet integrated |
| Maps | Mapbox GL JS | Integrated for public property pages and search |
| Domain | onemls.pro | Currently points to WordPress prototype, needs DNS switch to Netlify |
| Images | Unsplash | Added to next.config.ts remote patterns for sample listing photos |

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

1. **profiles** - Linked to auth.users via trigger. Fields: id, email, first_name, last_name, phone, role (agent/broker/fsbo/admin), license_number, license_state, brokerage_name, verified, plan, avatar_url. **Table was wiped and recreated during this session.**
2. **properties** - MLS listings. Auto-generates mls_id like "ONE-2026-000001" via sequence. Fields: address, city, state, zip, price, beds, baths, sqft, property_type, photos, status, commission_rate, days_on_market (auto-computed). **10 sample listings with photos are loaded.**
3. **showings** - Showing requests between agents
4. **messages** - Agent-to-agent messaging
5. **contracts** - E-contracts with state-specific rules
6. **cma_reports** - Comparative Market Analysis reports
7. **trades_professionals** - Directory of inspectors, lenders, title companies, etc.
8. **saved_searches** - Saved search criteria with notification frequency

### Known Schema Issue
- The `bathrooms` column may need ALTER to `numeric(3,1)` to support half-baths (e.g., 2.5). This change may or may not have been applied - check the column type in the Supabase dashboard.

### Current Users
- **Mike:** mike@thecolyerteam.com / OneMLS2026! (admin, Pro plan)
- **Larry:** larry.homestar@gmail.com / OneMLS2026! (admin, Pro plan)

### Triggers
- `on_auth_user_created` -> `handle_new_user()` - Auto-creates profile row when user signs up. **FIXED:** removed enum cast, now uses column default for role.
- `compute_dom_on_insert/update` -> `compute_days_on_market()` - Auto-calculates days on market
- `profiles_updated_at` / `properties_updated_at` -> `update_updated_at()` - Auto-updates timestamps

### Storage Buckets (status uncertain)
These 3 buckets were requested to be created manually via the Supabase Storage UI. They may or may not have been created yet - check the dashboard:
- `property-photos` (public)
- `documents` (private)
- `avatars` (public)

Storage RLS policies were also NOT applied since they reference buckets that may not exist yet. The policies are in `supabase/schema.sql` at the bottom - apply them after confirming buckets exist.

---

## CURRENT STATE OF THE CODE

### File Structure
```
onemls/
  .claude/launch.json          - Dev server config
  .env.local                   - Supabase URL + anon key (gitignored)
  PLAN.md                      - Full 6-phase platform plan
  supabase/schema.sql          - Database schema (already deployed)
  next.config.ts               - Unsplash added to image remote patterns
  src/
    middleware.ts               - Auth middleware (protects portal routes)
    lib/
      supabase.ts               - Browser Supabase client
      supabase-server.ts        - Server Supabase client (SSR)
      types.ts                  - TypeScript interfaces for all tables
      queries.ts                - Supabase query helpers (NEW)
    components/
      Sidebar.tsx               - Navigation sidebar (uses real auth data)
      PublicNav.tsx              - Public-facing navigation bar (NEW)
      Footer.tsx                - Public-facing footer (NEW)
      PropertyCard.tsx          - Property listing card component (NEW)
      PhotoGallery.tsx          - Property photo gallery/lightbox (NEW)
      MortgageCalculator.tsx    - Mortgage payment calculator (NEW)
      PropertyMap.tsx           - Mapbox single-property map (NEW)
      PropertyMapWrapper.tsx    - Client wrapper for PropertyMap (NEW)
      ShareButton.tsx           - Social share button (NEW)
      HeroSearch.tsx            - Landing page hero search bar (NEW)
      SearchClient.tsx          - Search page client component (NEW)
      SearchMap.tsx             - Search results map component (NEW)
      marketing/               - Marketing materials generators (NEW)
        SocialCardGenerator.tsx - Social media card generator
        FlyerGenerator.tsx      - PDF flyer generator
        QRCodeGenerator.tsx     - QR code generator
        PropertyWebsite.tsx     - Single-property website generator
        templates/              - 4 social card templates + 3 PDF flyer templates
    app/
      layout.tsx                - Root layout (Geist font, metadata)
      page.tsx                  - Landing page (replaced redirect to /login) (CHANGED)
      globals.css               - Full theme CSS (dark luxury theme)
      login/page.tsx            - Login page (wired to Supabase auth)
      register/page.tsx         - Registration (Agent/Broker vs FSBO flow)
      auth/callback/route.ts    - Email verification callback
      property/[id]/page.tsx    - Public property detail page (NEW)
      search/page.tsx           - Public property search with map (NEW)
      (portal)/                 - Route group for authenticated pages
        layout.tsx              - Portal layout (sidebar + header + breadcrumbs)
        dashboard/page.tsx      - Dashboard with stat cards + property grid
        my-listings/page.tsx    - Listings table with Create/Claim
        showings/page.tsx       - Under construction placeholder
        messages/page.tsx       - Coming soon placeholder
        cma/page.tsx            - CMA Reports table
        e-contracts/page.tsx    - Contracts table with sorting
        marketing-materials/page.tsx - Listing selector for materials (UPDATED)
        showing-service/page.tsx - Calendar + stats + schedule buttons
        referrals/page.tsx      - Coming soon placeholder
        purchase-leads/page.tsx - Coming soon placeholder
        library/page.tsx        - Tabbed content (Manual, News, MBA)
        trades/page.tsx         - Category cards for trade professionals
        profile/page.tsx        - User profile form
```

### What's Wired to Supabase (Real Data)
- Login (signInWithPassword)
- Registration (signUp with user metadata, trigger fixed)
- Auth middleware (route protection)
- Sidebar user display (reads auth.getUser())
- Logout button (signOut)
- Public property page (reads from properties table via queries.ts)
- Public search page (queries properties with filters)
- Landing page hero search
- 10 sample listings loaded with Unsplash photos

### What's Still Hardcoded/Static
- Most portal page content (dashboard stats, listings tables, etc.) - still using hardcoded sample data
- Dashboard stat numbers (Active Listings: 2, Pending: 2, etc.)
- My Listings table rows
- CMA, E-Contracts tables
- Showing Service calendar
- No property CRUD forms yet (create/edit/delete)
- Showings and Messages not yet functional

---

## WHAT WAS JUST HAPPENING (WHERE WE LEFT OFF)

### Last Session: All 5 Marketing Phases Completed

All 5 marketing/public-facing phases have been built and deployed:

1. **Infrastructure** - queries.ts, PublicNav, Footer, PropertyCard components
2. **Public Property Page** - `/property/[id]` with PhotoGallery, MortgageCalculator, PropertyMap, ShareButton
3. **Landing Page** - Replaced the `redirect("/login")` at root with a full landing page featuring HeroSearch
4. **Marketing Materials Generator** - SocialCardGenerator, FlyerGenerator, QRCodeGenerator, PropertyWebsite with 4 social card templates and 3 PDF flyer templates
5. **Public Search** - `/search` page with SearchClient, SearchMap, filters, and Mapbox integration

### Other Key Changes This Session
- The `handle_new_user()` trigger was fixed (removed enum cast, uses column default for role)
- The profiles table was wiped and recreated with Mike and Larry as admin users
- Unsplash added to next.config.ts image remote patterns for sample listing photos
- 10 sample listings with photos loaded into the database
- App deployed to Netlify at https://elaborate-torte-8efa88.netlify.app

---

## IMMEDIATE NEXT STEPS (in order)

1. **Deploy to onemls.pro** - Point DNS from WordPress to Netlify deployment
2. **Verify storage buckets** - Check if property-photos, documents, avatars were created in Supabase Storage UI; create if not
3. **Verify bathrooms column** - Check if ALTER to numeric(3,1) was applied; apply if not
4. **Apply storage RLS policies** from bottom of schema.sql after confirming buckets exist
5. **Property CRUD** - Build create/edit/delete listing forms with photo upload in the portal
6. **Wire dashboard** to real Supabase data instead of hardcoded values
7. **Build remaining portal features** - Showings management, agent-to-agent messaging
8. **Add Stripe payments** - Subscription billing for plans
9. **State contract compliance** - State-by-state contract requirements for CA, CO, FL

---

## FULL PLATFORM PLAN

See `PLAN.md` in the repo root for the complete 6-phase roadmap:
- Phase 1: Foundation (DONE - Supabase, auth, schema)
- Phase 2: Core Features (PARTIAL - public search and property pages done, property CRUD/showings/messaging still needed)
- Phase 3: Compliance & Contracts (state-by-state contract requirements)
- Phase 4: Business Features (PARTIAL - marketing materials done, Stripe/CMA still needed)
- Phase 5: Launch Prep (PARTIAL - deployed to Netlify, DNS switch and SEO still needed)
- Phase 6: Growth (mobile app, RESO compliance, AI valuation, referrals)

### Marketing Phases (all 5 COMPLETE)
1. Infrastructure (queries.ts, PublicNav, Footer, PropertyCard)
2. Public Property Page (/property/[id])
3. Landing Page (replaced root redirect)
4. Marketing Materials Generator (social cards, flyers, QR codes, property websites)
5. Public Search (/search with map and filters)

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
3. Larry's WordPress prototype is still live at onemls.pro - DNS needs to be switched to point to Netlify (elaborate-torte-8efa88.netlify.app).
4. The `pg` npm package was installed for direct database access attempts but isn't used in the app - can be removed from dependencies.
5. Most portal pages still use hardcoded sample data. Public pages (property detail, search, landing) are wired to Supabase.
6. Mike's memory files are at `C:\Users\ColyerTeam\.claude\projects\C--Users-ColyerTeam-Developer\memory\` - check `project_onemls.md` and `user_mike.md` for context.
7. The profiles table was wiped and recreated this session - only Mike and Larry exist as users. Any previous test accounts are gone.
8. Storage buckets (property-photos, documents, avatars) may or may not have been created - check Supabase dashboard before assuming they exist.
9. The bathrooms column ALTER to numeric(3,1) may or may not have been applied - verify in Supabase dashboard.
10. Unsplash is configured as an allowed image domain in next.config.ts for the sample listing photos.
