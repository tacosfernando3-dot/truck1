-- Los Compadres / Street Flavor — menu, CMS, orders, payments

create extension if not exists "pgcrypto";

-- ─── Menu & CMS ───────────────────────────────────────────────────────────────

create table if not exists public.menu_categories (
  name text primary key,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id text primary key,
  name text not null,
  category text not null references public.menu_categories (name) on update cascade,
  description text not null default '',
  long_description text not null default '',
  price numeric(10, 2) not null default 0,
  image text not null default '',
  featured boolean not null default false,
  serves text,
  heat text check (heat is null or heat in ('mild', 'medium', 'hot')),
  includes jsonb not null default '[]'::jsonb,
  allergens jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id text primary key,
  alt text not null default '',
  image text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.business_profile (
  id smallint primary key default 1 check (id = 1),
  name text not null default '',
  short_name text not null default '',
  handle text not null default '',
  phone text not null default '',
  email text not null default '',
  cuisine text not null default '',
  price_range text not null default '$$',
  instagram text not null default '',
  facebook text not null default '',
  tiktok text not null default '',
  street_address text not null default '',
  city text not null default '',
  state text not null default '',
  zip text not null default '',
  footer_blurb text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.business_profile (id) values (1)
on conflict (id) do nothing;

-- ─── Orders & payments ────────────────────────────────────────────────────────

create table if not exists public.orders (
  id text primary key,
  email text not null,
  customer_name text not null default '',
  status text not null default 'paid'
    check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  subtotal numeric(10, 2) not null,
  tax numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  currency text not null default 'usd',
  payment_provider text not null default 'simulator'
    check (payment_provider in ('simulator', 'stripe')),
  payment_status text not null default 'succeeded'
    check (payment_status in ('pending', 'succeeded', 'failed', 'refunded')),
  payment_intent_id text,
  card_last4 text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_email_idx on public.orders (lower(email));
create index if not exists orders_created_at_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders (id) on delete cascade,
  menu_item_id text,
  name text not null,
  unit_price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  image text,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.gallery_items enable row level security;
alter table public.business_profile enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public read for menu/CMS (anon). Writes go through service role (bypasses RLS).
create policy "Public read menu categories"
  on public.menu_categories for select
  to anon, authenticated
  using (true);

create policy "Public read available menu items"
  on public.menu_items for select
  to anon, authenticated
  using (available = true);

create policy "Public read gallery"
  on public.gallery_items for select
  to anon, authenticated
  using (true);

create policy "Public read business"
  on public.business_profile for select
  to anon, authenticated
  using (true);

-- Orders: no anon/authenticated access (explicit deny policies in
-- 20260826120000_orders_rls_policies.sql). Server uses service role key.
