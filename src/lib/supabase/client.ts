import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/db/types";
import { assertSupabaseEnv } from "./env";

export function createClient() {
  const { url, anonKey } = assertSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
