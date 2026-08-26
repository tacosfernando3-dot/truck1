-- Site inquiries: contact, catering, newsletter
-- Written/read via service role only (same pattern as orders).

create table if not exists public.site_messages (
  id uuid primary key default gen_random_uuid(),
  department text not null
    check (department in ('contact', 'catering', 'newsletter')),
  full_name text,
  email text not null,
  phone text,
  message text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'new'
    check (status in ('new', 'read', 'archived')),
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists site_messages_department_created_idx
  on public.site_messages (department, created_at desc);

create index if not exists site_messages_status_created_idx
  on public.site_messages (status, created_at desc);

create index if not exists site_messages_email_idx
  on public.site_messages (email);

alter table public.site_messages enable row level security;

drop policy if exists "No public access to site_messages" on public.site_messages;

create policy "No public access to site_messages"
  on public.site_messages
  for all
  to anon, authenticated
  using (false)
  with check (false);
