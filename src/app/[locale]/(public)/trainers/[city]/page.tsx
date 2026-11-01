import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { getPathname, Link } from "@/i18n/navigation";
import { termName } from "@/i18n/terms";
import type { Locale } from "@/i18n/routing";
import { getCities, getCityBySlug, getTaxonomy, getTrainersByCity } from "@/lib/db/queries";
import { breadcrumbJsonLd, trainerItemListJsonLd } from "@/lib/seo/jsonld";
import { cityPath } from "@/lib/seo/site";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { TrainerGrid } from "@/components/trainers/trainer-card";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string; city: string }> };

export async function generateStaticParams() {
  const cities = await getCities({ publishedOnly: true });
  return cities.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, city: citySlug } = await params;
  const t = await getTranslations({ locale, namespace: "cityPage" });
  const city = await getCityBySlug(citySlug);
  if (!city?.is_published) return {};
  const title = t("metaTitle", { city: city.name });
  const description = t("metaDescription", { city: city.name });
  const canonical = getPathname({ href: cityPath(city.slug), locale: locale as Locale });
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default async function CityPage({ params }: Props) {
  const { locale, city: citySlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cityPage");
  const tc = await getTranslations("common");
  const messages = await getMessages();
  const city = await getCityBySlug(citySlug);
  if (!city?.is_published) notFound();

  const [trainers, taxonomy] = await Promise.all([getTrainersByCity(city.id), getTaxonomy()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd
        data={[
          trainerItemListJsonLd(city, trainers, t("metaTitle", { city: city.name }), (path) =>
            getPathname({ href: path, locale: locale as Locale }),
          ),
          breadcrumbJsonLd([
            { name: tc("home"), path: getPathname({ href: "/", locale: locale as Locale }) },
            {
              name: tc("trainersIn", { city: city.name }),
              path: getPathname({ href: cityPath(city.slug), locale: locale as Locale }),
            },
          ]),
        ]}
      />
      <nav aria-label={tc("breadcrumb")} className="text-text-muted text-sm">
        <Link href="/" className="hover:text-text">
          {tc("home")}
        </Link>{" "}
        / <span className="text-text">{city.name}</span>
      </nav>
      <header className="mt-4 flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("title", { city: city.name })}
        </h1>
        <p className="text-text-muted max-w-2xl">
          {trainers.length
            ? t("subtitle", { count: trainers.length, city: city.name })
            : t("subtitleEmpty", { city: city.name })}
        </p>
        <ul className="mt-2 flex flex-wrap gap-2" aria-label={t("filterByModality")}>
          {taxonomy.modalities.map((modality) => (
            <li key={modality.slug}>
              <Link
                href={`/search?city=${city.slug}&modality=${modality.slug}`}
                className="border-border bg-surface hover:border-brand inline-flex rounded-full border px-3.5 py-1.5 text-sm"
              >
                {termName(messages, "modalities", modality)}
              </Link>
            </li>
          ))}
        </ul>
      </header>

      <section className="mt-8">
        {trainers.length ? (
          <TrainerGrid trainers={trainers} />
        ) : (
          <div className="rounded-card border-border flex flex-col items-start gap-4 border border-dashed p-8">
            <h2 className="text-lg font-semibold">{t("emptyTitle", { city: city.name })}</h2>
            <p className="text-text-muted">{t("emptyBody", { city: city.name })}</p>
            <ButtonLink href="/signup">{tc("listYourselfFree")}</ButtonLink>
          </div>
        )}
      </section>
    </div>
  );
}
