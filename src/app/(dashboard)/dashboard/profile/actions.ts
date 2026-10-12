"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

type AvatarResult = { ok: true; avatarUrl: string | null } | { ok: false; error: string };

export async function saveUploadedAvatar(version: number): Promise<AvatarResult> {
  if (!Number.isSafeInteger(version) || version <= 0) {
    return { ok: false, error: "We couldn't save your photo. Please try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired. Please log in again." };

  const profile = await getOwnProfile(supabase, user.id);
  if (!profile) return { ok: false, error: "Your profile could not be found." };

  const path = `${user.id}/avatar`;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = `${data.publicUrl}?v=${version}`;
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);
  if (error) return { ok: false, error: "We couldn't save your photo. Please try again." };

  revalidatePath(profilePath(profile.city.slug, profile.slug));
  revalidatePath(`/trainers/${profile.city.slug}`);
  return { ok: true, avatarUrl };
}

export async function removeAvatar(): Promise<AvatarResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired. Please log in again." };

  const profile = await getOwnProfile(supabase, user.id);
  if (!profile) return { ok: false, error: "Your profile could not be found." };

  if (profile.avatar_url) {
    const { error: storageError } = await supabase.storage
      .from("avatars")
      .remove([`${user.id}/avatar`]);
    if (storageError) {
      return { ok: false, error: "We couldn't remove your photo. Please try again." };
    }
  }

  const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
  if (error) return { ok: false, error: "We couldn't remove your photo. Please try again." };

  revalidatePath(profilePath(profile.city.slug, profile.slug));
  revalidatePath(`/trainers/${profile.city.slug}`);
  return { ok: true, avatarUrl: null };
}

export async function deleteProfile(confirmation: string): Promise<{ ok: false; error: string }> {
  if (confirmation !== "DELETE") {
    return { ok: false, error: "Type DELETE to confirm profile deletion." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired. Please log in again." };

  const profile = await getOwnProfile(supabase, user.id);
  if (!profile) return { ok: false, error: "Your profile could not be found." };

  if (profile.avatar_url) {
    const { error: storageError } = await supabase.storage
      .from("avatars")
      .remove([`${user.id}/avatar`]);
    if (storageError) {
      return { ok: false, error: "We couldn't delete your profile photo. Please try again." };
    }
  }

  const { error } = await supabase.from("profiles").delete().eq("id", user.id);
  if (error) return { ok: false, error: "We couldn't delete your profile. Please try again." };

  revalidatePath(profilePath(profile.city.slug, profile.slug));
  revalidatePath(`/trainers/${profile.city.slug}`);
  await supabase.auth.signOut();
  redirect("/");
}
