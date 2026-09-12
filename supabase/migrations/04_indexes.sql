-- 04_indexes.sql
-- Performance indexes for catalog search, filtering, and FK joins.
-- GIN indexes power array overlap (scent_families), trigram powers fuzzy name search.

-- brands --------------------------------------------------------------------
create unique index if not exists uq_brands_slug            on public.brands(slug);

-- products ------------------------------------------------------------------
create unique index if not exists uq_products_slug          on public.products(slug);
create index        if not exists ix_products_brand_id     on public.products(brand_id);
create index        if not exists ix_products_category     on public.products(category);
create index        if not exists ix_products_gender       on public.products(gender);
create index        if not exists ix_products_concentration on public.products(concentration);
create index        if not exists ix_products_bestseller   on public.products(is_bestseller) where is_bestseller;
create index        if not exists ix_products_featured     on public.products(is_featured)   where is_featured;
create index        if not exists ix_products_new          on public.products(is_new)         where is_new;
create index        if not exists ix_products_on_sale      on public.products(is_on_sale)     where is_on_sale;

-- GIN for array operators (scent_families &&, top_notes @>, tags @>)
create index if not exists gin_products_scent_families on public.products using gin (scent_families);
create index if not exists gin_products_tags           on public.products using gin (tags);

-- Trigram for fuzzy name/brand search ("contains" search on shop page)
create index if not exists trgm_products_name on public.products using gin (name gin_trgm_ops);
create index if not exists trgm_products_description on public.products using gin (description gin_trgm_ops);

-- product_variants ----------------------------------------------------------
create index if not exists ix_product_variants_product_id on public.product_variants(product_id);

-- product_reviews -----------------------------------------------------------
create index if not exists ix_product_reviews_product_id on public.product_reviews(product_id);
create index if not exists ix_product_reviews_user_id    on public.product_reviews(user_id);

-- product_qa ----------------------------------------------------------------
create index if not exists ix_product_qa_product_id on public.product_qa(product_id);

-- profiles ------------------------------------------------------------------
create unique index if not exists uq_profiles_email on public.profiles(email);

-- addresses -----------------------------------------------------------------
create index if not exists ix_addresses_profile_id on public.addresses(profile_id);

-- orders --------------------------------------------------------------------
create index if not exists ix_orders_profile_id on public.orders(profile_id);
create index if not exists ix_orders_status     on public.orders(status);
create index if not exists ix_orders_created_at on public.orders(created_at desc);

-- cart / wishlist / chat ----------------------------------------------------
create index if not exists ix_cart_items_profile_id      on public.cart_items(profile_id);
create index if not exists ix_wishlist_items_profile_id  on public.wishlist_items(profile_id);
create index if not exists ix_chat_messages_profile_id   on public.chat_messages(profile_id, msg_at);

-- promo_codes ---------------------------------------------------------------
create index if not exists ix_promo_codes_active_expires on public.promo_codes(active, expires_at);
