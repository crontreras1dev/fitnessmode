import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { TrainerPlans } from "@/components/trainers/trainer-plans";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "forTrainers" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ForTrainersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("forTrainers");
  const tc = await getTranslations("common");

  const steps = [1, 2, 3, 4].map((n) => ({
    title: t(`step${n}Title`),
    body: t(`step${n}Body`),
    image: `/images/for-trainers/step-${n}.png`,
    alt: t(`step${n}ImageAlt`),
  }));

  return (
    <>
      <section className="border-border from-brand-soft/60 to-bg border-b bg-gradient-to-b">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="text-text-muted max-w-xl text-lg text-pretty">{t("heroSubtitle")}</p>
          <ButtonLink href="/signup" size="lg">
            {tc("createFreeProfile")}
          </ButtonLink>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">{t("howItWorks")}</h2>
        <ol className="mt-10 flex flex-col gap-12 sm:mt-12 sm:gap-16">
          {steps.map((step, index) => (
            <li key={step.title} className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
              <Image
                src={step.image}
                alt={step.alt}
                width={1254}
                height={1254}
                className={cn(
                  "mx-auto w-full max-w-sm",
                  index % 2 === 1 && "md:order-2",
                )}
              />
              <div
                className={cn(
                  "text-center md:text-left",
                  index % 2 === 1 && "md:order-1",
                )}
              >
                <span className="text-brand text-sm font-semibold tracking-wide uppercase">
                  {tc("step", { n: index + 1 })}
                </span>
                <h3 className="mt-1 text-xl font-semibold sm:text-2xl">{step.title}</h3>
                <p className="text-text-muted mt-2 text-pretty">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <TrainerPlans className="pb-14" />

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-card bg-text text-bg flex flex-col items-center gap-6 p-8 text-center sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{t("ctaTitle")}</h2>
            <p className="text-bg/70 mt-2 max-w-xl">{t("ctaBody")}</p>
          </div>
          <ButtonLink href="/signup" size="lg">
            {tc("createFreeProfile")}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
