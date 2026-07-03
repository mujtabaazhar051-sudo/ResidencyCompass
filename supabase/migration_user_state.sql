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
