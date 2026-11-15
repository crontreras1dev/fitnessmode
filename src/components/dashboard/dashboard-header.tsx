"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/components/ui/cn";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

const mobileLinkClass =
  "text-text-muted hover:text-text hover:bg-surface-muted rounded-lg px-3 py-3 text-base font-medium";

export function DashboardHeader() {
  const t = useTranslations("dashboard");
  const th = useTranslations("header");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const nav = [
    { href: "/dashboard", label: t("overview") },
    { href: "/dashboard/profile", label: t("profile") },
    { href: "/dashboard/stats", label: t("stats") },
  ];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const signOutAction = locale === "en" ? "/auth/signout" : `/${locale}/auth/signout`;

  return (
    <header className="border-border bg-surface relative border-b">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/images/logo.png"
            alt="FitnessMode"
            width={2172}
            height={724}
            className="h-8 w-auto sm:h-9"
            priority
          />
        </Link>
        <div className="hidden items-center gap-3 sm:flex">
          <form action={signOutAction} method="post">
            <button
              type="submit"
              className="text-text-muted hover:text-text rounded-full px-3 py-2 text-sm whitespace-nowrap"
            >
              {th("signOut")}
            </button>
          </form>
          <LanguageSwitcher />
        </div>
        <div className="-mr-2 flex items-center gap-1 sm:hidden">
          <button
            type="button"
            className="text-text hover:bg-surface-muted flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2"
            aria-label={th("toggleMenu")}
            aria-expanded={menuOpen}
            aria-controls="dashboard-mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="relative block h-5 w-5" aria-hidden="true">
              <span
                className={cn(
                  "absolute inset-x-0 h-0.5 rounded-full bg-current transition-all duration-200 ease-out",
                  menuOpen ? "top-[9px] rotate-45" : "top-[6px]",
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 h-0.5 rounded-full bg-current transition-all duration-200 ease-out",
                  menuOpen ? "top-[9px] -rotate-45" : "top-[12px]",
                )}
              />
            </span>
          </button>
        </div>
      </div>
      <nav
        className="mx-auto hidden max-w-5xl gap-1 px-2 sm:flex sm:px-4"
        aria-label={t("navAria")}
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-text-muted hover:text-text rounded-t-lg px-3 py-2 text-sm"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <nav
        id="dashboard-mobile-nav"
        aria-hidden={!menuOpen}
        aria-label={t("navAria")}
        className={cn(
          "bg-bg absolute inset-x-0 top-full z-40 h-[calc(100dvh-4rem)] overflow-y-auto transition-all duration-200 ease-out sm:hidden",
          menuOpen
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-2 opacity-0",
        )}
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-4 sm:px-6">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={mobileLinkClass}>
              {item.label}
            </Link>
          ))}
          <div className="border-border my-1 border-t" />
          <form action={signOutAction} method="post">
            <button type="submit" className={`${mobileLinkClass} w-full text-left`}>
              {th("signOut")}
            </button>
          </form>
          <div className="border-border my-1 border-t" />
          <div className="px-3 py-2">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>
    </header>
  );
}
