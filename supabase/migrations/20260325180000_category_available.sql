alter table public.menu_categories
  add column if not exists available boolean not null default true;
