-- 06_functions.sql
-- Utility functions referenced by triggers in 05_triggers.sql.
-- Also exposes a couple of helper RPCs the front-end can call directly.

-- ============================================================================
-- set_updated_at()   -- generic trigger function
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ============================================================================
-- handle_new_user()  -- create a profiles row on auth.users insert
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name',
             split_part(new.email, '@', 1),
             'Customer'),
    upper(coalesce(substring(new.raw_user_meta_data->>'display_name', 1, 1),
                   substring(new.email, 1, 1),
                   'C'))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ============================================================================
-- set_order_number()  -- "PF-YYYY-NNNNNN" human-readable id
-- ============================================================================
create or replace function public.set_order_number()
returns trigger
language plpgsql
as $$
declare
  seq int;
begin
  select coalesce(max(
           substring(order_number from '[0-9]+$')::int
         ), 0) + 1
    into seq
    from public.orders
   where order_number like 'PF-' || to_char(now(), 'YYYY') || '-%';

  new.order_number := 'PF-' || to_char(now(), 'YYYY') || '-' || lpad(seq::text, 6, '0');
  return new;
end;
$$;

-- ============================================================================
-- recompute_product_rating()  -- maintain products.rating + review_count
-- ============================================================================
create or replace function public.recompute_product_rating()
returns trigger
language plpgsql
as $$
declare
  target_id uuid;
begin
  target_id := coalesce(new.product_id, old.product_id);
  update public.products p
     set rating       = coalesce((select avg(rating)::numeric(3,2)
                                    from public.product_reviews
                                   where product_id = target_id), 0),
         review_count = coalesce((select count(*)
                                    from public.product_reviews
                                   where product_id = target_id), 0)
   where p.id = target_id;
  return null;
end;
$$;

-- ============================================================================
-- recompute_product_stock()  -- derive "available stock" from variants - cart
-- ============================================================================
create or replace function public.recompute_product_stock()
returns trigger
language plpgsql
as $$
declare
  target_product uuid;
begin
  target_product := coalesce(new.product_id, old.product_id);
  update public.product_variants v
     set stock = v.stock  -- placeholder; real logic subtracts reserved cart qty
   where v.product_id = target_product;
  return null;
end;
$$;

-- ============================================================================
-- apply_promo(p_code, p_subtotal) -> numeric   -- discount amount in USD
-- ============================================================================
create or replace function public.apply_promo(p_code text, p_subtotal numeric)
returns numeric
language plpgsql
stable
as $$
declare
  p public.promo_codes%rowtype;
begin
  select * into p
    from public.promo_codes
   where code = upper(p_code)
     and active = true
     and expires_at > now();

  if not found then return 0; end if;
  if p_subtotal < p.min_order then return 0; end if;

  return case
    when p.type = 'percent' then round(p_subtotal * (p.value / 100), 2)
    when p.type = 'fixed'   then least(p.value, p_subtotal)
    else 0
  end;
end;
$$;

-- ============================================================================
-- current_user_role() -> user_role   -- read JWT claim safely
-- ============================================================================
create or replace function public.current_user_role()
returns user_role
language sql
stable
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'customer'::user_role
  );
$$;

-- ============================================================================
-- is_admin() -> boolean   -- convenience for RLS policies
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (select role in ('admin', 'manager') from public.profiles where id = auth.uid()),
    false
  );
$$;
