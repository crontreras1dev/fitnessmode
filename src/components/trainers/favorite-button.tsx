"use client";

import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";
import { FAVORITES_CHANGED_EVENT, isFavorite, toggleFavorite } from "@/lib/favorites/storage";

export function FavoriteButton({
  slug,
  label = "Save trainer",
  className,
}: {
  slug: string;
  label?: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setSaved(isFavorite(slug));
    update();
    window.addEventListener(FAVORITES_CHANGED_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [slug]);

  function onClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const next = toggleFavorite(slug);
    setSaved(next);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? `${label} (saved)` : label}
      aria-pressed={saved}
      className={cn(
        "border-border bg-surface text-text hover:bg-surface-muted inline-flex size-9 items-center justify-center rounded-xl border transition-colors",
        saved && "border-danger/30 bg-danger-soft text-danger",
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={mounted && saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className="size-5 transition-colors"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
    </button>
  );
}
