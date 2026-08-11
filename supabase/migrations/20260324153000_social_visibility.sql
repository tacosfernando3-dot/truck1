alter table public.business_profile
  add column if not exists show_instagram boolean not null default true,
  add column if not exists show_facebook boolean not null default true,
  add column if not exists show_tiktok boolean not null default true;
