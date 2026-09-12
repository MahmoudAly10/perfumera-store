// lib/supabase.ts
// Single Supabase client used everywhere. Reads NEXT_PUBLIC_SUPABASE_URL and
// NEXT_PUBLIC_SUPABASE_ANON_KEY from .env.local (already gitignored).

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const SUPABASE_READY = Boolean(url && anonKey);

export const supabase = SUPABASE_READY
  ? createClient(url, anonKey, {
      auth: {
        persistSession: typeof window !== "undefined",
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (null as unknown as ReturnType<typeof createClient>);

if (typeof window !== "undefined" && !SUPABASE_READY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are missing. " +
      "Add them to perfumeria/.env.local and restart the dev server."
  );
}
