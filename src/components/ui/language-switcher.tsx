"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "./cn";

const STORAGE_KEY = "fitnessmode-locale";

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: "en" | "es") {
    if (next === locale) return;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable (private mode): the middleware cookie still remembers.
    }
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      role="group"
      aria-label={t("switchLanguage")}
      className={cn(
        "border-border bg-surface inline-flex shrink-0 items-center rounded-full border p-0.5 text-xs font-medium",
        className,
      )}
    >
      {(["en", "es"] as const).map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={locale === item}
          onClick={() => switchTo(item)}
          className={cn(
            "rounded-full px-2 py-1 uppercase transition-colors",
            locale === item ? "bg-brand text-brand-foreground" : "text-text-muted hover:text-text",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
