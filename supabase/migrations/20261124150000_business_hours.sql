-- Weekly open/closed hours on the singleton business profile
alter table public.business_profile
  add column if not exists hours jsonb not null default '[]'::jsonb;
