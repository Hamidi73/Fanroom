// Service-role Supabase client for trusted server-only work (payment webhooks).
// This BYPASSES row-level security, so it must NEVER be imported into client
// code or used with user-supplied intent without your own checks. Returns null
// if the service-role key isn't configured.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!cached) {
    cached = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return cached;
}
