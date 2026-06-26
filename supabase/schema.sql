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
  med_school text,
  yog text,
  visa text,
  got_invite text not null check (got_invite in ('yes', 'no')),
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
create index if not exists community_reports_created_at_idx on public.community_reports (created_at desc);

alter table public.iv_reports enable row level security;
alter table public.community_reports enable row level security;

-- Signed-in users can submit; user_id must match their account
create policy "iv_reports_insert_own"
  on public.iv_reports for insert
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

create policy "community_reports_select_own"
  on public.community_reports for select
  to authenticated
  using (user_id = auth.uid());
