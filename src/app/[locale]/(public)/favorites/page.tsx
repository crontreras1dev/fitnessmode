import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FavoritesList } from "@/components/trainers/favorites-list";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "favorites" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false },
  };
}

export default async function FavoritesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("favorites");
  const tc = await getTranslations("common");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label={tc("breadcrumb")} className="text-text-muted text-sm">
        <Link href="/" className="hover:text-text">
          {tc("home")}
        </Link>{" "}
        / <span className="text-text">{t("title")}</span>
      </nav>
      <header className="mt-4 flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="text-text-muted max-w-2xl">{t("subtitle")}</p>
      </header>

      <section className="mt-8">
        <FavoritesList />
      </section>
    </div>
  );
}
