-- Add Step 3, research, and rotation months to existing iv_reports tables
-- Run in Supabase Dashboard → SQL Editor if schema.sql was applied before these columns existed

alter table public.iv_reports add column if not exists step3 text;
alter table public.iv_reports add column if not exists research text;
alter table public.iv_reports add column if not exists rotation_months integer;
