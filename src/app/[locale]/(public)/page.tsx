import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCities, getFeaturedTrainers, getTaxonomy } from "@/lib/db/queries";
import { cityPath } from "@/lib/seo/site";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroSearch } from "@/components/search/hero-search";
import { TrainerCarousel } from "@/components/trainers/trainer-carousel";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  const [taxonomy, cities, featuredTrainers] = await Promise.all([
    getTaxonomy(),
    getCities({ publishedOnly: true }),
    getFeaturedTrainers(24),
  ]);

  const steps = [
    { title: t("step1Title"), body: t("step1Body") },
    { title: t("step2Title"), body: t("step2Body") },
    { title: t("step3Title"), body: t("step3Body") },
  ];
  const badges = [t("badge1"), t("badge2"), t("badge3")];

  return (
    <>
      <section className="border-border from-brand-soft/60 to-bg border-b bg-gradient-to-b">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="text-text-muted max-w-xl text-lg text-pretty">{t("heroSubtitle")}</p>
          <HeroSearch modalities={taxonomy.modalities} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold tracking-tight">{t("whatIsTitle")}</h2>
            <p className="text-text-muted mt-4">{t("whatIsBody1")}</p>
            <p className="text-text-muted mt-3">{t("whatIsBody2")}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <li
                  key={badge}
                  className="border-border bg-surface text-text-muted rounded-full border px-3 py-1 text-sm"
                >
                  {badge}
                </li>
              ))}
            </ul>
          </div>
          <Image
            src="/images/what-is-fitnessmode.png"
            alt={t("whatIsImageAlt")}
            width={1408}
            height={768}
            className="mx-auto w-full max-w-md md:w-5/12"
          />
        </div>
      </section>

      {featuredTrainers.length ? (
        <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">{t("featuredTitle")}</h2>
          <p className="text-text-muted mt-2">{t("featuredSubtitle")}</p>
          <div className="mt-6">
            <TrainerCarousel pool={featuredTrainers} count={5} />
          </div>
        </section>
      ) : null}

      {cities.length ? (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">{t("popularCities")}</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={cityPath(city.slug)}
                  className="rounded-card border-border bg-surface hover:border-brand flex flex-col border px-4 py-3 transition-colors"
                >
                  <span className="font-medium">{tc("trainersIn", { city: city.name })}</span>
                  <span className="text-text-muted text-sm">
                    {[city.region, city.country_code].filter(Boolean).join(", ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">{t("howItWorks")}</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full">
                <span className="text-brand text-sm font-semibold">
                  {tc("step", { n: index + 1 })}
                </span>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="text-text-muted mt-2 text-sm">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-card bg-text text-bg flex flex-col gap-8 p-8 text-center sm:p-10 md:flex-row md:items-center md:gap-12 md:text-left">
          <div className="flex flex-1 flex-col items-center gap-6 md:items-start">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{t("ctaTitle")}</h2>
              <p className="text-bg/70 mt-2 max-w-lg">{t("ctaBody")}</p>
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <ButtonLink href="/signup" size="lg" className="shrink-0">
                {tc("createFreeProfile")}
              </ButtonLink>
              <Link
                href="/for-trainers"
                className="text-bg/80 hover:text-bg shrink-0 underline underline-offset-4"
              >
                {t("seeHowItWorks")}
              </Link>
            </div>
          </div>
          <Image
            src="/images/are-you-a-trainer.png"
            alt={t("ctaImageAlt")}
            width={1024}
            height={1024}
            className="mx-auto w-full max-w-xs md:w-2/5"
          />
        </div>
      </section>
    </>
  );
}
