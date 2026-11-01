import type { AbstractIntlMessages } from "next-intl";

export type TaxonomyKind =
  "categories" | "modalities" | "specialties" | "sessionTypes" | "amenities";

type TaxonomyMessages = { taxonomy?: Record<string, Record<string, string> | undefined> };

/**
 * Looks up a DB taxonomy term's translation by slug, falling back to the name
 * stored in the database when no message exists.
 */
export function termName(
  messages: AbstractIntlMessages | undefined,
  kind: TaxonomyKind,
  term: { slug: string; name: string },
) {
  return (messages as TaxonomyMessages | undefined)?.taxonomy?.[kind]?.[term.slug] ?? term.name;
}
