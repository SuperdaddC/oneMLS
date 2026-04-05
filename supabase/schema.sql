-- ============================================================================
-- OneMLS Database Schema
-- Run this in the Supabase SQL Editor to set up the full database.
-- ============================================================================

-- Enable required extensions
create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

create type user_role as enum ('agent', 'broker', 'fsbo', 'admin');
create type user_plan as enum ('free', 'basic', 'pro', 'enterprise');
create type property_status as enum ('active', 'pending', 'sold', 'withdrawn', 'cancelled', 'draft');
create type property_type as enum ('single_family', 'condo', 'townhouse', 'multi_family', 'land', 'commercial');
create type showing_status as enum ('pending', 'approved', 'denied', 'completed', 'cancelled');
create type contract_type as enum ('listing_agreement', 'purchase_offer', 'counteroffer');
create type contract_status as enum ('draft', 'sent', 'signed', 'executed', 'expired');
create type notification_frequency as enum ('instant', 'daily', 'weekly', 'never');

-- ============================================================================
-- SEQUENCES
-- ============================================================================

-- Sequence for auto-generating MLS IDs like ONE-2026-000001
create sequence mls_id_seq start with 1 increment by 1;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Generate MLS ID from sequence: ONE-YYYY-NNNNNN
create or replace function generate_mls_id()
returns text as $$
begin
  return 'ONE-' || extract(year from now())::text || '-' || lpad(nextval('mls_id_seq')::text, 6, '0');
end;
$$ language plpgsql;

-- Compute days on market from listing_date
create or replace function compute_days_on_market()
returns trigger as $$
begin
  if NEW.listing_date is not null then
    NEW.days_on_market := greatest(0, (current_date - NEW.listing_date::date));
  else
    NEW.days_on_market := 0;
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Auto-create profile when a new user signs up via Supabase Auth
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    NEW.id,
    NEW.email,
    coalesce(NEW.raw_user_meta_data->>'first_name', ''),
    coalesce(NEW.raw_user_meta_data->>'last_name', '')
  );
  return NEW;
end;
$$ language plpgsql security definer;

-- Auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles (linked to auth.users)
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  first_name    text not null default '',
  last_name     text not null default '',
  phone         text,
  role          user_role not null default 'agent',
  license_number text,
  license_state  text,
  brokerage_name text,
  verified      boolean not null default false,
  plan          user_plan not null default 'free',
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Properties
create table properties (
  id                  uuid primary key default gen_random_uuid(),
  mls_id              text unique not null default generate_mls_id(),
  owner_id            uuid not null references profiles(id) on delete cascade,
  status              property_status not null default 'draft',
  address             text not null,
  city                text not null,
  state               text not null,
  zip                 text not null,
  county              text,
  lat                 double precision,
  lng                 double precision,
  price               numeric(12,2) not null,
  price_history       jsonb not null default '[]'::jsonb,
  bedrooms            smallint not null default 0,
  bathrooms           smallint not null default 0,
  sqft                integer not null default 0,
  lot_size            integer,
  year_built          smallint,
  property_type       property_type not null default 'single_family',
  description         text,
  features            text[] not null default '{}',
  photos              text[] not null default '{}',
  virtual_tour_url    text,
  listing_date        date not null default current_date,
  expiration_date     date,
  days_on_market      integer not null default 0,
  showing_instructions text,
  commission_rate     numeric(4,2),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Showings
create table showings (
  id                   uuid primary key default gen_random_uuid(),
  property_id          uuid not null references properties(id) on delete cascade,
  requesting_agent_id  uuid not null references profiles(id) on delete cascade,
  listing_agent_id     uuid not null references profiles(id) on delete cascade,
  requested_date       date not null,
  requested_time       time not null,
  status               showing_status not null default 'pending',
  notes                text,
  feedback             text,
  created_at           timestamptz not null default now()
);

-- Messages
create table messages (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references profiles(id) on delete cascade,
  recipient_id  uuid not null references profiles(id) on delete cascade,
  property_id   uuid references properties(id) on delete set null,
  subject       text not null,
  body          text not null,
  read          boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Contracts
create table contracts (
  id              uuid primary key default gen_random_uuid(),
  property_id     uuid not null references properties(id) on delete cascade,
  agent_id        uuid not null references profiles(id) on delete cascade,
  client_id       uuid not null references profiles(id) on delete cascade,
  contract_type   contract_type not null,
  state           text not null,
  status          contract_status not null default 'draft',
  document_url    text,
  created_at      timestamptz not null default now(),
  signed_at       timestamptz
);

-- CMA Reports
create table cma_reports (
  id                      uuid primary key default gen_random_uuid(),
  agent_id                uuid not null references profiles(id) on delete cascade,
  property_id             uuid not null references properties(id) on delete cascade,
  comparable_properties   jsonb not null default '[]'::jsonb,
  suggested_price         numeric(12,2) not null,
  price_range_low         numeric(12,2) not null,
  price_range_high        numeric(12,2) not null,
  report_url              text,
  created_at              timestamptz not null default now()
);

-- Trades Professionals
create table trades_professionals (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  company       text not null,
  category      text not null,
  phone         text,
  email         text,
  website       text,
  state         text not null,
  city          text not null,
  zip           text not null,
  verified      boolean not null default false,
  rating        numeric(2,1) not null default 0,
  review_count  integer not null default 0
);

-- Saved Searches
create table saved_searches (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references profiles(id) on delete cascade,
  name                    text not null,
  criteria                jsonb not null default '{}'::jsonb,
  notification_frequency  notification_frequency not null default 'never'
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Compute days_on_market on insert/update
create trigger compute_dom_on_insert
  before insert on properties
  for each row execute function compute_days_on_market();

create trigger compute_dom_on_update
  before update on properties
  for each row execute function compute_days_on_market();

-- Auto-update updated_at
create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger properties_updated_at
  before update on properties
  for each row execute function update_updated_at();

-- ============================================================================
-- INDEXES
-- ============================================================================

create index idx_properties_state on properties(state);
create index idx_properties_city on properties(city);
create index idx_properties_status on properties(status);
create index idx_properties_price on properties(price);
create index idx_properties_owner_id on properties(owner_id);
create index idx_properties_property_type on properties(property_type);
create index idx_properties_zip on properties(zip);
create index idx_properties_mls_id on properties(mls_id);

create index idx_showings_property_id on showings(property_id);
create index idx_showings_requesting_agent on showings(requesting_agent_id);
create index idx_showings_listing_agent on showings(listing_agent_id);
create index idx_showings_status on showings(status);

create index idx_messages_sender on messages(sender_id);
create index idx_messages_recipient on messages(recipient_id);
create index idx_messages_property on messages(property_id);

create index idx_contracts_property on contracts(property_id);
create index idx_contracts_agent on contracts(agent_id);
create index idx_contracts_client on contracts(client_id);

create index idx_cma_reports_agent on cma_reports(agent_id);
create index idx_cma_reports_property on cma_reports(property_id);

create index idx_trades_professionals_category on trades_professionals(category);
create index idx_trades_professionals_state on trades_professionals(state);
create index idx_trades_professionals_city on trades_professionals(city);

create index idx_saved_searches_user on saved_searches(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table profiles enable row level security;
alter table properties enable row level security;
alter table showings enable row level security;
alter table messages enable row level security;
alter table contracts enable row level security;
alter table cma_reports enable row level security;
alter table trades_professionals enable row level security;
alter table saved_searches enable row level security;

-- ---------------------------------------------------------------------------
-- Profiles: read all verified profiles, update only own
-- ---------------------------------------------------------------------------
create policy "Anyone can view verified profiles"
  on profiles for select
  using (verified = true);

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Properties: anyone reads active, owners CRUD their own
-- ---------------------------------------------------------------------------
create policy "Anyone can view active listings"
  on properties for select
  using (status = 'active');

create policy "Owners can view all their own listings"
  on properties for select
  using (auth.uid() = owner_id);

create policy "Owners can insert their own listings"
  on properties for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their own listings"
  on properties for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners can delete their own listings"
  on properties for delete
  using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- Showings: requesting agent and listing agent can see their showings
-- ---------------------------------------------------------------------------
create policy "Agents can view their showings"
  on showings for select
  using (auth.uid() = requesting_agent_id or auth.uid() = listing_agent_id);

create policy "Agents can request showings"
  on showings for insert
  with check (auth.uid() = requesting_agent_id);

create policy "Listing agents can update showings"
  on showings for update
  using (auth.uid() = listing_agent_id)
  with check (auth.uid() = listing_agent_id);

create policy "Requesting agents can update their showings"
  on showings for update
  using (auth.uid() = requesting_agent_id)
  with check (auth.uid() = requesting_agent_id);

-- ---------------------------------------------------------------------------
-- Messages: only sender and recipient
-- ---------------------------------------------------------------------------
create policy "Users can view their messages"
  on messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users can send messages"
  on messages for insert
  with check (auth.uid() = sender_id);

create policy "Recipients can update messages (mark read)"
  on messages for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- ---------------------------------------------------------------------------
-- Contracts: only involved parties (agent or client)
-- ---------------------------------------------------------------------------
create policy "Involved parties can view contracts"
  on contracts for select
  using (auth.uid() = agent_id or auth.uid() = client_id);

create policy "Agents can create contracts"
  on contracts for insert
  with check (auth.uid() = agent_id);

create policy "Involved parties can update contracts"
  on contracts for update
  using (auth.uid() = agent_id or auth.uid() = client_id)
  with check (auth.uid() = agent_id or auth.uid() = client_id);

-- ---------------------------------------------------------------------------
-- CMA Reports: only the agent who created them
-- ---------------------------------------------------------------------------
create policy "Agents can view their CMA reports"
  on cma_reports for select
  using (auth.uid() = agent_id);

create policy "Agents can create CMA reports"
  on cma_reports for insert
  with check (auth.uid() = agent_id);

create policy "Agents can update their CMA reports"
  on cma_reports for update
  using (auth.uid() = agent_id)
  with check (auth.uid() = agent_id);

create policy "Agents can delete their CMA reports"
  on cma_reports for delete
  using (auth.uid() = agent_id);

-- ---------------------------------------------------------------------------
-- Trades Professionals: anyone can read, admins manage (simplified: all read)
-- ---------------------------------------------------------------------------
create policy "Anyone can view trades professionals"
  on trades_professionals for select
  using (true);

-- ---------------------------------------------------------------------------
-- Saved Searches: only the owning user
-- ---------------------------------------------------------------------------
create policy "Users can view their saved searches"
  on saved_searches for select
  using (auth.uid() = user_id);

create policy "Users can create saved searches"
  on saved_searches for insert
  with check (auth.uid() = user_id);

create policy "Users can update their saved searches"
  on saved_searches for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their saved searches"
  on saved_searches for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage buckets
insert into storage.buckets (id, name, public) values ('property-photos', 'property-photos', true);
insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Storage policies: property-photos (public read, authenticated upload)
create policy "Anyone can view property photos"
  on storage.objects for select
  using (bucket_id = 'property-photos');

create policy "Authenticated users can upload property photos"
  on storage.objects for insert
  with check (bucket_id = 'property-photos' and auth.role() = 'authenticated');

create policy "Users can update their own property photos"
  on storage.objects for update
  using (bucket_id = 'property-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own property photos"
  on storage.objects for delete
  using (bucket_id = 'property-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies: documents (private, only owner)
create policy "Users can view their own documents"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload their own documents"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own documents"
  on storage.objects for delete
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies: avatars (public read, owner upload)
create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
