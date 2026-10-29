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

/** Placeholder city segment for trainers with a free-text location. */
export const REMOTE_CITY_SLUG = "remote";

export function trainerProfilePath(trainer: { slug: string; city: { slug: string } | null }) {
  return profilePath(trainer.city?.slug ?? REMOTE_CITY_SLUG, trainer.slug);
}

export function trainerLocationName(trainer: {
  city: { name: string } | null;
  customLocation?: string | null;
}) {
  return trainer.city?.name ?? trainer.customLocation ?? "Online";
}
