# Perfumeria — Supabase Migrations

SQL migrations for the Perfumeria demo. Run in order against an empty Supabase
Postgres project. After running, your catalog, profile/auth, orders, cart,
wishlist, promo, and chat tables are ready — but **empty** (no seed data).

## File order

| #   | File                  | What it does                                            |
| --- | --------------------- | ------------------------------------------------------- |
| 01  | `01_extensions.sql`   | `pgcrypto`, `citext`, `pg_trgm` extensions              |
| 02  | `02_enums.sql`        | All domain enums (scent_family, gender, etc.)           |
| 03  | `03_tables.sql`       | Every public.* table, FKs, checks, partial uniques      |
| 04  | `04_indexes.sql`      | B-tree + GIN (array overlap) + trigram (fuzzy search)   |
| 05  | `05_triggers.sql`     | `updated_at`, `handle_new_user`, rating recompute       |
| 06  | `06_functions.sql`    | Utility functions (`apply_promo`, `is_admin`, etc.)     |
| 07  | `07_rls_policies.sql` | Row-level security for every table                      |

## How to run

### Option A — Supabase CLI (recommended)

```bash
# from the repo root
supabase init                       # only if you don't have supabase/ yet
supabase link --project-ref <ref>   # link to your Supabase project
supabase db push                    # applies supabase/migrations/* in order
```

### Option B — Supabase Dashboard SQL Editor

1. Open **SQL Editor** in the Supabase Dashboard.
2. Run each file in order: `01_extensions.sql` → `07_rls_policies.sql`.
3. The files are independent enough that you can paste them all in one query.

## After the schema is in

The schema mirrors `perfumeria/lib/types.ts` and the four Zustand stores in
`perfumeria/lib/store.ts` (`cart`, `wishlist`, `auth`, `orders`). To make the
demo run end-to-end you still need:

1. **Wire up the front-end** — replace `lib/store.ts` localStorage persistence
   with `@supabase/supabase-js` calls. Start with auth (`supabase.auth.signIn`
   / `signUp` / `signOut`), then load catalog from `products` + `product_variants`,
   then move cart / wishlist / orders behind Supabase.
2. **Seed the catalog** — INSERTs for the 24 perfumes + 8 brands from
   `perfumeria/lib/data.ts` (ask for `08_seed.sql` if you want me to generate it).
3. **Promote an admin** — after signing up the first admin user, run:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
   That single row unlocks every "admin write" policy in `07_rls_policies.sql`.
4. **Storage buckets** — product images currently live in `perfumeria/public/`.
   When you upload them to Supabase Storage, update the `images text[]` column
   on `products` to point at the bucket URLs.

## Schema highlights

- **`public.profiles`** is 1:1 with `auth.users`. The `trg_on_auth_user_created`
  trigger auto-creates a profile row on signup, so `addresses`, `orders`,
  `cart_items`, etc. always have a valid parent.
- **`public.orders.order_items`** stores a denormalized snapshot
  (`product_name`, `brand_name`, `image`, `variant`, `unit_price`) so historical
  orders don't break if products are later edited or deleted.
- **`public.apply_promo(code, subtotal)`** is an RPC you can call from the
  checkout flow to compute the discount server-side instead of trusting the
  client.
- **`public.is_admin()`** is the single source of truth for "is this user an
  admin?" — used in every catalog-write policy. It reads `profiles.role`.
- **No `pgcrypto` `gen_random_uuid()` calls** inside triggers — all triggers
  use plain SQL. The only place pgcrypto matters is `default gen_random_uuid()`
  on table PKs.

## Rolling back

There's no down migration. If you need to start over, drop the schema in the
Dashboard's **Database → Reset** panel and re-run.
