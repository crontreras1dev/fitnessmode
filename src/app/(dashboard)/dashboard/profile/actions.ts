"use server";

import { revalidatePath } from "next/cache";
import { getOwnProfile, updateProfile } from "@/lib/db/profile-mutations";
import { profilePath } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileFormInput } from "@/lib/validation/profile";

export async function saveProfile(
  input: ProfileFormInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Some fields need another look." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired. Please log in again." };

  const before = await getOwnProfile(supabase, user.id);
  try {
    await updateProfile(supabase, user.id, parsed.data);
  } catch {
    return { ok: false, error: "We couldn't save your profile. Please try again." };
  }
  const after = await getOwnProfile(supabase, user.id);

  for (const profile of [before, after]) {
    if (!profile) continue;
    revalidatePath(profilePath(profile.city.slug, profile.slug));
    revalidatePath(`/trainers/${profile.city.slug}`);
  }
  return { ok: true };
}
