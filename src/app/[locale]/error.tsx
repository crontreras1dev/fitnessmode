"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/ui/site-header";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-text-muted max-w-md">{t("body")}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>{t("tryAgain")}</Button>
          <Link href="/" className="text-brand font-medium underline underline-offset-4">
            {t("backHome")}
          </Link>
        </div>
      </div>
    </>
  );
}
