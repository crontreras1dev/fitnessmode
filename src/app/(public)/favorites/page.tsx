import type { Metadata } from "next";
import Link from "next/link";
import { FavoritesList } from "@/components/trainers/favorites-list";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your favorite personal trainers, kept on this device. No account needed.",
  robots: { index: false },
};

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-text-muted text-sm">
        <Link href="/" className="hover:text-text">
          Home
        </Link>{" "}
        / <span className="text-text">Favorites</span>
      </nav>
      <header className="mt-4 flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Favorites</h1>
        <p className="text-text-muted max-w-2xl">
          Your favorite trainers are stored on this device — no account needed.
        </p>
      </header>

      <section className="mt-8">
        <FavoritesList />
      </section>
    </div>
  );
}
