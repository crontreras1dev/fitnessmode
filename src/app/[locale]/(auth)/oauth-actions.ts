"use server";

import { getLocale } from "next-intl/server";
import { redirect as nextRedirect } from "next/navigation";
import { getPathname, redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(next: string, failurePath: string) {
  const locale = (await getLocale()) as Locale;
  const fallback = getPathname({ href: "/dashboard", locale });
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : fallback;
  const safeFailurePath = failurePath === "/signup" ? "/signup" : "/login";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: absoluteUrl(`/auth/callback?next=${encodeURIComponent(safeNext)}&source=google`),
    },
  });

  if (error || !data.url) redirect({ href: `${safeFailurePath}?error=oauth`, locale });
  nextRedirect(data.url as string);
}
