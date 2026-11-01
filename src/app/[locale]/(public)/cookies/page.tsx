import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, permanentRedirect } from "@/i18n/navigation";
import { cookiesDoc } from "@/content/legal/cookies";
import { legalConfig } from "@/lib/legal/config";
import { LegalDocumentView } from "@/components/legal/legal-document";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "en") return {};
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("cookies.metaTitle"),
    description: t("cookies.metaDescription"),
    alternates: { canonical: "/cookies" },
  };
}

export default async function CookiesPage({ params }: Props) {
  const { locale } = await params;
  // Legal documents are English-only; keep a single canonical URL.
  if (locale !== "en") permanentRedirect({ href: "/cookies", locale: "en" });
  setRequestLocale(locale);
  const [t, tc] = await Promise.all([getTranslations("legal"), getTranslations("common")]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label={tc("breadcrumb")} className="text-text-muted text-sm">
        <Link href="/" className="hover:text-text">
          {tc("home")}
        </Link>{" "}
        / <span className="text-text">{t("cookies.title")}</span>
      </nav>
      <header className="mt-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("cookies.title")}</h1>
        <p className="text-text-muted mt-2 text-sm">
          {t("lastUpdated", { date: legalConfig.effectiveDate })}
        </p>
      </header>
      <LegalDocumentView doc={cookiesDoc} contentsLabel={t("contents")} />
    </div>
  );
}
