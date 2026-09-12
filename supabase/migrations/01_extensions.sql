-- 01_extensions.sql
-- Required PostgreSQL extensions for the Perfumeria schema.
-- Run this first.

create extension if not exists "pgcrypto";     -- gen_random_uuid(), crypt()
create extension if not exists "citext";       -- case-insensitive email columns
create extension if not exists "pg_trgm";      -- trigram indexes for fuzzy product search
