import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getOwnProfile } from "@/lib/db/profile-mutations";
import { createClient } from "@/lib/supabase/server";

/** Signed-in trainer + their profile (redirects to signup when the profile doesn't exist yet). */
export const requireOwnProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");
  const profile = await getOwnProfile(supabase, user.id);
  if (!profile) redirect("/signup");
  return { supabase, user, profile };
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
