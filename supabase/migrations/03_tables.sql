-- 03_tables.sql
-- Core tables. Mirrors lib/types.ts and the persisted Zustand stores in lib/store.ts.
-- All tables have updated_at + created_at where it makes sense; updated_at triggers
-- are added in 05_triggers.sql.

-- ============================================================================
-- CATALOG (read-mostly, public)
-- ============================================================================

create table if not exists public.brands (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  logo_url     text,
  description  text not null default '',
  country      text not null default '',
  founded      int,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name           text not null,
  brand_id       uuid not null references public.brands(id) on delete restrict,
  category       product_category not null,
  gender         gender_t not null,
  concentration  concentration not null,
  scent_families scent_family[] not null default '{}',
  description    text not null default '',
  brand_story    text not null default '',
  top_notes      text[] not null default '{}',
  heart_notes    text[] not null default '{}',
  base_notes     text[] not null default '{}',
  longevity      longevity_t not null,
  sillage        sillage_t not null,
  rating         numeric(3,2) not null default 0 check (rating >= 0 and rating <= 5),
  review_count   int not null default 0 check (review_count >= 0),
  is_new         boolean not null default false,
  is_bestseller  boolean not null default false,
  is_featured    boolean not null default false,
  is_on_sale     boolean not null default false,
  original_price numeric(10,2),
  tags           text[] not null default '{}',
  images         text[] not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.product_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size       text not null,                 -- "30ml", "50ml", "100ml"
  price      numeric(10,2) not null check (price >= 0),
  stock      int not null default 0 check (stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size)
);

create table if not exists public.product_reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete set null,
  user_name  text not null,                  -- displayed even if user deleted
  avatar     text,
  rating     int not null check (rating between 1 and 5),
  review_date date not null default current_date,
  title      text not null default '',
  body       text not null default '',
  photos     text[] not null default '{}',
  verified   boolean not null default false,
  helpful    int not null default 0 check (helpful >= 0),
  unhelpful  int not null default 0 check (unhelpful >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_qa (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  user_name   text not null,
  question    text not null,
  answer      text,
  answered_by text,                          -- staff display name
  qa_date     date not null default current_date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.promo_codes (
  code         text primary key,
  type         promo_type not null,
  value        numeric(10,2) not null check (value > 0),
  min_order    numeric(10,2) not null default 0 check (min_order >= 0),
  description  text not null default '',
  expires_at   timestamptz not null,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================================
-- PROFILES + ADDRESSES  (1:1 with auth.users, plus 1:N addresses)
-- ============================================================================

-- One row per Supabase auth.users row. profile_role drives admin RLS bypass.
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               citext unique,
  display_name        text not null default '',
  avatar              text,
  phone               text,
  preferred_families  scent_family[] not null default '{}',
  receive_newsletter  boolean not null default true,
  role                user_role not null default 'customer',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  label       text not null default 'Home',     -- "Home", "Work", ...
  street      text not null default '',
  city        text not null default '',
  state       text not null default '',
  zip         text not null default '',
  country     text not null default '',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Only one default address per profile.
create unique index if not exists uq_addresses_default_per_profile
  on public.addresses (profile_id)
  where is_default;

-- ============================================================================
-- CART, WISHLIST, CHAT  (per-user, transient-but-persisted)
-- ============================================================================

create table if not exists public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  variant     text not null,
  quantity    int not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (profile_id, product_id, variant)
);

create table if not exists public.wishlist_items (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (profile_id, product_id)
);

create table if not exists public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  from_who    chat_from not null,
  text        text not null,
  msg_at      timestamptz not null default now()
);

-- ============================================================================
-- ORDERS
-- ============================================================================

create table if not exists public.orders (
  id                    uuid primary key default gen_random_uuid(),
  profile_id            uuid not null references public.profiles(id) on delete restrict,
  order_number          text unique not null,           -- human-readable e.g. "PF-2026-000123"
  status                order_status not null default 'processing',
  subtotal              numeric(10,2) not null default 0 check (subtotal >= 0),
  shipping              numeric(10,2) not null default 0 check (shipping >= 0),
  tax                   numeric(10,2) not null default 0 check (tax >= 0),
  discount              numeric(10,2) not null default 0 check (discount >= 0),
  total                 numeric(10,2) not null default 0 check (total >= 0),
  payment_method        text not null default '',
  shipping_address_id   uuid references public.addresses(id) on delete set null,
  promo_code            text references public.promo_codes(code) on delete set null,
  tracking_number       text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Snapshot of each line at time of purchase. product_name/brand/image/variant
-- are denormalized so historical orders don't break if products are edited.
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  brand_name   text not null default '',
  image        text not null default '',
  variant      text not null default '',
  quantity     int not null check (quantity > 0),
  unit_price   numeric(10,2) not null check (unit_price >= 0),
  created_at   timestamptz not null default now()
);

create index if not exists ix_order_items_order_id on public.order_items(order_id);
