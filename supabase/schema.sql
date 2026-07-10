-- ResidencyCompass community submissions
-- Run in Supabase Dashboard → SQL Editor (once per project)

-- Interview invite reports
create table if not exists public.iv_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  program_code text not null,
  program_name text,
  cycle text,
  step2 text not null,
  step3 text,
  med_school text,
  eras_regions text[],
  yog text,
  visa text,
  research text,
  rotation_months integer,
  got_invite text not null check (got_invite in ('yes', 'no')),
  signal text not null check (signal in ('gold', 'silver', 'none')),
  connection text not null check (connection in ('none', 'weak', 'moderate', 'strong')),
  notes text,
  contact_email text
);

-- Connection strength reports (standalone, without IV data)
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

-- Data corrections, questions, suggestions
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

create index if not exists iv_reports_program_code_idx on public.iv_reports (program_code);
create index if not exists iv_reports_created_at_idx on public.iv_reports (created_at desc);
create index if not exists connection_reports_program_code_idx on public.connection_reports (program_code);
create index if not exists connection_reports_created_at_idx on public.connection_reports (created_at desc);
create index if not exists community_reports_created_at_idx on public.community_reports (created_at desc);

alter table public.iv_reports enable row level security;
alter table public.connection_reports enable row level security;
alter table public.community_reports enable row level security;

-- Policies (safe to re-run)
drop policy if exists "iv_reports_insert_own" on public.iv_reports;
drop policy if exists "connection_reports_insert_own" on public.connection_reports;
drop policy if exists "connection_reports_select_own" on public.connection_reports;
drop policy if exists "community_reports_insert_own" on public.community_reports;
drop policy if exists "iv_reports_select_own" on public.iv_reports;
drop policy if exists "community_reports_select_own" on public.community_reports;

-- Signed-in users can submit; user_id must match their account
create policy "iv_reports_insert_own"
  on public.iv_reports for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "connection_reports_insert_own"
  on public.connection_reports for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "community_reports_insert_own"
  on public.community_reports for insert
  to authenticated
  with check (user_id = auth.uid());

-- Users can read only their own submissions (aggregates use service role / admin later)
create policy "iv_reports_select_own"
  on public.iv_reports for select
  to authenticated
  using (user_id = auth.uid());

create policy "connection_reports_select_own"
  on public.connection_reports for select
  to authenticated
  using (user_id = auth.uid());

create policy "community_reports_select_own"
  on public.community_reports for select
  to authenticated
  using (user_id = auth.uid());

-- Signed-in users: cloud backup of profile, signals, connections, notes, etc.
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

-- Public browse view (no contact_email or user_id) — see migration_iv_reports_public.sql
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
