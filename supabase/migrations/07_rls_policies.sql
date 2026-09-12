-- 07_rls_policies.sql
-- Row-level security for every public.* table.
--
-- Pattern:
--   - Catalog tables (brands, products, variants, reviews, qa, promo_codes):
--       SELECT public, INSERT/UPDATE/DELETE admin only.
--   - User-owned tables (profiles, addresses, cart, wishlist, chat, orders, items):
--       SELECT/INSERT/UPDATE/DELETE only on own rows.
--   - is_admin() helper (06_functions.sql) is the bypass for catalog writes.

-- ============================================================================
-- ENABLE RLS
-- ============================================================================
alter table public.brands            enable row level security;
alter table public.products          enable row level security;
alter table public.product_variants  enable row level security;
alter table public.product_reviews   enable row level security;
alter table public.product_qa        enable row level security;
alter table public.promo_codes       enable row level security;

alter table public.profiles          enable row level security;
alter table public.addresses         enable row level security;
alter table public.cart_items        enable row level security;
alter table public.wishlist_items    enable row level security;
alter table public.chat_messages     enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;

-- ============================================================================
-- CATALOG: read public, write admin only
-- ============================================================================

-- brands --------------------------------------------------------------------
drop policy if exists "brands: read public"      on public.brands;
drop policy if exists "brands: admin write"     on public.brands;
create policy "brands: read public"
  on public.brands for select
  using (true);
create policy "brands: admin write"
  on public.brands for all
  using    (public.is_admin())
  with check (public.is_admin());

-- products ------------------------------------------------------------------
drop policy if exists "products: read public"   on public.products;
drop policy if exists "products: admin write"   on public.products;
create policy "products: read public"
  on public.products for select
  using (true);
create policy "products: admin write"
  on public.products for all
  using    (public.is_admin())
  with check (public.is_admin());

-- product_variants ----------------------------------------------------------
drop policy if exists "variants: read public"   on public.product_variants;
drop policy if exists "variants: admin write"   on public.product_variants;
create policy "variants: read public"
  on public.product_variants for select
  using (true);
create policy "variants: admin write"
  on public.product_variants for all
  using    (public.is_admin())
  with check (public.is_admin());

-- product_reviews -----------------------------------------------------------
-- Anyone reads. Authenticated users post their own reviews; admin moderates.
drop policy if exists "reviews: read public"        on public.product_reviews;
drop policy if exists "reviews: insert own"         on public.product_reviews;
drop policy if exists "reviews: update own or admin" on public.product_reviews;
drop policy if exists "reviews: delete own or admin" on public.product_reviews;
create policy "reviews: read public"
  on public.product_reviews for select
  using (true);
create policy "reviews: insert own"
  on public.product_reviews for insert
  with check (auth.uid() = user_id or user_id is null);
create policy "reviews: update own or admin"
  on public.product_reviews for update
  using    (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());
create policy "reviews: delete own or admin"
  on public.product_reviews for delete
  using    (auth.uid() = user_id or public.is_admin());

-- product_qa ----------------------------------------------------------------
drop policy if exists "qa: read public"      on public.product_qa;
drop policy if exists "qa: insert own"       on public.product_qa;
drop policy if exists "qa: update own or admin" on public.product_qa;
drop policy if exists "qa: delete own or admin" on public.product_qa;
create policy "qa: read public"
  on public.product_qa for select
  using (true);
create policy "qa: insert own"
  on public.product_qa for insert
  with check (auth.uid() = user_id or user_id is null);
create policy "qa: update own or admin"
  on public.product_qa for update
  using    (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());
create policy "qa: delete own or admin"
  on public.product_qa for delete
  using    (auth.uid() = user_id or public.is_admin());

-- promo_codes ---------------------------------------------------------------
-- Customers can SELECT active rows to validate at checkout; only admin writes.
drop policy if exists "promo_codes: read public"  on public.promo_codes;
drop policy if exists "promo_codes: admin write"  on public.promo_codes;
create policy "promo_codes: read public"
  on public.promo_codes for select
  using (active = true or public.is_admin());
create policy "promo_codes: admin write"
  on public.promo_codes for all
  using    (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- USER-OWNED: select/insert/update/delete on own rows only
-- ============================================================================

-- profiles ------------------------------------------------------------------
-- A user can read their own row, and any other authenticated user (so the
-- admin panel can list customers). Only the row owner or admin can write.
drop policy if exists "profiles: read self or admin"      on public.profiles;
drop policy if exists "profiles: write self or admin"     on public.profiles;
create policy "profiles: read self or admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());
create policy "profiles: write self or admin"
  on public.profiles for update
  using    (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- addresses -----------------------------------------------------------------
drop policy if exists "addresses: read own"        on public.addresses;
drop policy if exists "addresses: insert own"      on public.addresses;
drop policy if exists "addresses: update own"      on public.addresses;
drop policy if exists "addresses: delete own"      on public.addresses;
create policy "addresses: read own"
  on public.addresses for select
  using (profile_id = auth.uid() or public.is_admin());
create policy "addresses: insert own"
  on public.addresses for insert
  with check (profile_id = auth.uid());
create policy "addresses: update own"
  on public.addresses for update
  using    (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());
create policy "addresses: delete own"
  on public.addresses for delete
  using (profile_id = auth.uid() or public.is_admin());

-- cart_items ----------------------------------------------------------------
drop policy if exists "cart: read own"       on public.cart_items;
drop policy if exists "cart: insert own"     on public.cart_items;
drop policy if exists "cart: update own"     on public.cart_items;
drop policy if exists "cart: delete own"     on public.cart_items;
create policy "cart: read own"
  on public.cart_items for select using (profile_id = auth.uid());
create policy "cart: insert own"
  on public.cart_items for insert with check (profile_id = auth.uid());
create policy "cart: update own"
  on public.cart_items for update
  using    (profile_id = auth.uid())
  with check (profile_id = auth.uid());
create policy "cart: delete own"
  on public.cart_items for delete using (profile_id = auth.uid());

-- wishlist_items ------------------------------------------------------------
drop policy if exists "wishlist: read own"   on public.wishlist_items;
drop policy if exists "wishlist: insert own" on public.wishlist_items;
drop policy if exists "wishlist: delete own" on public.wishlist_items;
create policy "wishlist: read own"
  on public.wishlist_items for select using (profile_id = auth.uid());
create policy "wishlist: insert own"
  on public.wishlist_items for insert with check (profile_id = auth.uid());
create policy "wishlist: delete own"
  on public.wishlist_items for delete using (profile_id = auth.uid());

-- chat_messages -------------------------------------------------------------
drop policy if exists "chat: read own"       on public.chat_messages;
drop policy if exists "chat: insert own"     on public.chat_messages;
create policy "chat: read own"
  on public.chat_messages for select using (profile_id = auth.uid() or public.is_admin());
create policy "chat: insert own"
  on public.chat_messages for insert with check (profile_id = auth.uid());

-- orders --------------------------------------------------------------------
-- Customers read their own orders; admin reads all. Inserts/updates are
-- restricted to the owner (typical flow: client creates order via server RPC
-- or Edge Function; admin can change status).
drop policy if exists "orders: read own or admin"  on public.orders;
drop policy if exists "orders: insert own"        on public.orders;
drop policy if exists "orders: update own or admin" on public.orders;
drop policy if exists "orders: delete admin only" on public.orders;
create policy "orders: read own or admin"
  on public.orders for select
  using (profile_id = auth.uid() or public.is_admin());
create policy "orders: insert own"
  on public.orders for insert
  with check (profile_id = auth.uid());
create policy "orders: update own or admin"
  on public.orders for update
  using    (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());
create policy "orders: delete admin only"
  on public.orders for delete using (public.is_admin());

-- order_items ---------------------------------------------------------------
-- Inherits visibility from parent order. We check by joining, but RLS on
-- UPDATE/INSERT requires the parent order to be writable to the actor.
drop policy if exists "order_items: read parent"  on public.order_items;
drop policy if exists "order_items: insert own"   on public.order_items;
drop policy if exists "order_items: delete admin" on public.order_items;
create policy "order_items: read parent"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
       where o.id = order_items.order_id
         and (o.profile_id = auth.uid() or public.is_admin())
    )
  );
create policy "order_items: insert own"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
       where o.id = order_items.order_id
         and o.profile_id = auth.uid()
    )
  );
create policy "order_items: delete admin"
  on public.order_items for delete using (public.is_admin());

-- ============================================================================
-- END
-- ============================================================================
