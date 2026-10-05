import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { SearchFilters } from "@/lib/validation/search";
import type { Database, Tables } from "./types";

type Client = SupabaseClient<Database>;

export type Term = { id: number; slug: string; name: string };
export type City = Pick<
  Tables<"cities">,
  "id" | "slug" | "name" | "region" | "country_code" | "latitude" | "longitude" | "is_published"
>;
export type ProfileTier = Database["public"]["Enums"]["profile_tier"];

const CITY_COLUMNS = "id, slug, name, region, country_code, latitude, longitude, is_published";

const TRAINER_SELECT =
  "id, slug, display_name, headline, bio, avatar_url, rate_min, rate_max, currency, tier, instagram_url, tiktok_url, website_url, updated_at, city:cities!inner(slug, name), profile_categories(categories(id, slug, name)), profile_modalities(modalities(id, slug, name)), profile_specialties(specialties(id, slug, name))";

export const PAGE_SIZE = 24;

function notNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function mapTrainer(row: TrainerRow) {
  return {
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    headline: row.headline,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    rateMin: row.rate_min,
    rateMax: row.rate_max,
    currency: row.currency,
    tier: row.tier,
    instagramUrl: row.instagram_url,
    tiktokUrl: row.tiktok_url,
    websiteUrl: row.website_url,
    updatedAt: row.updated_at,
    city: row.city,
    categories: row.profile_categories.map((item) => item.categories).filter(notNull),
    modalities: row.profile_modalities.map((item) => item.modalities).filter(notNull),
    specialties: row.profile_specialties.map((item) => item.specialties).filter(notNull),
  };
}

function trainerQuery(client: Client) {
  return client.from("profiles").select(TRAINER_SELECT).eq("status", "active");
}

type TrainerRow = NonNullable<Awaited<ReturnType<typeof trainerQuery>>["data"]>[number];
export type Trainer = ReturnType<typeof mapTrainer>;

export async function getTaxonomy() {
  const client = createPublicClient();
  if (!client) return { categories: [], modalities: [], specialties: [] };
  const [categories, modalities, specialties] = await Promise.all([
    client.from("categories").select("id, slug, name").order("sort_order"),
    client.from("modalities").select("id, slug, name").order("sort_order"),
    client.from("specialties").select("id, slug, name").order("sort_order"),
  ]);
  return {
    categories: (categories.data ?? []) as Term[],
    modalities: (modalities.data ?? []) as Term[],
    specialties: (specialties.data ?? []) as Term[],
  };
}
export type Taxonomy = Awaited<ReturnType<typeof getTaxonomy>>;

export async function getCities({ publishedOnly = false } = {}): Promise<City[]> {
  const client = createPublicClient();
  if (!client) return [];
  let query = client.from("cities").select(CITY_COLUMNS).order("name");
  if (publishedOnly) query = query.eq("is_published", true);
  const { data } = await query;
  return data ?? [];
}

export const getCityBySlug = cache(async (slug: string): Promise<City | null> => {
  const client = createPublicClient();
  if (!client) return null;
  const { data } = await client.from("cities").select(CITY_COLUMNS).eq("slug", slug).maybeSingle();
  return data;
});

export async function getTrainersByCity(cityId: number, limit = 100) {
  const client = createPublicClient();
  if (!client) return [];
  const { data } = await trainerQuery(client)
    .eq("city_id", cityId)
    .order("tier", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(mapTrainer);
}

export const getTrainerBySlug = cache(async (slug: string) => {
  const client = createPublicClient();
  if (!client) return null;
  const { data } = await trainerQuery(client).eq("slug", slug).maybeSingle();
  return data ? mapTrainer(data) : null;
});

/** WhatsApp / phone are only returned by the DB for active pro-tier profiles. */
export async function getTrainerContact(profileId: string) {
  const client = createPublicClient();
  if (!client) return null;
  const { data } = await client.rpc("get_profile_contact", { p_profile_id: profileId });
  return data?.[0] ?? null;
}

export async function searchTrainers(filters: SearchFilters) {
  const client = createPublicClient();
  if (!client) return { trainers: [] as Trainer[], total: 0, page: 1 };
  const page = filters.page ?? 1;
  const { data: matches, error } = await client.rpc("search_profiles", {
    p_city: filters.city,
    p_category: filters.category,
    p_modality: filters.modality,
    p_specialty: filters.specialty,
    p_rate_min: filters.min,
    p_rate_max: filters.max,
    p_query: filters.q,
    p_limit: PAGE_SIZE,
    p_offset: (page - 1) * PAGE_SIZE,
  });
  if (error || !matches?.length) return { trainers: [] as Trainer[], total: 0, page };

  const ids = matches.map((match) => match.id);
  const { data } = await trainerQuery(client).in("id", ids);
  const byId = new Map((data ?? []).map((row) => [row.id, mapTrainer(row)]));
  return {
    trainers: ids.map((id) => byId.get(id)).filter(notNull),
    total: Number(matches[0].total_count),
    page,
  };
}

export async function getSitemapEntries() {
  const client = createPublicClient();
  if (!client) return { cities: [], profiles: [] };
  const [cities, profiles] = await Promise.all([
    client.from("cities").select("slug, created_at").eq("is_published", true),
    client
      .from("profiles")
      .select("slug, updated_at, city:cities!inner(slug)")
      .eq("status", "active")
      .limit(50000),
  ]);
  return { cities: cities.data ?? [], profiles: profiles.data ?? [] };
}
