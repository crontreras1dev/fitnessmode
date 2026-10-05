import { absoluteUrl, profilePath } from "./site";

type CityRef = { slug: string; name: string; country_code?: string | null };

type TrainerRef = {
  slug: string;
  displayName: string;
  headline?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  city: { slug: string; name: string };
  sameAs?: (string | null | undefined)[];
  categories?: { name: string }[];
};

export function trainerItemListJsonLd(city: CityRef, trainers: TrainerRef[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Personal trainers in ${city.name}`,
    numberOfItems: trainers.length,
    itemListElement: trainers.map((trainer, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(profilePath(city.slug, trainer.slug)),
      name: trainer.displayName,
    })),
  };
}

export function trainerPersonJsonLd(trainer: TrainerRef) {
  const sameAs = (trainer.sameAs ?? []).filter((url): url is string => Boolean(url));
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: trainer.displayName,
    jobTitle: trainer.categories?.[0]?.name ?? "Personal Trainer",
    description: trainer.headline ?? trainer.bio ?? undefined,
    image: trainer.avatarUrl ?? undefined,
    url: absoluteUrl(profilePath(trainer.city.slug, trainer.slug)),
    address: { "@type": "PostalAddress", addressLocality: trainer.city.name },
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
