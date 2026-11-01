import { getLocale, getTranslations } from "next-intl/server";
import { getPathname, Link, redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { SiteFooter } from "@/components/ui/site-footer";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/login?next=/dashboard", locale: (await getLocale()) as Locale });

  const [t, th, locale] = await Promise.all([
    getTranslations("dashboard"),
    getTranslations("header"),
    getLocale(),
  ]);
  const signOutAction = getPathname({ href: "/auth/signout", locale: locale as Locale });
  const nav = [
    { href: "/dashboard", label: t("overview") },
    { href: "/dashboard/profile", label: t("profile") },
    { href: "/dashboard/stats", label: t("stats") },
  ];

  return (
    <>
      <header className="border-border bg-surface border-b">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Fitness<span className="text-brand">Mode</span>
          </Link>
          <div className="flex items-center gap-3">
            <form action={signOutAction} method="post">
              <button type="submit" className="text-text-muted hover:text-text text-sm">
                {th("signOut")}
              </button>
            </form>
            <LanguageSwitcher />
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-2 sm:px-4" aria-label={t("navAria")}>
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
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <SiteFooter />
    </>
  );
}
