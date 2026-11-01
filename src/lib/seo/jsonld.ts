import { absoluteUrl, profilePath, trainerLocationName, trainerProfilePath } from "./site";

type CityRef = { slug: string; name: string; country_code?: string | null };

type TrainerRef = {
  slug: string;
  displayName: string;
  headline?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  city: { slug: string; name: string } | null;
  customLocation?: string | null;
  sameAs?: (string | null | undefined)[];
  categories?: { name: string }[];
};

export function trainerItemListJsonLd(
  city: CityRef,
  trainers: TrainerRef[],
  listName?: string,
  localize: (path: string) => string = (path) => path,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName ?? `Personal trainers in ${city.name}`,
    numberOfItems: trainers.length,
    itemListElement: trainers.map((trainer, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(localize(profilePath(city.slug, trainer.slug))),
      name: trainer.displayName,
    })),
  };
}

export function trainerPersonJsonLd(
  trainer: TrainerRef,
  onlineLabel = "Online",
  localize: (path: string) => string = (path) => path,
) {
  const sameAs = (trainer.sameAs ?? []).filter((url): url is string => Boolean(url));
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: trainer.displayName,
    jobTitle: trainer.categories?.[0]?.name ?? "Personal Trainer",
    description: trainer.headline ?? trainer.bio ?? undefined,
    image: trainer.avatarUrl ?? undefined,
    url: absoluteUrl(localize(trainerProfilePath(trainer))),
    address: {
      "@type": "PostalAddress",
      addressLocality: trainerLocationName(trainer, onlineLabel),
    },
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
