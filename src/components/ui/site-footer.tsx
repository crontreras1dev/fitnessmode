import Link from "next/link";
import { siteConfig } from "@/lib/seo/site";

export function SiteFooter() {
  return (
    <footer className="border-border mt-auto border-t">
      <div className="text-text-muted mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. Free listings, zero commission.
        </p>
        <nav className="flex gap-4">
          <Link href="/search" className="hover:text-text">
            Find a trainer
          </Link>
          <Link href="/signup" className="hover:text-text">
            For trainers
          </Link>
        </nav>
      </div>
    </footer>
  );
}
