"use client";

import { useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
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
  const [city, setCity] = useState<CitySuggestion | null>(initialCity ?? null);
  const name = errorProps(form, "displayName");
  const cityError = errorProps(form, "cityId");
  const headline = errorProps(form, "headline");
  const bio = errorProps(form, "bio");
  return (
    <div className="flex flex-col gap-5">
      <Field label="Your name" htmlFor="displayName" error={name.error}>
        <Input
          id="displayName"
          autoComplete="name"
          aria-invalid={name.invalid || undefined}
          {...form.register("displayName")}
        />
      </Field>
      <Field
        label="City"
        htmlFor="cityId"
        error={cityError.error}
        hint="Where you train clients in person (or where you're based if you coach online)."
      >
        <Controller
          control={form.control}
          name="cityId"
          render={({ field }) => (
            <CityAutocomplete
              id="cityId"
              value={city}
              invalid={cityError.invalid}
              placeholder="Start typing your city"
              onChange={(next) => {
                setCity(next);
                field.onChange(next?.id ?? 0);
              }}
            />
          )}
        />
      </Field>
      <Field
        label="Headline (optional)"
        htmlFor="headline"
        error={headline.error}
        hint="e.g. Strength coach for busy professionals"
      >
        <Input id="headline" maxLength={120} {...form.register("headline")} />
      </Field>
      <Field
        label="Bio"
        htmlFor="bio"
        error={bio.error}
        hint="Your experience, certifications and how you work."
      >
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
}: {
  form: ProfileForm;
  name: "categoryIds" | "modalityIds" | "specialtyIds";
  legend: string;
  options: Taxonomy["categories"];
}) {
  const message = form.formState.errors[name]?.message;
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <ChoiceChip
            key={option.id}
            label={option.name}
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
  const rateMin = errorProps(form, "rateMin");
  const rateMax = errorProps(form, "rateMax");
  return (
    <div className="flex flex-col gap-6">
      <ChoiceGroup
        form={form}
        name="categoryIds"
        legend="What kind of trainer are you?"
        options={taxonomy.categories}
      />
      <ChoiceGroup
        form={form}
        name="modalityIds"
        legend="Where do you train clients?"
        options={taxonomy.modalities}
      />
      <ChoiceGroup
        form={form}
        name="specialtyIds"
        legend="Specialties (up to 5)"
        options={taxonomy.specialties}
      />
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Rate per session (optional)</legend>
        <div className="mt-2 grid grid-cols-[1fr_1fr_7rem] gap-2">
          <Input
            aria-label="Minimum rate"
            placeholder="Min"
            inputMode="numeric"
            aria-invalid={rateMin.invalid || undefined}
            {...form.register("rateMin")}
          />
          <Input
            aria-label="Maximum rate"
            placeholder="Max"
            inputMode="numeric"
            aria-invalid={rateMax.invalid || undefined}
            {...form.register("rateMax")}
          />
          <Select aria-label="Currency" {...form.register("currency")}>
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
  const instagram = errorProps(form, "instagramUrl");
  const tiktok = errorProps(form, "tiktokUrl");
  const website = errorProps(form, "websiteUrl");
  const whatsapp = errorProps(form, "whatsapp");
  const phone = errorProps(form, "phone");
  return (
    <div className="flex flex-col gap-5">
      <p className="text-text-muted text-sm">
        Clients check your real work before reaching out. Add at least one link.
      </p>
      <Field
        label="Instagram"
        htmlFor="instagramUrl"
        error={instagram.error}
        hint="@handle or profile URL"
      >
        <Input
          id="instagramUrl"
          placeholder="@yourhandle"
          aria-invalid={instagram.invalid || undefined}
          {...form.register("instagramUrl")}
        />
      </Field>
      <Field label="TikTok" htmlFor="tiktokUrl" error={tiktok.error} hint="@handle or profile URL">
        <Input
          id="tiktokUrl"
          placeholder="@yourhandle"
          aria-invalid={tiktok.invalid || undefined}
          {...form.register("tiktokUrl")}
        />
      </Field>
      <Field label="Website" htmlFor="websiteUrl" error={website.error}>
        <Input
          id="websiteUrl"
          placeholder="yoursite.com"
          aria-invalid={website.invalid || undefined}
          {...form.register("websiteUrl")}
        />
      </Field>
      <div className="rounded-card border-border grid gap-5 border border-dashed p-4 sm:grid-cols-2">
        <p className="text-text-muted text-sm sm:col-span-2">
          Direct WhatsApp &amp; Call buttons are a Pro feature. Add them now and they&apos;ll go
          live when you upgrade — they stay private until then.
        </p>
        <Field label="WhatsApp (optional)" htmlFor="whatsapp" error={whatsapp.error}>
          <Input
            id="whatsapp"
            type="tel"
            placeholder="+34600111222"
            aria-invalid={whatsapp.invalid || undefined}
            {...form.register("whatsapp")}
          />
        </Field>
        <Field label="Phone (optional)" htmlFor="phone" error={phone.error}>
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
  basics: ["displayName", "cityId", "headline", "bio"],
  services: ["categoryIds", "modalityIds", "specialtyIds", "rateMin", "rateMax", "currency"],
  links: ["instagramUrl", "tiktokUrl", "websiteUrl", "whatsapp", "phone"],
} as const satisfies Record<string, readonly (keyof ProfileFormInput)[]>;
