export const siteConfig = {
  name: "FitnessMode",
  description:
    "Find local personal trainers, athletic coaches and online coaches by city, modality and rate. No account needed.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
};

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function cityPath(citySlug: string) {
  return `/trainers/${citySlug}`;
}

export function profilePath(citySlug: string, profileSlug: string) {
  return `/trainers/${citySlug}/${profileSlug}`;
}
