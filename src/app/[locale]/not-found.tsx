import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-text-muted max-w-md">{t("body")}</p>
      <Link href="/" className="text-brand font-medium underline underline-offset-4">
        {t("backHome")}
      </Link>
    </div>
  );
}
