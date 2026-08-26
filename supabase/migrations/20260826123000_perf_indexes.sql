-- Performance advisors:
-- https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys
-- Cover menu_items.category FK for joins / cascading updates.
--
-- Keep orders_email_idx and order_items_order_id_idx — the app queries by
-- email and order_id; "unused" only means low traffic so far.
-- Prefer email (plain) over lower(email) because we store emails lowercased
-- and PostgREST filters on email = value.

create index if not exists menu_items_category_idx
  on public.menu_items (category);

drop index if exists public.orders_email_idx;
create index if not exists orders_email_idx
  on public.orders (email);
