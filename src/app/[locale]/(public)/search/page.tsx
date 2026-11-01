import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCities, getTaxonomy, PAGE_SIZE, searchTrainers } from "@/lib/db/queries";
import { parseSearchParams, type SearchFilters as Filters } from "@/lib/validation/search";
import { buttonClasses } from "@/components/ui/button";
import { SearchFilters } from "@/components/search/search-filters";
import { TrainerGrid } from "@/components/trainers/trainer-card";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    robots: { index: false, follow: true },
  };
}

function pageHref(filters: Filters, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filters, page })) {
    if (value !== undefined && value !== "" && !(key === "page" && value === 1)) {
      params.set(key, String(value));
    }
  }
  return `/search${params.size ? `?${params}` : ""}`;
}

export default async function SearchPage({ params, searchParams }: Props) {
  const [{ locale }, rawParams] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("search");

  const filters = parseSearchParams(rawParams);
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
        <h2 className="sr-only">{t("filters")}</h2>
        <SearchFilters filters={filters} cities={cities} taxonomy={taxonomy} />
      </aside>
      <section aria-live="polite">
        <h1 className="text-2xl font-semibold tracking-tight">
          {cityName ? t("trainersIn", { city: cityName }) : t("allTrainers")}
        </h1>
        <p className="text-text-muted mt-1 text-sm">{t("resultCount", { count: total })}</p>
        <div className="mt-6">
          {trainers.length ? (
            <TrainerGrid trainers={trainers} showCity={!filters.city} />
          ) : (
            <p className="rounded-card border-border text-text-muted border border-dashed p-8">
              {t("empty")}
            </p>
          )}
        </div>
        {totalPages > 1 ? (
          <nav aria-label={t("pagination")} className="mt-8 flex items-center justify-between">
            {page > 1 ? (
              <Link
                href={pageHref(filters, page - 1)}
                className={buttonClasses({ variant: "secondary" })}
              >
                {t("previous")}
              </Link>
            ) : (
              <span />
            )}
            <span className="text-text-muted text-sm">
              {t("pageOf", { page, total: totalPages })}
            </span>
            {page < totalPages ? (
              <Link
                href={pageHref(filters, page + 1)}
                className={buttonClasses({ variant: "secondary" })}
              >
                {t("next")}
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
