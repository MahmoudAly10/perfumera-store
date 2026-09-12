-- 09_relax_product_refs.sql
-- Cart/wishlist/order items reference the data.ts product id (e.g. "mn-001"),
-- not the auto-generated products.uuid. Loosen the FK + change column types
-- so the frontend can store the slug/id directly without an extra round-trip.

begin;

-- cart_items.product_id: uuid -> text, drop FK
alter table public.cart_items
  drop constraint if exists cart_items_product_id_fkey;
alter table public.cart_items
  alter column product_id type text using product_id::text;

-- wishlist_items.product_id: uuid -> text, drop FK
alter table public.wishlist_items
  drop constraint if exists wishlist_items_product_id_fkey;
alter table public.wishlist_items
  alter column product_id type text using product_id::text;

-- order_items.product_id: keep nullable uuid (snapshot-style), but allow null + text fallback
alter table public.order_items
  alter column product_id drop not null;
alter table public.order_items
  alter column product_id type text using case when product_id is null then null else product_id::text end;
alter table public.order_items
  drop constraint if exists order_items_product_id_fkey;

commit;
