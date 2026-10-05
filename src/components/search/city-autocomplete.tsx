"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { Input } from "@/components/ui/form";

export type CitySuggestion = {
  id: number;
  slug: string;
  name: string;
  region: string | null;
  country_code: string;
  is_published: boolean;
  nearest?: boolean;
};

type Props = {
  id?: string;
  value?: CitySuggestion | null;
  onChange: (city: CitySuggestion | null) => void;
  placeholder?: string;
  invalid?: boolean;
  className?: string;
  inputClassName?: string;
};

export function CityAutocomplete({
  id,
  value,
  onChange,
  placeholder = "City",
  invalid,
  className,
  inputClassName,
}: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-listbox`;
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState<CitySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value?.name ?? "");
  }, [value?.name]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const json = (await response.json()) as { results: CitySuggestion[] };
        setResults(json.results);
        setActive(json.results.length ? 0 : -1);
      } catch {
        // aborted or offline
      }
    }, 150);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query, open]);

  function select(city: CitySuggestion) {
    onChange(city);
    setQuery(city.name);
    setOpen(false);
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        id={inputId}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        className={inputClassName}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setOpen(false), 120);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
        onKeyDown={(event) => {
          if (!open || !results.length) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => (index + 1) % results.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => (index - 1 + results.length) % results.length);
          } else if (event.key === "Enter" && active >= 0) {
            event.preventDefault();
            select(results[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && results.length ? (
        <ul
          id={listId}
          role="listbox"
          className="border-border bg-surface absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-auto rounded-xl border p-1 shadow-lg"
        >
          {results.map((city, index) => (
            <li
              key={city.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseDown={(event) => {
                event.preventDefault();
                if (blurTimeout.current) clearTimeout(blurTimeout.current);
                select(city);
              }}
              onMouseEnter={() => setActive(index)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm",
                index === active && "bg-surface-muted",
              )}
            >
              <span>
                <span className="font-medium">{city.name}</span>
                <span className="text-text-muted">
                  {" "}
                  {[city.region, city.country_code].filter(Boolean).join(", ")}
                </span>
              </span>
              {city.nearest ? (
                <span className="text-text-muted text-xs">Nearest listed city</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
