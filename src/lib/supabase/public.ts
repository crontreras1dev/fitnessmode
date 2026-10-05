import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Anonymous, cookie-less client for statically generated / ISR pages, sitemap and
 * generateStaticParams. Returns null when Supabase isn't configured (e.g. CI builds).
 */
export function createPublicClient() {
  if (!isSupabaseConfigured) return null;
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
