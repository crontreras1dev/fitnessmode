import type { Metadata } from "next";
import Link from "next/link";
import { getCities, getTaxonomy, PAGE_SIZE, searchTrainers } from "@/lib/db/queries";
import { parseSearchParams, type SearchFilters as Filters } from "@/lib/validation/search";
import { buttonClasses } from "@/components/ui/button";
import { SearchFilters } from "@/components/search/search-filters";
import { TrainerGrid } from "@/components/trainers/trainer-card";

export const metadata: Metadata = {
  title: "Search trainers",
  description: "Search personal trainers by city, modality, specialty and rate.",
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function pageHref(filters: Filters, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filters, page })) {
    if (value !== undefined && value !== "" && !(key === "page" && value === 1)) {
      params.set(key, String(value));
    }
  }
  return `/search${params.size ? `?${params}` : ""}`;
}

export default async function SearchPage({ searchParams }: Props) {
  const filters = parseSearchParams(await searchParams);
  const [{ trainers, total, page }, cities, taxonomy] = await Promise.all([
    searchTrainers(filters),
    getCities(),
    getTaxonomy(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const cityName = cities.find((city) => city.slug === filters.city)?.name;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[16rem_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <h2 className="sr-only">Filters</h2>
        <SearchFilters filters={filters} cities={cities} taxonomy={taxonomy} />
      </aside>
      <section aria-live="polite">
        <h1 className="text-2xl font-semibold tracking-tight">
          {cityName ? `Trainers in ${cityName}` : "All trainers"}
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          {total} {total === 1 ? "result" : "results"}
        </p>
        <div className="mt-6">
          {trainers.length ? (
            <TrainerGrid trainers={trainers} showCity={!filters.city} />
          ) : (
            <p className="rounded-card border-border text-text-muted border border-dashed p-8">
              No trainers match these filters yet. Try widening your search.
            </p>
          )}
        </div>
        {totalPages > 1 ? (
          <nav aria-label="Pagination" className="mt-8 flex items-center justify-between">
            {page > 1 ? (
              <Link
                href={pageHref(filters, page - 1)}
                className={buttonClasses({ variant: "secondary" })}
              >
                Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-text-muted text-sm">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={pageHref(filters, page + 1)}
                className={buttonClasses({ variant: "secondary" })}
              >
                Next
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </section>
    </div>
  );
}
