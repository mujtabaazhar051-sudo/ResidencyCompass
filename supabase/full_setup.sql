-- =============================================================================
-- ResidencyCompass — FULL Supabase setup
-- Paste this ENTIRE file into Supabase Dashboard → SQL Editor → Run
--
-- Includes everything:
--   • iv_reports, community_reports, connection_reports, user_app_state
--   • Step 3, research, rotation months, signal, connection columns
--   • Row-level security (users submit own rows; read own rows on base tables)
--   • iv_reports_public view (Browse Reports tab — no email / user_id)
--
-- Safe to re-run on an existing project (idempotent).
-- =============================================================================

-- ── 1. Base tables (skip if already exist) ───────────────────────────────────

create table if not exists public.iv_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  program_code text not null,
  program_name text,
  cycle text,
  step2 text not null,
  med_school text,
  yog text,
  visa text,
  got_invite text not null check (got_invite in ('yes', 'no')),
  notes text,
  contact_email text
);

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  report_type text not null check (report_type in ('error', 'question', 'suggestion', 'other')),
  program_code text,
  program_name text,
  description text not null,
  contact_email text
);

create table if not exists public.connection_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  program_code text not null,
  program_name text,
  cycle text,
  connection text not null check (connection in ('none', 'weak', 'moderate', 'strong')),
  notes text,
  contact_email text
);

-- ── 2. Add columns that may be missing on older iv_reports ─────────────────

alter table public.iv_reports add column if not exists step3 text;
alter table public.iv_reports add column if not exists research text;
alter table public.iv_reports add column if not exists rotation_months integer;
alter table public.iv_reports add column if not exists signal text;
alter table public.iv_reports add column if not exists connection text;
alter table public.iv_reports add column if not exists eras_regions text[];

-- Backfill so check constraints succeed on old rows
update public.iv_reports set signal = 'none' where signal is null;
update public.iv_reports set connection = 'none' where connection is null;

-- ── 3. Check constraints (drop + re-add so re-run is safe) ───────────────────

alter table public.iv_reports drop constraint if exists iv_reports_signal_check;
alter table public.iv_reports add constraint iv_reports_signal_check
  check (signal in ('gold', 'silver', 'none'));

alter table public.iv_reports drop constraint if exists iv_reports_connection_check;
alter table public.iv_reports add constraint iv_reports_connection_check
  check (connection in ('none', 'weak', 'moderate', 'strong'));

-- ── 4. Indexes ───────────────────────────────────────────────────────────────

create index if not exists iv_reports_program_code_idx on public.iv_reports (program_code);
create index if not exists iv_reports_created_at_idx on public.iv_reports (created_at desc);
create index if not exists connection_reports_program_code_idx on public.connection_reports (program_code);
create index if not exists connection_reports_created_at_idx on public.connection_reports (created_at desc);
create index if not exists community_reports_created_at_idx on public.community_reports (created_at desc);

-- ── 5. Row level security ────────────────────────────────────────────────────

alter table public.iv_reports enable row level security;
alter table public.connection_reports enable row level security;
alter table public.community_reports enable row level security;

-- ── 6. Policies (drop + re-create so re-run is safe) ─────────────────────────

drop policy if exists "iv_reports_insert_own" on public.iv_reports;
drop policy if exists "iv_reports_select_own" on public.iv_reports;
drop policy if exists "connection_reports_insert_own" on public.connection_reports;
drop policy if exists "connection_reports_select_own" on public.connection_reports;
drop policy if exists "community_reports_insert_own" on public.community_reports;
drop policy if exists "community_reports_select_own" on public.community_reports;

create policy "iv_reports_insert_own"
  on public.iv_reports for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "iv_reports_select_own"
  on public.iv_reports for select
  to authenticated
  using (user_id = auth.uid());

create policy "connection_reports_insert_own"
  on public.connection_reports for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "connection_reports_select_own"
  on public.connection_reports for select
  to authenticated
  using (user_id = auth.uid());

create policy "community_reports_insert_own"
  on public.community_reports for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "community_reports_select_own"
  on public.community_reports for select
  to authenticated
  using (user_id = auth.uid());

-- Done. You should see: iv_reports, connection_reports, community_reports, user_app_state

-- ── 7. Signed-in user list backup (profile, signals, connections, notes) ─────

create table if not exists public.user_app_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_app_state enable row level security;

drop policy if exists "user_app_state_select_own" on public.user_app_state;
drop policy if exists "user_app_state_insert_own" on public.user_app_state;
drop policy if exists "user_app_state_update_own" on public.user_app_state;

create policy "user_app_state_select_own"
  on public.user_app_state for select
  to authenticated
  using (user_id = auth.uid());

create policy "user_app_state_insert_own"
  on public.user_app_state for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "user_app_state_update_own"
  on public.user_app_state for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── 8. Public browse view (no email / user_id) ───────────────────────────────

create or replace view public.iv_reports_public as
select
  id,
  created_at,
  program_code,
  program_name,
  cycle,
  step2,
  step3,
  med_school,
  eras_regions,
  yog,
  visa,
  research,
  rotation_months,
  got_invite,
  signal,
  connection,
  notes
from public.iv_reports;

grant select on public.iv_reports_public to anon, authenticated;
