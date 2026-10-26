"use client";

import { useEffect, useState } from "react";
import type { Trainer } from "@/lib/db/queries";
import { TrainerCard } from "./trainer-card";

function pickRandom(pool: Trainer[], count: number) {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function TrainerCarousel({ pool, count = 5 }: { pool: Trainer[]; count?: number }) {
  const [trainers, setTrainers] = useState(() => pool.slice(0, count));

  useEffect(() => {
    setTrainers(pickRandom(pool, count));
  }, [pool, count]);

  // A marquee needs enough unique cards to fill the viewport twice without
  // obvious repeats; below the threshold a static row looks better.
  if (trainers.length < 4) {
    return (
      <ul className="flex flex-wrap justify-center gap-4">
        {trainers.map((trainer) => (
          <li key={trainer.id} className="w-72 sm:w-80">
            <TrainerCard trainer={trainer} showCity />
          </li>
        ))}
      </ul>
    );
  }

  // Repeat the set enough times that half the track always covers the viewport.
  const copies = Math.max(2, Math.ceil(8 / trainers.length));
  const items = Array.from({ length: copies }, () => trainers).flat();

  return (
    <div className="overflow-hidden">
      <ul className="animate-marquee flex w-max hover:[animation-play-state:paused]">
        {items.map((trainer, index) => (
          <li
            key={`${trainer.id}-${index}`}
            aria-hidden={index >= trainers.length}
            className="w-72 shrink-0 pr-4 sm:w-80"
          >
            <TrainerCard trainer={trainer} showCity />
          </li>
        ))}
      </ul>
    </div>
  );
}
