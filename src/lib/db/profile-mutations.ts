import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DetailsFormValues, ProfileFormValues } from "@/lib/validation/profile";
import { profileSchema } from "@/lib/validation/profile";
import { slugify } from "@/lib/seo/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "./types";

type Client = SupabaseClient<Database>;

function profileColumns(values: ProfileFormValues) {
  return {
    display_name: values.displayName,
    headline: values.headline || null,
    bio: values.bio,
    city_id: values.cityId > 0 ? values.cityId : null,
    custom_location: values.cityId > 0 ? null : values.customLocation || null,
    instagram_url: values.instagramUrl,
    tiktok_url: values.tiktokUrl,
    website_url: values.websiteUrl,
    whatsapp: values.whatsapp,
    phone: values.phone,
    rate_min: values.rateMin,
    rate_max: values.rateMax,
    currency: values.currency,
  };
}

async function replaceTaxonomy(client: Client, profileId: string, values: ProfileFormValues) {
  const results = await Promise.all([
    client.from("profile_categories").delete().eq("profile_id", profileId),
    client.from("profile_modalities").delete().eq("profile_id", profileId),
    client.from("profile_specialties").delete().eq("profile_id", profileId),
  ]);
  const deleteError = results.find((result) => result.error)?.error;
  if (deleteError) throw deleteError;

  const inserts = await Promise.all([
    client
      .from("profile_categories")
      .insert(values.categoryIds.map((category_id) => ({ profile_id: profileId, category_id }))),
    client
      .from("profile_modalities")
      .insert(values.modalityIds.map((modality_id) => ({ profile_id: profileId, modality_id }))),
    values.specialtyIds.length
      ? client
          .from("profile_specialties")
          .insert(
            values.specialtyIds.map((specialty_id) => ({ profile_id: profileId, specialty_id })),
          )
      : Promise.resolve({ error: null }),
  ]);
  const insertError = inserts.find((result) => result.error)?.error;
  if (insertError) throw insertError;
}

/** Creates the trainer profile as status='pending'; the DB trigger makes the slug unique. */
export async function createProfile(client: Client, userId: string, values: ProfileFormValues) {
  const { error } = await client.from("profiles").insert({
    id: userId,
    slug: slugify(values.displayName) || "trainer",
    ...profileColumns(values),
  });
  if (error) throw error;
  await replaceTaxonomy(client, userId, values);
}

export async function updateProfile(client: Client, userId: string, values: ProfileFormValues) {
  const { error } = await client.from("profiles").update(profileColumns(values)).eq("id", userId);
  if (error) throw error;
  await replaceTaxonomy(client, userId, values);
}

async function replaceDetailsTaxonomy(
  client: Client,
  profileId: string,
  values: DetailsFormValues,
) {
  const results = await Promise.all([
    client.from("profile_session_types").delete().eq("profile_id", profileId),
    client.from("profile_amenities").delete().eq("profile_id", profileId),
  ]);
  const deleteError = results.find((result) => result.error)?.error;
  if (deleteError) throw deleteError;

  const inserts = await Promise.all([
    values.sessionTypeIds.length
      ? client.from("profile_session_types").insert(
          values.sessionTypeIds.map((session_type_id) => ({
            profile_id: profileId,
            session_type_id,
          })),
        )
      : Promise.resolve({ error: null }),
    values.amenityIds.length
      ? client
          .from("profile_amenities")
          .insert(values.amenityIds.map((amenity_id) => ({ profile_id: profileId, amenity_id })))
      : Promise.resolve({ error: null }),
  ]);
  const insertError = inserts.find((result) => result.error)?.error;
  if (insertError) throw insertError;
}

/** Dashboard-only details: languages, education, session types, amenities. */
export async function updateProfileDetails(
  client: Client,
  userId: string,
  values: DetailsFormValues,
) {
  const { error } = await client
    .from("profiles")
    .update({ languages: values.languages, education: values.education })
    .eq("id", userId);
  if (error) throw error;
  await replaceDetailsTaxonomy(client, userId, values);
}

/** Pending wizard answers are only honored for this long after the link was sent. */
const PENDING_SIGNUP_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Called after the magic-link round trip. Wizard answers arrive via user_metadata
 * (new auth users) or the pending_signups table (existing users — Supabase ignores
 * options.data for them) and are turned into the profile here.
 */
export async function finalizePendingProfile(client: Client) {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return "unauthenticated" as const;

  const { data: existing } = await client
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  let pending: unknown = user.user_metadata?.pending_profile;

  if (!pending && user.email) {
    const admin = createAdminClient();
    if (admin) {
      const { data: row } = await admin
        .from("pending_signups")
        .select("profile, created_at")
        .eq("email", user.email)
        .maybeSingle();
      if (row) {
        const fresh = Date.now() - new Date(row.created_at).getTime() < PENDING_SIGNUP_TTL_MS;
        if (fresh && !existing) pending = row.profile;
        await admin.from("pending_signups").delete().eq("email", user.email);
      }
    }
  }

  let result: "exists" | "created" | "missing" = existing ? "exists" : "missing";
  if (!existing && pending) {
    const parsed = profileSchema.safeParse(pending);
    if (parsed.success) {
      await createProfile(client, user.id, parsed.data);
      result = "created";
    } else {
      console.error("pending profile failed validation", parsed.error.flatten());
    }
  }
  if (user.user_metadata?.pending_profile) {
    await client.auth.updateUser({ data: { pending_profile: null } });
  }
  return result;
}

export async function getOwnProfile(client: Client, userId: string) {
  const { data, error } = await client
    .from("profiles")
    .select(
      "id, slug, display_name, headline, bio, city_id, custom_location, avatar_url, instagram_url, tiktok_url, website_url, rate_min, rate_max, currency, tier, status, languages, education, city:cities(id, slug, name, region, country_code, is_published), profile_categories(category_id), profile_modalities(modality_id), profile_specialties(specialty_id), profile_session_types(session_type_id), profile_amenities(amenity_id), profile_photos(id, path, sort_order)",
    )
    .eq("id", userId)
    .maybeSingle();
  // A failed query is not a missing profile: throwing here prevents a
  // /dashboard <-> /signup redirect loop and surfaces the real error.
  if (error) {
    console.error("getOwnProfile failed", { userId, error });
    throw error;
  }
  return data;
}
export type OwnProfile = NonNullable<Awaited<ReturnType<typeof getOwnProfile>>>;
