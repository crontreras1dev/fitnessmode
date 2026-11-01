import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/seo/site";

export function SiteFooter() {
  const t = useTranslations("footer");
  return (
    <footer className="border-border mt-auto border-t">
      <div className="text-text-muted mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{t("tagline", { year: new Date().getFullYear(), site: siteConfig.name })}</p>
        <nav className="flex gap-4">
          <Link href="/search" className="hover:text-text">
            {t("findTrainer")}
          </Link>
          <Link href="/favorites" className="hover:text-text">
            {t("favorites")}
          </Link>
          <Link href="/for-trainers" className="hover:text-text">
            {t("forTrainers")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
