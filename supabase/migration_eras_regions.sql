-- Add ERAS geographic preferences to IV reports.
-- Run once in Supabase Dashboard → SQL Editor.
-- Drop the public view first when column lists change (CREATE OR REPLACE cannot rename view columns).

alter table public.iv_reports
  add column if not exists eras_regions text[];

drop view if exists public.iv_reports_public;

create view public.iv_reports_public as
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
