import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileFormValues } from "@/lib/validation/profile";
import { profileSchema } from "@/lib/validation/profile";
import { slugify } from "@/lib/seo/slug";
import type { Database } from "./types";

type Client = SupabaseClient<Database>;

function profileColumns(values: ProfileFormValues) {
  return {
    display_name: values.displayName,
    headline: values.headline || null,
    bio: values.bio,
    city_id: values.cityId,
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

/**
 * Called after the magic-link round trip: the wizard answers travel in user_metadata
 * (so it works across devices) and are turned into the pending profile here.
 */
export async function finalizePendingProfile(client: Client) {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return "unauthenticated" as const;

  const pending = user.user_metadata?.pending_profile;
  const { data: existing } = await client
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  let result: "exists" | "created" | "missing" = existing ? "exists" : "missing";
  if (!existing && pending) {
    const parsed = profileSchema.safeParse(pending);
    if (parsed.success) {
      await createProfile(client, user.id, parsed.data);
      result = "created";
    }
  }
  if (pending) await client.auth.updateUser({ data: { pending_profile: null } });
  return result;
}

export async function getOwnProfile(client: Client, userId: string) {
  const { data } = await client
    .from("profiles")
    .select(
      "id, slug, display_name, headline, bio, city_id, instagram_url, tiktok_url, website_url, rate_min, rate_max, currency, tier, status, city:cities!inner(id, slug, name, region, country_code, is_published), profile_categories(category_id), profile_modalities(modality_id), profile_specialties(specialty_id)",
    )
    .eq("id", userId)
    .maybeSingle();
  return data;
}
export type OwnProfile = NonNullable<Awaited<ReturnType<typeof getOwnProfile>>>;
