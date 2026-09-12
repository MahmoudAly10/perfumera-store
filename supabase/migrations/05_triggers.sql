-- 05_triggers.sql
-- Auto-update updated_at on every UPDATE, and auto-create a profile row when
-- a new auth.users row is created. Functions live in 06_functions.sql.

-- updated_at trigger -------------------------------------------------------
create trigger trg_brands_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger trg_product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

create trigger trg_product_reviews_updated_at
  before update on public.product_reviews
  for each row execute function public.set_updated_at();

create trigger trg_product_qa_updated_at
  before update on public.product_qa
  for each row execute function public.set_updated_at();

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_addresses_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

create trigger trg_cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger trg_promo_codes_updated_at
  before update on public.promo_codes
  for each row execute function public.set_updated_at();

-- auth.users -> public.profiles --------------------------------------------
-- Whenever a Supabase auth user signs up, create a matching profiles row so
-- RLS-owning tables (addresses, orders, cart, wishlist, chat) have a parent.

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Order number generator ----------------------------------------------------
-- Auto-fill orders.order_number on insert if app didn't pass one.
create trigger trg_orders_set_number
  before insert on public.orders
  for each row
  when (new.order_number is null or new.order_number = '')
  execute function public.set_order_number();

-- Recompute product rating/count when a review is added, edited, or deleted --
create trigger trg_product_reviews_recompute
  after insert or update or delete on public.product_reviews
  for each row execute function public.recompute_product_rating();

-- Recompute product stock when cart quantity changes -------------------------
-- (Cart items are reservations, not final deductions. Real stock deduction
-- happens in the checkout/order-placement flow; this trigger keeps a derived
-- "available stock" accurate for display. Adjust to your business logic.)
create trigger trg_cart_items_recompute
  after insert or update or delete on public.cart_items
  for each row execute function public.recompute_product_stock();
