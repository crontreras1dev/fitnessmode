"use client";

import { trackOutboundClick } from "@/lib/analytics/client";
import type { ClickTarget } from "@/lib/validation/track";
import { buttonClasses } from "@/components/ui/button";

export type TrainerCta = { target: ClickTarget; href: string; label: string };

export function TrainerCtaButtons({ profileId, ctas }: { profileId: string; ctas: TrainerCta[] }) {
  if (!ctas.length) return null;
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {ctas.map((cta, index) => {
        const external = cta.href.startsWith("http");
        return (
          <a
            key={cta.target}
            href={cta.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer nofollow" : undefined}
            onClick={() => trackOutboundClick(profileId, cta.target)}
            className={buttonClasses({
              variant: index === 0 ? "primary" : "secondary",
              size: "lg",
            })}
          >
            {cta.label}
          </a>
        );
      })}
    </div>
  );
}
