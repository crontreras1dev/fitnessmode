import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
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

  const steps = [
    { title: t("step1Title"), body: t("step1Body") },
    { title: t("step2Title"), body: t("step2Body") },
    { title: t("step3Title"), body: t("step3Body") },
  ];

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
