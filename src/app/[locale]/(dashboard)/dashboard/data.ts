import "server-only";
import { cache } from "react";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getOwnProfile } from "@/lib/db/profile-mutations";
import { createClient } from "@/lib/supabase/server";

/** Signed-in trainer + their profile (redirects to signup when the profile doesn't exist yet). */
export const requireOwnProfile = cache(async () => {
  const locale = (await getLocale()) as Locale;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // i18n redirect() doesn't narrow types, so assert after the guard.
  if (!user) redirect({ href: "/login?next=/dashboard", locale });
  const profile = await getOwnProfile(supabase, user!.id);
  if (!profile) redirect({ href: "/signup", locale });
  return { supabase, user: user!, profile: profile! };
});

export async function getStats(days = 30) {
  const { supabase } = await requireOwnProfile();
  const [daily, breakdown] = await Promise.all([
    supabase.rpc("get_profile_stats", { p_days: days }),
    supabase.rpc("get_profile_click_breakdown", { p_days: days }),
  ]);
  const rows = daily.data ?? [];
  return {
    daily: rows,
    breakdown: breakdown.data ?? [],
    totalViews: rows.reduce((sum, row) => sum + Number(row.views), 0),
    totalClicks: rows.reduce((sum, row) => sum + Number(row.clicks), 0),
  };
}
