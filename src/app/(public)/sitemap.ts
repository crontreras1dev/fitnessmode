import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/db/queries";
import { absoluteUrl, cityPath, profilePath } from "@/lib/seo/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { cities, profiles } = await getSitemapEntries();
  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/signup"), changeFrequency: "monthly", priority: 0.5 },
    ...cities.map((city) => ({
      url: absoluteUrl(cityPath(city.slug)),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...profiles.map((profile) => ({
      url: absoluteUrl(profilePath(profile.city.slug, profile.slug)),
      lastModified: profile.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
