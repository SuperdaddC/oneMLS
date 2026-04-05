# OneMLS - Full Platform Plan: Prototype to Production

## Context

OneMLS is building a **single national MLS independent of NAR and all state-level Realtor associations**. The goal is to prove that the barriers to entry and high fees created by local MLSs are unnecessary by offering an open, low-cost, free-market alternative.

The current state is a WordPress prototype (onemls.pro) built by Larry with Kimi, plus a Next.js UI recreation we just pushed to `SuperdaddC/oneMLS`. We need to go from static UI to a live, data-driven SaaS platform.

**Key decisions:**
- Revenue: Low flat monthly fee (with plan tiers as placeholders for future)
- Launch markets: California (primary), Colorado, Florida
- Who can list: Licensed agents + verified FSBO sellers
- Timeline: 1-2 months to live users
- Biggest risk: Understanding each state's contract requirements

---

## Phase 1: Foundation (Week 1-2)
*Get the backend wired up so data is real*

### 1.1 Supabase Project Setup
- Create Supabase project (Postgres + Auth + Storage + Realtime)
- Configure auth providers (email/password, Google OAuth)
- Set up Storage buckets: `property-photos`, `documents`, `avatars`
- Environment variables in `.env.local`

### 1.2 Database Schema
Core tables:

```
users
  - id (uuid, PK, links to auth.users)
  - email, first_name, last_name, phone
  - role: 'agent' | 'broker' | 'fsbo' | 'admin'
  - license_number, license_state (nullable for FSBO)
  - brokerage_name (nullable for FSBO)
  - verified (boolean - license or identity verified)
  - plan: 'free' | 'basic' | 'pro' | 'enterprise'
  - avatar_url
  - created_at, updated_at

properties
  - id (uuid, PK)
  - mls_id (auto-generated unique national ID, e.g., "ONE-2026-XXXXXX")
  - owner_id (FK -> users)
  - status: 'active' | 'pending' | 'sold' | 'withdrawn' | 'cancelled' | 'draft'
  - address, city, state, zip, county
  - lat, lng (for map search)
  - price, price_history (jsonb)
  - bedrooms, bathrooms, sqft, lot_size, year_built
  - property_type: 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'land' | 'commercial'
  - description, features (jsonb array)
  - photos (jsonb array of storage URLs)
  - virtual_tour_url
  - listing_date, expiration_date
  - days_on_market (computed)
  - showing_instructions
  - commission_rate (what seller is offering buyer's agent)
  - created_at, updated_at

showings
  - id, property_id (FK), requesting_agent_id (FK), listing_agent_id (FK)
  - requested_date, requested_time
  - status: 'pending' | 'approved' | 'denied' | 'completed' | 'cancelled'
  - notes, feedback
  - created_at

messages
  - id, sender_id, recipient_id
  - property_id (nullable - can be general or property-specific)
  - subject, body
  - read (boolean)
  - created_at

contracts
  - id, property_id (FK), agent_id (FK), client_id (FK)
  - contract_type: 'listing_agreement' | 'purchase_offer' | 'counteroffer'
  - state (which state's rules apply)
  - status: 'draft' | 'sent' | 'signed' | 'executed' | 'expired'
  - document_url (storage)
  - created_at, signed_at

cma_reports
  - id, agent_id (FK), property_id (FK)
  - comparable_properties (jsonb - array of property IDs + adjustments)
  - suggested_price, price_range_low, price_range_high
  - report_url (generated PDF in storage)
  - created_at

trades_directory
  - id, name, company, category, phone, email, website
  - state, city, zip
  - verified (boolean)
  - rating, review_count

saved_searches (for agents/buyers)
  - id, user_id, name, criteria (jsonb), notification_frequency
```

### 1.3 Row-Level Security (RLS)
- Agents can only edit their own listings
- Agents can view all active listings (that's the whole point of an MLS)
- FSBO sellers can only manage their own properties
- Admins can manage everything
- Messages only visible to sender/recipient
- Contracts only visible to involved parties

### 1.4 Auth Integration
- Replace the dummy login with Supabase Auth
- Add registration flow (agent vs FSBO)
- License verification placeholder (manual review initially, automate later)
- Protected routes via middleware
- Session management

**Files to modify:**
- `src/app/login/page.tsx` - Wire to Supabase auth
- `src/app/(portal)/layout.tsx` - Add auth guard
- New: `src/lib/supabase.ts` - Client setup
- New: `src/middleware.ts` - Route protection
- New: `src/app/register/page.tsx` - Registration flow

---

## Phase 2: Core Features (Week 2-3)
*Make the portal actually do things*

### 2.1 Property Listing CRUD
- Create listing form (multi-step wizard):
  Step 1: Address + property type
  Step 2: Details (beds, baths, sqft, year, features)
  Step 3: Photos upload (drag & drop, reorder)
  Step 4: Pricing + commission
  Step 5: Showing instructions + review
- Edit listing
- Delete/withdraw listing
- Auto-generate national MLS ID (ONE-2026-XXXXXX)
- Photo upload to Supabase Storage with optimization

### 2.2 Property Search (Public-Facing)
- This is critical - **the public search is how OneMLS gets visibility**
- Map-based search (Mapbox or Google Maps)
- Filter: location, price range, beds, baths, sqft, property type
- Sort: price, date listed, days on market
- Save search with email alerts
- Individual property detail page (shareable URL)
- New: `src/app/search/page.tsx` - Public search page
- New: `src/app/property/[id]/page.tsx` - Public property detail

### 2.3 Showing Management
- Request a showing (pick date/time)
- Listing agent approves/denies
- Email + in-app notifications
- Calendar integration
- Showing feedback form after completion

### 2.4 Messaging
- Agent-to-agent messaging
- Property-specific threads
- Real-time via Supabase Realtime subscriptions
- Unread count badges (already in UI)

**Files to modify/create:**
- All `(portal)/` pages get wired to real Supabase queries
- New: `src/app/search/` - Public search
- New: `src/app/property/[id]/` - Public detail
- New: `src/lib/queries.ts` - Shared data fetching

---

## Phase 3: Compliance & Contracts (Week 3-4)
*The hardest part - state-by-state contract requirements*

### 3.1 State Contract Framework
This is your identified choke point. Strategy:

**Start with 3 states:** CA, CO, FL
- Research each state's required disclosures and contract forms
- Build a contract template system:
  - Base contract fields (universal)
  - State-specific addenda and disclosures
  - Required fields per state (e.g., CA requires TDS, CO requires seller's property disclosure)

### 3.2 Contract Template Engine
- Template storage in database with state mapping
- Form builder that renders correct fields per state
- PDF generation from completed forms
- E-signature integration (placeholder - DocuSign or HelloSign API later)
- Version tracking and audit trail

### 3.3 State Expansion Playbook
- Document the process for adding a new state
- Create a checklist: required forms, disclosures, commission rules, license types
- **TODO:** Research whether RESO data standards can help standardize this
- **TODO:** Legal review needed for each state's requirements

---

## Phase 4: Business Features (Week 4-5)
*Revenue, growth, and agent tools*

### 4.1 Subscription Plans

| Feature | Free | Basic ($X/mo) | Pro ($X/mo) | Enterprise |
|---------|------|---------------|-------------|------------|
| List properties | 1 | 10 | Unlimited | Unlimited |
| Search MLS | Yes | Yes | Yes | Yes |
| CMA reports | - | 3/mo | Unlimited | Unlimited |
| Marketing materials | - | Basic | Premium | Custom |
| Showing service | - | Yes | Yes | Yes |
| Contract management | - | - | Yes | Yes |
| Lead purchasing | - | - | - | Yes |
| Referral network | - | - | Yes | Yes |
| API access | - | - | - | Yes |

*Pricing TBD - placeholder for now*

### 4.2 Payment Integration
- Stripe for subscriptions
- Plan selection during registration
- Billing portal for plan changes
- Usage tracking for metered features

### 4.3 CMA Report Generator
- Select subject property
- Auto-suggest comparable properties (same zip, similar size/beds/price)
- Agent adjusts comps manually
- Generate PDF report with OneMLS branding
- Save to agent's CMA history

### 4.4 Marketing Materials Generator
- Property flyer templates (PDF)
- Social media image cards
- Virtual tour landing page
- QR code generation for print materials
- Pull data from listing automatically

---

## Phase 5: Public Launch Prep (Week 5-6)
*Get production-ready*

### 5.1 Infrastructure
- Supabase Pro plan (for production reliability)
- Vercel deployment for Next.js (or self-host)
- Custom domain: onemls.pro (already owned)
- SSL/TLS (auto with Vercel)
- CDN for property photos
- Database backups (Supabase handles this)

### 5.2 SEO & Public Pages
- Landing page at onemls.pro (marketing site explaining the mission)
- "Why OneMLS?" page - the free market argument against NAR/local MLS monopolies
- Property search pages are SEO-optimized (server-rendered)
- Individual property pages have Open Graph meta for social sharing
- Blog for content marketing

### 5.3 Admin Dashboard
- User management (verify/suspend accounts)
- License verification queue
- Property moderation (flag inappropriate listings)
- Platform analytics (users, listings, showings, revenue)
- State-by-state coverage tracking

### 5.4 Email System
- Transactional emails (welcome, showing requests, messages)
- Listing alerts for saved searches
- SendGrid or Resend integration

### 5.5 Security & Legal
- Terms of Service
- Privacy Policy
- Fair Housing Act compliance notice
- DMCA policy for photos
- Data retention policies
- Rate limiting and abuse prevention

---

## Phase 6: Growth & Differentiation (Month 2+)
*What makes OneMLS win*

### 6.1 The Free Market Advantage
- **No NAR membership required** - any licensed agent can join
- **No board fees** - flat monthly fee, period
- **FSBO friendly** - sellers can list without an agent
- **Transparent commissions** - buyers see what's being offered
- **National scope** - one login, every state, no territorial restrictions

### 6.2 Trades Directory
- Verified professionals directory (inspectors, lenders, title, etc.)
- Reviews and ratings
- Direct booking/contact
- Revenue opportunity: featured listings for pros

### 6.3 Future Features (Backlog)
- [ ] Mobile app (React Native, sharing code with Next.js)
- [ ] MLS data feed API (for syndication to Zillow, Realtor.com etc.)
- [ ] RESO Web API compliance (industry standard data format)
- [ ] Automated license verification via state board APIs
- [ ] AI-powered property valuation (CMA assist)
- [ ] Virtual showing / video tour integration
- [ ] Referral network between agents
- [ ] Lead generation marketplace
- [ ] Mortgage calculator and pre-qual integration
- [ ] Comparative market analytics dashboard

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS |
| Backend/DB | Supabase (Postgres + Auth + Storage + Realtime) |
| Hosting | Vercel |
| Payments | Stripe |
| Email | Resend or SendGrid |
| Maps | Mapbox GL JS |
| PDF Generation | @react-pdf/renderer |
| E-Signatures | DocuSign API (future) |
| Analytics | PostHog or Plausible |
| Domain | onemls.pro |

---

## Immediate Next Steps (What I'll Build First)

1. **Supabase setup** - project, schema, RLS policies
2. **Auth flow** - real login/register with Supabase Auth
3. **Property CRUD** - create/edit/delete listings with photo upload
4. **Wire dashboard** - real data from Supabase instead of hardcoded
5. **Public search page** - map + filters for property discovery
6. **Deploy to Vercel** - get it live on onemls.pro

---

## Open Questions / TODOs

- [ ] **Pricing:** What are the exact plan prices? (Placeholder for now)
- [ ] **Legal:** Need attorney review of ToS, state contract requirements
- [ ] **State contracts:** Need to research CA, CO, FL real estate contract requirements in detail
- [ ] **Commission model:** Post-NAR settlement rules - how does OneMLS handle buyer/seller agent compensation transparency?
- [ ] **Data standards:** Should OneMLS adopt RESO data dictionary for future interoperability?
- [ ] **Larry's role:** Is Larry co-building the backend or focused on other areas?
- [ ] **Branding:** Is the name "HomeStar Properties" staying or is it "OneMLS"?
