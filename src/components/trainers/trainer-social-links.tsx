"use client";

import type { ReactNode } from "react";
import { trackOutboundClick } from "@/lib/analytics/client";
import type { ClickTarget } from "@/lib/validation/track";
import { cn } from "@/components/ui/cn";
import type { TrainerCta } from "./trainer-cta-buttons";

type SocialTarget = Extract<ClickTarget, "instagram" | "tiktok" | "website">;

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-5",
  "aria-hidden": true,
} as const;

const icons: Record<SocialTarget, ReactNode> = {
  instagram: (
    <svg {...iconProps}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  ),
  tiktok: (
    <svg {...iconProps}>
      <path d="M14.5 4v10.25a3.75 3.75 0 1 1-3.75-3.75" />
      <path d="M14.5 4c0 3.2 2.1 5 5.25 5" />
    </svg>
  ),
  website: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.7 2.6 4 5.6 4 9s-1.3 6.4-4 9c-2.7-2.6-4-5.6-4-9s1.3-6.4 4-9Z" />
    </svg>
  ),
};

function isSocialLink(cta: TrainerCta): cta is TrainerCta & { target: SocialTarget } {
  return cta.target in icons;
}

export function TrainerSocialLinks({
  profileId,
  links,
  className,
}: {
  profileId: string;
  links: TrainerCta[];
  className?: string;
}) {
  const social = links.filter(isSocialLink);
  if (!social.length) return null;
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {social.map((link) => (
        <a
          key={link.target}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label={link.label}
          onClick={() => trackOutboundClick(profileId, link.target)}
          className="border-border bg-surface text-text hover:bg-surface-muted inline-flex size-9 items-center justify-center rounded-xl border transition-colors"
        >
          {icons[link.target]}
        </a>
      ))}
    </div>
  );
}
