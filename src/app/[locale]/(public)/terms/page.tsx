import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { termsDoc } from "@/content/legal/terms";
import { termsDoc as termsDocEs } from "@/content/legal/es/terms";
import { legalConfig } from "@/lib/legal/config";
import { LegalDocumentView } from "@/components/legal/legal-document";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("terms.metaTitle"),
    description: t("terms.metaDescription"),
    alternates: {
      canonical: locale === "es" ? "/es/terms" : "/terms",
      languages: { en: "/terms", es: "/es/terms", "x-default": "/terms" },
    },
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc] = await Promise.all([getTranslations("legal"), getTranslations("common")]);
  const doc = locale === "es" ? termsDocEs : termsDoc;
  const effectiveDate = legalConfig.effectiveDate[locale === "es" ? "es" : "en"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label={tc("breadcrumb")} className="text-text-muted text-sm">
        <Link href="/" className="hover:text-text">
          {tc("home")}
        </Link>{" "}
        / <span className="text-text">{t("terms.title")}</span>
      </nav>
      <header className="mt-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("terms.title")}</h1>
        <p className="text-text-muted mt-2 text-sm">{t("lastUpdated", { date: effectiveDate })}</p>
      </header>
      <LegalDocumentView doc={doc} contentsLabel={t("contents")} />
    </div>
  );
}
