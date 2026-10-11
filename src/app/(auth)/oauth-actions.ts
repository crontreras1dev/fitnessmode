"use server";

import { redirect } from "next/navigation";
import { absoluteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(next: string, failurePath: string) {
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const safeFailurePath = failurePath === "/signup" ? "/signup" : "/login";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: absoluteUrl(`/auth/callback?next=${encodeURIComponent(safeNext)}&source=google`),
    },
  });

  if (error || !data.url) redirect(`${safeFailurePath}?error=oauth`);
  redirect(data.url);
}
