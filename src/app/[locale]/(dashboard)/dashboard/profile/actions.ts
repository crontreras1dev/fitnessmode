"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  getOwnProfile,
  updateProfile,
  updateProfileDetails,
  type OwnProfile,
} from "@/lib/db/profile-mutations";
import { trainerProfilePath } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";
import {
  buildDetailsSchema,
  buildProfileSchema,
  type DetailsFormInput,
  type ProfileFormInput,
} from "@/lib/validation/profile";

function revalidateProfilePages(profile: OwnProfile) {
  revalidatePath(trainerProfilePath(profile));
  if (profile.city) revalidatePath(`/trainers/${profile.city.slug}`);
  revalidatePath(`/es${trainerProfilePath(profile)}`);
  if (profile.city) revalidatePath(`/es/trainers/${profile.city.slug}`);
}

export async function saveProfile(
  input: ProfileFormInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const [t, tv] = await Promise.all([getTranslations("errors"), getTranslations("validation")]);
  const parsed = buildProfileSchema(tv).safeParse(input);
  if (!parsed.success) return { ok: false, error: t("reviewFields") };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: t("sessionExpired") };

  const before = await getOwnProfile(supabase, user.id);
  try {
    await updateProfile(supabase, user.id, parsed.data);
  } catch {
    return { ok: false, error: t("saveProfile") };
  }
  const after = await getOwnProfile(supabase, user.id);

  for (const profile of [before, after]) {
    if (profile) revalidateProfilePages(profile);
  }
  return { ok: true };
}

type AvatarResult = { ok: true; avatarUrl: string | null } | { ok: false; error: string };

export async function saveUploadedAvatar(version: number): Promise<AvatarResult> {
  const t = await getTranslations("errors");
  if (!Number.isSafeInteger(version) || version <= 0) {
    return { ok: false, error: t("savePhoto") };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: t("sessionExpired") };

  const profile = await getOwnProfile(supabase, user.id);
  if (!profile) return { ok: false, error: t("profileNotFound") };

  const path = `${user.id}/avatar`;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = `${data.publicUrl}?v=${version}`;
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);
  if (error) return { ok: false, error: t("savePhoto") };

  revalidateProfilePages(profile);
  return { ok: true, avatarUrl };
}

export async function removeAvatar(): Promise<AvatarResult> {
  const t = await getTranslations("errors");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: t("sessionExpired") };

  const profile = await getOwnProfile(supabase, user.id);
  if (!profile) return { ok: false, error: t("profileNotFound") };

  if (profile.avatar_url) {
    const { error: storageError } = await supabase.storage
      .from("avatars")
      .remove([`${user.id}/avatar`]);
    if (storageError) {
      return { ok: false, error: t("removePhoto") };
    }
  }

  const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
  if (error) return { ok: false, error: t("removePhoto") };

  revalidateProfilePages(profile);
  return { ok: true, avatarUrl: null };
}

export async function saveProfileDetails(
  input: DetailsFormInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const [t, tv] = await Promise.all([getTranslations("errors"), getTranslations("validation")]);
  const parsed = buildDetailsSchema(tv).safeParse(input);
  if (!parsed.success) return { ok: false, error: t("reviewFields") };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: t("sessionExpired") };

  const profile = await getOwnProfile(supabase, user.id);
  try {
    await updateProfileDetails(supabase, user.id, parsed.data);
  } catch {
    return { ok: false, error: t("saveDetails") };
  }
  if (profile) revalidateProfilePages(profile);
  return { ok: true };
}

const MAX_GALLERY_PHOTOS = 8;

type PhotoResult = { ok: true; photo: { id: number; path: string } } | { ok: false; error: string };

/** Records an already-uploaded gallery object; the DB trigger caps galleries at 8. */
export async function saveGalleryPhoto(path: string): Promise<PhotoResult> {
  const t = await getTranslations("errors");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: t("sessionExpired") };

  const profile = await getOwnProfile(supabase, user.id);
  if (!profile) return { ok: false, error: t("profileNotFound") };

  // Only objects inside the owner's folder are valid.
  if (!path.startsWith(`${user.id}/`) || path.includes("..")) {
    return { ok: false, error: t("savePhoto") };
  }

  if (profile.profile_photos.length >= MAX_GALLERY_PHOTOS) {
    return { ok: false, error: t("tooManyPhotos", { max: MAX_GALLERY_PHOTOS }) };
  }

  const { data, error } = await supabase
    .from("profile_photos")
    .insert({ profile_id: user.id, path, sort_order: profile.profile_photos.length })
    .select("id, path")
    .single();
  if (error || !data) {
    await supabase.storage.from("gallery").remove([path]);
    return { ok: false, error: t("savePhoto") };
  }

  revalidateProfilePages(profile);
  return { ok: true, photo: data };
}

export async function removeGalleryPhoto(
  photoId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const t = await getTranslations("errors");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: t("sessionExpired") };

  const profile = await getOwnProfile(supabase, user.id);
  if (!profile) return { ok: false, error: t("profileNotFound") };

  const photo = profile.profile_photos.find((item) => item.id === photoId);
  if (!photo) return { ok: false, error: t("photoNotFound") };

  const { error } = await supabase.from("profile_photos").delete().eq("id", photoId);
  if (error) return { ok: false, error: t("removeThatPhoto") };
  await supabase.storage.from("gallery").remove([photo.path]);

  revalidateProfilePages(profile);
  return { ok: true };
}

export async function deleteProfile(confirmation: string): Promise<{ ok: false; error: string }> {
  const t = await getTranslations("errors");
  if (confirmation !== "DELETE") {
    return { ok: false, error: t("typeDelete") };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: t("sessionExpired") };

  const profile = await getOwnProfile(supabase, user.id);
  if (!profile) return { ok: false, error: t("profileNotFound") };

  if (profile.avatar_url) {
    const { error: storageError } = await supabase.storage
      .from("avatars")
      .remove([`${user.id}/avatar`]);
    if (storageError) {
      return { ok: false, error: t("deletePhoto") };
    }
  }

  const { data: galleryObjects } = await supabase.storage.from("gallery").list(user.id);
  if (galleryObjects?.length) {
    await supabase.storage
      .from("gallery")
      .remove(galleryObjects.map((object) => `${user.id}/${object.name}`));
  }

  const { error } = await supabase.from("profiles").delete().eq("id", user.id);
  if (error) return { ok: false, error: t("deleteProfile") };

  revalidateProfilePages(profile);
  await supabase.auth.signOut();
  const locale = (await getLocale()) as Locale;
  return redirect({ href: "/", locale });
}
