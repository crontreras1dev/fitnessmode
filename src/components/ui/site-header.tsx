import Link from "next/link";
import { ButtonLink } from "./button";

export function SiteHeader() {
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
            href="/login"
            className="text-text-muted hover:text-text rounded-full px-3 py-2 text-sm"
          >
            Log in
          </Link>
          <ButtonLink href="/signup" size="sm">
            List yourself free
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
