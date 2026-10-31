"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ButtonLink } from "./button";
import { cn } from "./cn";

const mobileLinkClass =
  "text-text-muted hover:text-text hover:bg-surface-muted rounded-lg px-3 py-3 text-base font-medium";

export function SiteHeader() {
  const [supabase] = useState(createClient);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(Boolean(data.session));
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

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

  return (
    <header className="border-border bg-bg/90 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/images/logo.png"
            alt="FitnessMode"
            width={2172}
            height={724}
            className="h-9 w-auto"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-1 sm:flex sm:gap-2">
          <Link
            href="/search"
            className="text-text-muted hover:text-text hidden rounded-full px-3 py-2 text-sm sm:inline-flex"
          >
            Find a trainer
          </Link>
          <Link
            href="/favorites"
            className="text-text-muted hover:text-text hidden rounded-full px-3 py-2 text-sm sm:inline-flex"
          >
            Favorites
          </Link>
          {isAuthenticated === true ? (
            <>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-text-muted hover:text-text rounded-full px-3 py-2 text-sm"
                >
                  Sign out
                </button>
              </form>
              <ButtonLink href="/dashboard" size="sm">
                Dashboard
              </ButtonLink>
            </>
          ) : isAuthenticated === false ? (
            <>
              <Link
                href="/login"
                className="text-text-muted hover:text-text rounded-full px-3 py-2 text-sm"
              >
                Log in
              </Link>
              <ButtonLink href="/signup" size="sm">
                List yourself free
              </ButtonLink>
            </>
          ) : null}
        </nav>
        <button
          type="button"
          className="text-text hover:bg-surface-muted -mr-2 rounded-lg p-2 sm:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
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
      <nav
        id="mobile-nav"
        aria-hidden={!menuOpen}
        className={cn(
          "bg-bg absolute inset-x-0 top-full z-40 h-[calc(100dvh-4rem)] overflow-y-auto transition-all duration-200 ease-out sm:hidden",
          menuOpen
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-2 opacity-0",
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
          <Link href="/search" className={mobileLinkClass}>
            Find a trainer
          </Link>
          <Link href="/favorites" className={mobileLinkClass}>
            Favorites
          </Link>
          <div className="border-border my-1 border-t" />
          {isAuthenticated === true ? (
            <>
              <Link href="/dashboard" className={mobileLinkClass}>
                Dashboard
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className={`${mobileLinkClass} w-full text-left`}>
                  Sign out
                </button>
              </form>
            </>
          ) : isAuthenticated === false ? (
            <>
              <Link href="/login" className={mobileLinkClass}>
                Log in
              </Link>
              <ButtonLink href="/signup" className="mt-1 w-full">
                List yourself free
              </ButtonLink>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
