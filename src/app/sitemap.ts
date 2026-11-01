import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/db/queries";
import { absoluteUrl, cityPath, trainerProfilePath } from "@/lib/seo/site";

export const revalidate = 3600;

const LOCALES = ["en", "es"] as const;

function entry(
  path: string,
  options: {
    lastModified?: Date | string;
    changeFrequency: "daily" | "weekly" | "monthly";
    priority: number;
    locales?: readonly (typeof LOCALES)[number][];
  },
): MetadataRoute.Sitemap[number] {
  const urlFor = (locale: (typeof LOCALES)[number]) =>
    absoluteUrl(locale === "en" ? path : `/es${path === "/" ? "" : path}`);
  const locales = options.locales ?? LOCALES;
  return {
    url: urlFor("en"),
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    ...(locales.length > 1
      ? {
          alternates: {
            languages: Object.fromEntries([
              ...locales.map((locale) => [locale, urlFor(locale)]),
              ["x-default", urlFor("en")],
            ]),
          },
        }
      : {}),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { cities, profiles } = await getSitemapEntries();
  return [
    entry("/", { changeFrequency: "daily", priority: 1 }),
    entry("/signup", { changeFrequency: "monthly", priority: 0.5 }),
    entry("/privacy", { changeFrequency: "monthly", priority: 0.3, locales: ["en"] }),
    entry("/terms", { changeFrequency: "monthly", priority: 0.3, locales: ["en"] }),
    entry("/cookies", { changeFrequency: "monthly", priority: 0.3, locales: ["en"] }),
    ...cities.map((city) =>
      entry(cityPath(city.slug), { changeFrequency: "daily", priority: 0.9 }),
    ),
    ...profiles.map((profile) =>
      entry(trainerProfilePath(profile), {
        lastModified: profile.updated_at,
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    ),
  ];
}
