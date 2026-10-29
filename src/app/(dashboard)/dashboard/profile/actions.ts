"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getOwnProfile,
  updateProfile,
  updateProfileDetails,
  type OwnProfile,
} from "@/lib/db/profile-mutations";
import { trainerProfilePath } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";
import {
  detailsSchema,
  profileSchema,
  type DetailsFormInput,
  type ProfileFormInput,
} from "@/lib/validation/profile";

function revalidateProfilePages(profile: OwnProfile) {
  revalidatePath(trainerProfilePath(profile));
  if (profile.city) revalidatePath(`/trainers/${profile.city.slug}`);
}

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
    if (profile) revalidateProfilePages(profile);
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

  revalidateProfilePages(profile);
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

  revalidateProfilePages(profile);
  return { ok: true, avatarUrl: null };
}

export async function saveProfileDetails(
  input: DetailsFormInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = detailsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Some fields need another look." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired. Please log in again." };

  const profile = await getOwnProfile(supabase, user.id);
  try {
    await updateProfileDetails(supabase, user.id, parsed.data);
  } catch {
    return { ok: false, error: "We couldn't save your details. Please try again." };
  }
  if (profile) revalidateProfilePages(profile);
  return { ok: true };
}

const MAX_GALLERY_PHOTOS = 8;

type PhotoResult = { ok: true; photo: { id: number; path: string } } | { ok: false; error: string };

/** Records an already-uploaded gallery object; the DB trigger caps galleries at 8. */
export async function saveGalleryPhoto(path: string): Promise<PhotoResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired. Please log in again." };

  const profile = await getOwnProfile(supabase, user.id);
  if (!profile) return { ok: false, error: "Your profile could not be found." };

  // Only objects inside the owner's folder are valid.
  if (!path.startsWith(`${user.id}/`) || path.includes("..")) {
    return { ok: false, error: "We couldn't save your photo. Please try again." };
  }

  if (profile.profile_photos.length >= MAX_GALLERY_PHOTOS) {
    return { ok: false, error: `You can add up to ${MAX_GALLERY_PHOTOS} photos.` };
  }

  const { data, error } = await supabase
    .from("profile_photos")
    .insert({ profile_id: user.id, path, sort_order: profile.profile_photos.length })
    .select("id, path")
    .single();
  if (error || !data) {
    await supabase.storage.from("gallery").remove([path]);
    return { ok: false, error: "We couldn't save your photo. Please try again." };
  }

  revalidateProfilePages(profile);
  return { ok: true, photo: data };
}

export async function removeGalleryPhoto(
  photoId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired. Please log in again." };

  const profile = await getOwnProfile(supabase, user.id);
  if (!profile) return { ok: false, error: "Your profile could not be found." };

  const photo = profile.profile_photos.find((item) => item.id === photoId);
  if (!photo) return { ok: false, error: "That photo could not be found." };

  const { error } = await supabase.from("profile_photos").delete().eq("id", photoId);
  if (error) return { ok: false, error: "We couldn't remove that photo. Please try again." };
  await supabase.storage.from("gallery").remove([photo.path]);

  revalidateProfilePages(profile);
  return { ok: true };
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

  const { data: galleryObjects } = await supabase.storage.from("gallery").list(user.id);
  if (galleryObjects?.length) {
    await supabase.storage
      .from("gallery")
      .remove(galleryObjects.map((object) => `${user.id}/${object.name}`));
  }

  const { error } = await supabase.from("profiles").delete().eq("id", user.id);
  if (error) return { ok: false, error: "We couldn't delete your profile. Please try again." };

  revalidateProfilePages(profile);
  await supabase.auth.signOut();
  redirect("/");
}
