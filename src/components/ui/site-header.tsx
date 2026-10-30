"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ButtonLink } from "./button";

export function SiteHeader() {
  const [supabase] = useState(createClient);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(Boolean(data.session));
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  return (
    <header className="border-border bg-bg/90 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Fitness<span className="text-brand">Mode</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
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
      </div>
    </header>
  );
}
