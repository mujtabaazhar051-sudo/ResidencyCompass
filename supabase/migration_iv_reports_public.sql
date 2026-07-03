-- Public read-only view of interview reports (no email / user_id).
-- Run once in Supabase Dashboard → SQL Editor.

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
