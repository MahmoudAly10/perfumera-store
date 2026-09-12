-- 02_enums.sql
-- Domain enums used across the schema. Mirrors lib/types.ts (ScentFamily,
-- Concentration, Gender, ProductCategory, longevity, sillage, OrderStatus).

-- DO block + IF NOT EXISTS makes this safe to re-run.
do $$ begin
  create type scent_family as enum (
    'floral', 'woody', 'citrus', 'oriental', 'fresh',
    'gourmand', 'aquatic', 'green', 'spicy', 'leather',
    'smoky', 'earthy', 'aromatic'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type concentration as enum ('Parfum', 'EDP', 'EDT', 'EDC', 'Body Mist');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gender_t as enum ('men', 'women', 'unisex');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_category as enum (
    'men', 'women', 'unisex', 'niche', 'arabic', 'gift-sets'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type longevity_t as enum ('Light', 'Moderate', 'Long-lasting', 'All-day');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sillage_t as enum ('Intimate', 'Moderate', 'Strong', 'Enormous');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('processing', 'shipped', 'delivered', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type promo_type as enum ('percent', 'fixed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type chat_from as enum ('user', 'bot');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('customer', 'admin', 'manager');
exception when duplicate_object then null; end $$;
