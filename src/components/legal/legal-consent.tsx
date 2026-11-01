"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/components/ui/cn";

export function LegalConsent({ className }: { className?: string }) {
  const t = useTranslations("signup");
  const linkClass = "text-text underline underline-offset-2";
  return (
    <p className={cn("text-text-muted text-xs", className)}>
      {t.rich("consent", {
        termsLink: (chunks) => (
          <Link href="/terms" className={linkClass}>
            {chunks}
          </Link>
        ),
        privacyLink: (chunks) => (
          <Link href="/privacy" className={linkClass}>
            {chunks}
          </Link>
        ),
      })}
    </p>
  );
}
