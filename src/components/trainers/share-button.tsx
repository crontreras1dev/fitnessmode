"use client";

import { useState } from "react";
import { cn } from "@/components/ui/cn";

export function ShareButton({
  url,
  title,
  className,
}: {
  url: string;
  title?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or share failed; fall back to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? "Link copied" : "Share trainer profile"}
      className={cn(
        "border-border bg-surface text-text hover:bg-surface-muted inline-flex size-9 items-center justify-center rounded-xl border transition-colors",
        className,
      )}
    >
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="size-5"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      ) : (
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
            d="M7.217 10.907a2.25 2.25 0 1 0 .001 2.186 2.25 2.25 0 0 0-.001-2.186Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.413 3.849a2.25 2.25 0 1 0 .94 4.392 2.25 2.25 0 0 0-.94-4.392ZM16.92 7.5a2.25 2.25 0 1 1-4.392.941 2.25 2.25 0 0 1 4.392-.94Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.41 17.655a2.25 2.25 0 1 0-.94 4.392 2.25 2.25 0 0 0 .94-4.392ZM15 12.75a2.25 2.25 0 1 1 4.392.94 2.25 2.25 0 0 1-4.392-.94Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.41 10.907a2.25 2.25 0 1 0-2.186 0 2.25 2.25 0 0 0 2.186 0Z"
          />
        </svg>
      )}
    </button>
  );
}
