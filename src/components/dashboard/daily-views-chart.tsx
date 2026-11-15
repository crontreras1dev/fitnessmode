"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type DailyStats = { day: string; views: number; clicks: number };

export function DailyViewsChart({ daily }: { daily: DailyStats[] }) {
  const t = useTranslations("stats");
  const locale = useLocale();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const selected = daily.find((row) => row.day === selectedDay) ?? daily.at(-1);
  const peak = Math.max(1, ...daily.map((row) => row.views));
  const step = Math.max(1, Math.ceil(peak / 4));
  const maximum = step * 4;
  const ticks = [maximum, step * 3, step * 2, step, 0];
  const numbers = new Intl.NumberFormat(locale);
  const dateLabel = (day: string, full = false) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: full ? "long" : "short",
      ...(full ? { year: "numeric" as const } : {}),
      timeZone: "UTC",
    }).format(new Date(`${day}T00:00:00Z`));
  const details = (row: DailyStats) =>
    t("dayTooltip", { day: dateLabel(row.day, true), views: row.views, clicks: row.clicks });

  return (
    <div className="mt-4">
      <p className="text-text-muted mb-3 text-sm">{t("profileViews")}</p>
      <div role="group" aria-label={t("chartAria")}>
        <div className="relative ml-12 h-56">
          <div
            className="pointer-events-none absolute inset-0 flex flex-col justify-between"
            aria-hidden="true"
          >
            {ticks.map((tick) => (
              <div key={tick} className="border-border relative border-t">
                <span className="text-text-muted absolute -left-12 -translate-y-1/2 text-xs tabular-nums">
                  {numbers.format(tick)}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex gap-0.5 sm:gap-1">
            {daily.map((row) => (
              <button
                key={row.day}
                type="button"
                aria-label={details(row)}
                aria-pressed={selected?.day === row.day}
                onMouseEnter={() => setSelectedDay(row.day)}
                onFocus={() => setSelectedDay(row.day)}
                onClick={() => setSelectedDay(row.day)}
                className="group hover:bg-brand/10 focus-visible:outline-brand relative flex h-full min-w-0 flex-1 items-end focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span
                  className={`w-full rounded-t transition-colors ${selected?.day === row.day ? "bg-brand" : "bg-brand/70 group-hover:bg-brand"}`}
                  style={{ height: `${(row.views / maximum) * 100}%` }}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="text-text-muted mt-2 ml-12 flex text-[10px] sm:text-xs" aria-hidden="true">
          {daily.map((row, index) => (
            <div key={row.day} className="relative h-8 min-w-0 flex-1">
              {(index % 7 === 0 && index < daily.length - 4) || index === daily.length - 1 ? (
                <span
                  className={`absolute whitespace-nowrap ${index === 0 ? "left-0" : index === daily.length - 1 ? "right-0" : "left-1/2 -translate-x-1/2"}`}
                >
                  {dateLabel(row.day)}
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <p className="text-text-muted ml-12 text-center text-sm">{t("date")}</p>
      </div>
      <p className="mt-4 min-h-10 text-sm" aria-live="polite" aria-atomic="true">
        {selected ? details(selected) : t("noViews")}
      </p>
      {daily.length > 0 && daily.every((row) => row.views === 0) && (
        <p className="text-text-muted text-sm">{t("noViews")}</p>
      )}
    </div>
  );
}
