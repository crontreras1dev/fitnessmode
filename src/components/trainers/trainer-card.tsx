"use client";

import Link from "next/link";
import type { Trainer } from "@/lib/db/queries";
import { absoluteUrl, profilePath } from "@/lib/seo/site";
import { ButtonLink } from "@/components/ui/button";
import { FavoriteButton } from "./favorite-button";
import { ShareButton } from "./share-button";
import { TrainerAvatar } from "./trainer-avatar";

export function TrainerCard({
  trainer,
  showCity = false,
}: {
  trainer: Trainer;
  showCity?: boolean;
}) {
  const url = absoluteUrl(profilePath(trainer.city.slug, trainer.slug));

  return (
    <article className="group rounded-card border-border bg-surface flex h-full flex-col items-center gap-4 border p-5 text-center transition-shadow hover:shadow-md">
      <Link href={profilePath(trainer.city.slug, trainer.slug)}>
        <TrainerAvatar name={trainer.displayName} avatarUrl={trainer.avatarUrl} size="xl" />
      </Link>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">
          <Link
            href={profilePath(trainer.city.slug, trainer.slug)}
            className="hover:text-brand-strong transition-colors"
          >
            {trainer.displayName}
          </Link>
        </h3>
        <p className="text-text-muted text-sm">
          {showCity ? trainer.city.name : `Trainer in ${trainer.city.name}`}
        </p>
      </div>

      <p className="text-text-muted min-h-[1.25rem] text-sm">
        {trainer.modalities.length
          ? trainer.modalities.map((modality) => modality.name).join(" · ")
          : "\u00A0"}
      </p>

      <p className="text-text-muted line-clamp-3 min-h-[3.75rem] text-sm">
        {trainer.headline || trainer.bio ? trainer.headline || trainer.bio : "\u00A0"}
      </p>

      <div className="mt-auto flex w-full items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-1">
          <ShareButton url={url} title={trainer.displayName} />
          <FavoriteButton slug={trainer.slug} />
        </div>
        <ButtonLink
          href={profilePath(trainer.city.slug, trainer.slug)}
          variant="secondary"
          size="sm"
        >
          See Profile
        </ButtonLink>
      </div>
    </article>
  );
}

export function TrainerGrid({ trainers, showCity }: { trainers: Trainer[]; showCity?: boolean }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {trainers.map((trainer) => (
        <li key={trainer.id} className="flex">
          <div className="flex-1">
            <TrainerCard trainer={trainer} showCity={showCity} />
          </div>
        </li>
      ))}
    </ul>
  );
}
