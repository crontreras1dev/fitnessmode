"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FAVORITES_CHANGED_EVENT, getFavorites } from "@/lib/favorites/storage";

export function FavoritesLink() {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setCount(getFavorites().length);
    update();
    window.addEventListener(FAVORITES_CHANGED_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <Link
      href="/favorites"
      aria-label={mounted && count ? `Saved trainers (${count})` : "Saved trainers"}
      className="text-text-muted hover:text-text relative inline-flex size-9 items-center justify-center rounded-full transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="size-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
      {mounted && count > 0 ? (
        <span className="bg-danger text-brand-foreground absolute -top-0.5 -right-0.5 inline-flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
