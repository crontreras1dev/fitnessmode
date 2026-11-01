"use client";

import { useMessages, useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { termName } from "@/i18n/terms";
import type { Taxonomy } from "@/lib/db/queries";
import {
  CURRENCIES,
  type ProfileFormInput,
  type ProfileFormValues,
} from "@/lib/validation/profile";
import { CityAutocomplete, type CitySuggestion } from "@/components/search/city-autocomplete";
import { ChoiceChip, Field, FieldError, Input, Select, Textarea } from "@/components/ui/form";

export type ProfileForm = UseFormReturn<ProfileFormInput, unknown, ProfileFormValues>;

function errorProps(form: ProfileForm, name: keyof ProfileFormInput) {
  const message = form.formState.errors[name]?.message;
  return {
    error: typeof message === "string" ? message : undefined,
    invalid: Boolean(message),
  };
}

export function BasicsFields({
  form,
  initialCity,
}: {
  form: ProfileForm;
  initialCity?: CitySuggestion | null;
}) {
  const t = useTranslations("profileForm");
  const [city, setCity] = useState<CitySuggestion | null>(initialCity ?? null);
  const [customMode, setCustomMode] = useState(
    () => !initialCity && Boolean(form.getValues("customLocation")),
  );
  const name = errorProps(form, "displayName");
  const cityError = errorProps(form, "cityId");
  const customLocation = errorProps(form, "customLocation");
  const locationError = cityError.error ?? customLocation.error;
  const headline = errorProps(form, "headline");
  const bio = errorProps(form, "bio");
  return (
    <div className="flex flex-col gap-5">
      <Field label={t("yourName")} htmlFor="displayName" error={name.error}>
        <Input
          id="displayName"
          autoComplete="name"
          aria-invalid={name.invalid || undefined}
          {...form.register("displayName")}
        />
      </Field>
      <Field
        label={t("city")}
        htmlFor={customMode ? "customLocation" : "cityId"}
        error={locationError}
        hint={t("cityHint")}
      >
        {customMode ? (
          <Input
            id="customLocation"
            placeholder={t("customLocationPlaceholder")}
            maxLength={120}
            aria-invalid={cityError.invalid || customLocation.invalid || undefined}
            {...form.register("customLocation")}
          />
        ) : (
          <Controller
            control={form.control}
            name="cityId"
            render={({ field }) => (
              <CityAutocomplete
                id="cityId"
                value={city}
                invalid={cityError.invalid}
                placeholder={t("cityPlaceholder")}
                onChange={(next) => {
                  setCity(next);
                  field.onChange(next?.id ?? 0);
                }}
              />
            )}
          />
        )}
        <button
          type="button"
          className="text-brand mt-1.5 self-start text-sm font-medium hover:underline"
          onClick={() => {
            if (customMode) {
              form.setValue("customLocation", "", { shouldValidate: true });
            } else {
              setCity(null);
              form.setValue("cityId", 0, { shouldValidate: true });
            }
            setCustomMode(!customMode);
          }}
        >
          {customMode ? t("chooseListedCity") : t("cityNotListed")}
        </button>
      </Field>
      <Field
        label={t("headline")}
        htmlFor="headline"
        error={headline.error}
        hint={t("headlineHint")}
      >
        <Input id="headline" maxLength={120} {...form.register("headline")} />
      </Field>
      <Field label={t("bio")} htmlFor="bio" error={bio.error} hint={t("bioHint")}>
        <Textarea
          id="bio"
          maxLength={1500}
          aria-invalid={bio.invalid || undefined}
          {...form.register("bio")}
        />
      </Field>
    </div>
  );
}

function ChoiceGroup({
  form,
  name,
  legend,
  options,
  kind,
}: {
  form: ProfileForm;
  name: "categoryIds" | "modalityIds" | "specialtyIds";
  legend: string;
  options: Taxonomy["categories"];
  kind: "categories" | "modalities" | "specialties";
}) {
  const messages = useMessages();
  const message = form.formState.errors[name]?.message;
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <ChoiceChip
            key={option.id}
            label={termName(messages, kind, option)}
            value={String(option.id)}
            {...form.register(name)}
          />
        ))}
      </div>
      <FieldError message={typeof message === "string" ? message : undefined} />
    </fieldset>
  );
}

export function ServicesFields({ form, taxonomy }: { form: ProfileForm; taxonomy: Taxonomy }) {
  const t = useTranslations("profileForm");
  const rateMin = errorProps(form, "rateMin");
  const rateMax = errorProps(form, "rateMax");
  return (
    <div className="flex flex-col gap-6">
      <ChoiceGroup
        form={form}
        name="categoryIds"
        legend={t("categoryLegend")}
        options={taxonomy.categories}
        kind="categories"
      />
      <ChoiceGroup
        form={form}
        name="modalityIds"
        legend={t("modalityLegend")}
        options={taxonomy.modalities}
        kind="modalities"
      />
      <ChoiceGroup
        form={form}
        name="specialtyIds"
        legend={t("specialtyLegend")}
        options={taxonomy.specialties}
        kind="specialties"
      />
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">{t("rateLegend")}</legend>
        <div className="mt-2 grid grid-cols-[1fr_1fr_7rem] gap-2">
          <Input
            aria-label={t("minRate")}
            placeholder={t("min")}
            inputMode="numeric"
            aria-invalid={rateMin.invalid || undefined}
            {...form.register("rateMin")}
          />
          <Input
            aria-label={t("maxRate")}
            placeholder={t("max")}
            inputMode="numeric"
            aria-invalid={rateMax.invalid || undefined}
            {...form.register("rateMax")}
          />
          <Select aria-label={t("currency")} {...form.register("currency")}>
            {CURRENCIES.map((currency) => (
              <option key={currency}>{currency}</option>
            ))}
          </Select>
        </div>
        <FieldError message={rateMin.error ?? rateMax.error} />
      </fieldset>
    </div>
  );
}

export function LinksFields({ form }: { form: ProfileForm }) {
  const t = useTranslations("profileForm");
  const instagram = errorProps(form, "instagramUrl");
  const tiktok = errorProps(form, "tiktokUrl");
  const website = errorProps(form, "websiteUrl");
  const whatsapp = errorProps(form, "whatsapp");
  const phone = errorProps(form, "phone");
  return (
    <div className="flex flex-col gap-5">
      <p className="text-text-muted text-sm">{t("linksIntro")}</p>
      <Field
        label="Instagram"
        htmlFor="instagramUrl"
        error={instagram.error}
        hint={t("handleHint")}
      >
        <Input
          id="instagramUrl"
          placeholder={t("handlePlaceholder")}
          aria-invalid={instagram.invalid || undefined}
          {...form.register("instagramUrl")}
        />
      </Field>
      <Field label="TikTok" htmlFor="tiktokUrl" error={tiktok.error} hint={t("handleHint")}>
        <Input
          id="tiktokUrl"
          placeholder={t("handlePlaceholder")}
          aria-invalid={tiktok.invalid || undefined}
          {...form.register("tiktokUrl")}
        />
      </Field>
      <Field label={t("website")} htmlFor="websiteUrl" error={website.error}>
        <Input
          id="websiteUrl"
          placeholder={t("websitePlaceholder")}
          aria-invalid={website.invalid || undefined}
          {...form.register("websiteUrl")}
        />
      </Field>
      <div className="rounded-card border-border grid gap-5 border border-dashed p-4 sm:grid-cols-2">
        <p className="text-text-muted text-sm sm:col-span-2">{t("proContactNote")}</p>
        <Field label={t("whatsapp")} htmlFor="whatsapp" error={whatsapp.error}>
          <Input
            id="whatsapp"
            type="tel"
            placeholder="+34600111222"
            aria-invalid={whatsapp.invalid || undefined}
            {...form.register("whatsapp")}
          />
        </Field>
        <Field label={t("phone")} htmlFor="phone" error={phone.error}>
          <Input
            id="phone"
            type="tel"
            placeholder="+34600111222"
            aria-invalid={phone.invalid || undefined}
            {...form.register("phone")}
          />
        </Field>
      </div>
    </div>
  );
}

export const STEP_FIELDS = {
  basics: ["displayName", "cityId", "customLocation", "headline", "bio"],
  services: ["categoryIds", "modalityIds", "specialtyIds", "rateMin", "rateMax", "currency"],
  links: ["instagramUrl", "tiktokUrl", "websiteUrl", "whatsapp", "phone"],
} as const satisfies Record<string, readonly (keyof ProfileFormInput)[]>;
