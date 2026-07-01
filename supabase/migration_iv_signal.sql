-- IV report: signal + connection fields, and new connection_reports table
-- Run in Supabase Dashboard → SQL Editor

-- iv_reports: ERAS signal
alter table public.iv_reports add column if not exists signal text;
update public.iv_reports set signal = 'none' where signal is null;
alter table public.iv_reports drop constraint if exists iv_reports_signal_check;
alter table public.iv_reports add constraint iv_reports_signal_check check (signal in ('gold', 'silver', 'none'));

-- iv_reports: connection at program
alter table public.iv_reports add column if not exists connection text;
update public.iv_reports set connection = 'none' where connection is null;
alter table public.iv_reports drop constraint if exists iv_reports_connection_check;
alter table public.iv_reports add constraint iv_reports_connection_check check (connection in ('none', 'weak', 'moderate', 'strong'));

-- Standalone connection reports
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

create index if not exists connection_reports_program_code_idx on public.connection_reports (program_code);
create index if not exists connection_reports_created_at_idx on public.connection_reports (created_at desc);

alter table public.connection_reports enable row level security;

drop policy if exists "connection_reports_insert_own" on public.connection_reports;
drop policy if exists "connection_reports_select_own" on public.connection_reports;

create policy "connection_reports_insert_own"
  on public.connection_reports for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "connection_reports_select_own"
  on public.connection_reports for select
  to authenticated
  using (user_id = auth.uid());
