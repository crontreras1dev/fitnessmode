import Link from "next/link";
import type { Trainer } from "@/lib/db/queries";
import { formatRate } from "@/lib/format";
import { profilePath } from "@/lib/seo/site";
import { Badge } from "@/components/ui/badge";
import { TrainerAvatar } from "./trainer-avatar";

export function TrainerCard({
  trainer,
  showCity = false,
}: {
  trainer: Trainer;
  showCity?: boolean;
}) {
  const rate = formatRate(trainer.rateMin, trainer.rateMax, trainer.currency);
  return (
    <article className="group rounded-card border-border bg-surface relative flex flex-col gap-4 border p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <TrainerAvatar name={trainer.displayName} avatarUrl={trainer.avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold">
              <Link
                href={profilePath(trainer.city.slug, trainer.slug)}
                className="after:rounded-card after:absolute after:inset-0"
              >
                {trainer.displayName}
              </Link>
            </h3>
            {trainer.tier === "pro" ? <Badge tone="pro">Verified</Badge> : null}
          </div>
          <p className="text-text-muted mt-0.5 text-sm">
            {trainer.categories.map((category) => category.name).join(" · ") || "Trainer"}
            {showCity ? ` · ${trainer.city.name}` : null}
          </p>
        </div>
      </div>
      {trainer.headline || trainer.bio ? (
        <p className="text-text-muted line-clamp-2 text-sm">{trainer.headline || trainer.bio}</p>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        {trainer.modalities.map((modality) => (
          <Badge key={modality.slug} tone="brand">
            {modality.name}
          </Badge>
        ))}
        {rate ? <span className="ml-auto text-sm font-medium">{rate}</span> : null}
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
