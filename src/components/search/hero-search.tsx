"use client";

import { useMessages, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { termName } from "@/i18n/terms";
import type { Term } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { CityAutocomplete, type CitySuggestion } from "./city-autocomplete";

export function HeroSearch({ modalities }: { modalities: Term[] }) {
  const t = useTranslations("home");
  const messages = useMessages();
  const router = useRouter();
  const [city, setCity] = useState<CitySuggestion | null>(null);
  const [modality, setModality] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (city?.is_published && !modality) {
      router.push(`/trainers/${city.slug}`);
      return;
    }
    const params = new URLSearchParams();
    if (city) params.set("city", city.slug);
    if (modality) params.set("modality", modality);
    router.push(`/search${params.size ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="rounded-card border-border bg-surface flex w-full flex-col gap-2 border p-2 shadow-sm sm:flex-row sm:items-center"
    >
      <label htmlFor="hero-city" className="sr-only">
        {t("cityLabel")}
      </label>
      <CityAutocomplete
        id="hero-city"
        value={city}
        onChange={setCity}
        placeholder={t("cityPlaceholder")}
        className="flex-1"
        inputClassName="border-transparent sm:h-12"
      />
      <label htmlFor="hero-modality" className="sr-only">
        {t("modalityLabel")}
      </label>
      <Select
        id="hero-modality"
        value={modality}
        onChange={(event) => setModality(event.target.value)}
        className="border-transparent sm:h-12 sm:w-44"
      >
        <option value="">{t("anyModality")}</option>
        {modalities.map((item) => (
          <option key={item.slug} value={item.slug}>
            {termName(messages, "modalities", item)}
          </option>
        ))}
      </Select>
      <Button type="submit" size="lg">
        {t("findTrainers")}
      </Button>
    </form>
  );
}
