-- Orders are written/read only via the service role (bypasses RLS).
-- Explicit deny policies for anon/authenticated satisfy the
-- rls_enabled_no_policy advisor while keeping public API locked out.
-- https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

drop policy if exists "No public access to orders" on public.orders;
drop policy if exists "No public access to order_items" on public.order_items;

create policy "No public access to orders"
  on public.orders
  for all
  to anon, authenticated
  using (false)
  with check (false);

create policy "No public access to order_items"
  on public.order_items
  for all
  to anon, authenticated
  using (false)
  with check (false);
