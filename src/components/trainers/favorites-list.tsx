"use client";

import { useCallback, useEffect, useState } from "react";
import type { Trainer } from "@/lib/db/queries";
import { FAVORITES_CHANGED_EVENT, getFavorites } from "@/lib/favorites/storage";
import { ButtonLink } from "@/components/ui/button";
import { TrainerGrid } from "./trainer-card";

type Status = "loading" | "ready" | "error";

export function FavoritesList() {
  const [status, setStatus] = useState<Status>("loading");
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [slugs, setSlugs] = useState<string[]>([]);

  const load = useCallback(async (nextSlugs: string[]) => {
    setSlugs(nextSlugs);
    if (!nextSlugs.length) {
      setTrainers([]);
      setStatus("ready");
      return;
    }
    try {
      const response = await fetch(`/api/trainers?slugs=${encodeURIComponent(nextSlugs.join(","))}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as { trainers: Trainer[] };
      setTrainers(data.trainers);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load(getFavorites());

    function onFavoritesChanged() {
      const nextSlugs = getFavorites();
      setSlugs(nextSlugs);
      // Trainers already loaded are filtered in place; re-added slugs only
      // arrive via the storage event (other tab), which triggers a reload.
      setTrainers((current) => current.filter((trainer) => nextSlugs.includes(trainer.slug)));
    }

    function onStorage(event: StorageEvent) {
      if (event.key === "fitnessmode:favorites") void load(getFavorites());
    }

    window.addEventListener(FAVORITES_CHANGED_EVENT, onFavoritesChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, onFavoritesChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, [load]);

  if (status === "loading") {
    return (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <li key={index}>
            <div className="rounded-card border-border bg-surface h-72 animate-pulse border" />
          </li>
        ))}
      </ul>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-card border-border flex flex-col items-start gap-4 border border-dashed p-8">
        <h2 className="text-lg font-semibold">Couldn&apos;t load your favorites</h2>
        <p className="text-text-muted">Check your connection and try again.</p>
      </div>
    );
  }

  if (!slugs.length || !trainers.length) {
    return (
      <div className="rounded-card border-border flex flex-col items-start gap-4 border border-dashed p-8">
        <h2 className="text-lg font-semibold">No favorites yet</h2>
        <p className="text-text-muted">
          Tap the heart on any trainer card or profile and they&apos;ll show up here. No account
          needed — your list is saved on this device.
        </p>
        <ButtonLink href="/search">Find a trainer</ButtonLink>
      </div>
    );
  }

  return <TrainerGrid trainers={trainers} showCity />;
}
