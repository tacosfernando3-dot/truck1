alter table public.business_profile
  add column if not exists gallery_social text not null default 'instagram'
  check (gallery_social in ('instagram', 'facebook', 'tiktok'));
