"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, type KeyboardEvent } from "react";
import { Controller, useFieldArray, useForm, type UseFormReturn } from "react-hook-form";
import { saveProfileDetails } from "@/app/(dashboard)/dashboard/profile/actions";
import type { Taxonomy } from "@/lib/db/queries";
import {
  detailsSchema,
  type DetailsFormInput,
  type DetailsFormValues,
} from "@/lib/validation/profile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceChip, Field, FieldError, Input } from "@/components/ui/form";

type DetailsForm = UseFormReturn<DetailsFormInput, unknown, DetailsFormValues>;

const LANGUAGE_SUGGESTIONS = [
  "Spanish",
  "English",
  "Italian",
  "French",
  "Portuguese",
  "German",
  "Catalan",
  "Basque",
  "Galician",
  "Dutch",
];

function ChipGroup({
  form,
  name,
  legend,
  options,
}: {
  form: DetailsForm;
  name: "sessionTypeIds" | "amenityIds";
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

function LanguagesField({ form }: { form: DetailsForm }) {
  const [draft, setDraft] = useState("");
  const message = form.formState.errors.languages?.message;

  return (
    <Controller
      control={form.control}
      name="languages"
      render={({ field }) => {
        const languages = (field.value ?? []) as string[];
        const add = () => {
          const value = draft.trim().replace(/\s+/g, " ");
          if (!value) return;
          if (!languages.some((item) => item.toLowerCase() === value.toLowerCase())) {
            field.onChange([...languages, value]);
          }
          setDraft("");
        };
        const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            add();
          } else if (event.key === "Backspace" && !draft && languages.length) {
            field.onChange(languages.slice(0, -1));
          }
        };
        return (
          <Field
            label="Languages"
            htmlFor="languages"
            error={typeof message === "string" ? message : undefined}
            hint="The languages you can coach in. Press Enter or comma to add each one."
          >
            <div className="border-border bg-surface flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2">
              {languages.map((language) => (
                <span
                  key={language}
                  className="bg-brand-soft text-brand-strong inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                >
                  {language}
                  <button
                    type="button"
                    aria-label={`Remove ${language}`}
                    className="hover:text-danger"
                    onClick={() => field.onChange(languages.filter((item) => item !== language))}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="languages"
                list="language-suggestions"
                className="placeholder:text-text-muted/70 min-w-32 flex-1 bg-transparent py-1 text-sm focus:outline-none"
                placeholder={languages.length ? "" : "e.g. Spanish"}
                value={draft}
                maxLength={40}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                onBlur={add}
              />
              <datalist id="language-suggestions">
                {LANGUAGE_SUGGESTIONS.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            </div>
          </Field>
        );
      }}
    />
  );
}

function EducationFields({ form }: { form: DetailsForm }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "education" });
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium">Academic background & certifications</legend>
      {fields.map((item, index) => {
        const degreeError = form.formState.errors.education?.[index]?.degree?.message;
        const yearError = form.formState.errors.education?.[index]?.year?.message;
        return (
          <div
            key={item.id}
            className="rounded-card border-border grid gap-2 border p-3 sm:grid-cols-[2fr_2fr_5rem_auto]"
          >
            <Input
              aria-label={`Degree or certification ${index + 1}`}
              placeholder="Degree or certification"
              maxLength={120}
              {...form.register(`education.${index}.degree`)}
            />
            <Input
              aria-label={`Institution ${index + 1}`}
              placeholder="Institution (optional)"
              maxLength={120}
              {...form.register(`education.${index}.institution`)}
            />
            <Input
              aria-label={`Year ${index + 1}`}
              placeholder="Year"
              inputMode="numeric"
              maxLength={4}
              {...form.register(`education.${index}.year`)}
            />
            <Button type="button" variant="secondary" onClick={() => remove(index)}>
              Remove
            </Button>
            {degreeError || yearError ? (
              <p role="alert" className="text-danger text-sm sm:col-span-4">
                {degreeError ?? yearError}
              </p>
            ) : null}
          </div>
        );
      })}
      {fields.length < 12 ? (
        <Button
          type="button"
          variant="secondary"
          className="self-start"
          onClick={() => append({ degree: "", institution: "", year: "" })}
        >
          Add education
        </Button>
      ) : null}
    </fieldset>
  );
}

export function DetailsForm({
  taxonomy,
  defaultValues,
}: {
  taxonomy: Taxonomy;
  defaultValues: DetailsFormInput;
}) {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<DetailsFormInput, unknown, DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues,
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(() => {
    startTransition(async () => {
      const result = await saveProfileDetails(form.getValues());
      setMessage(
        result.ok ? { ok: true, text: "Details saved." } : { ok: false, text: result.error },
      );
      if (result.ok) form.reset(form.getValues());
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <Card>
        <h2 className="text-lg font-semibold">Details</h2>
        <p className="text-text-muted mt-1 text-sm">
          Extra info that helps clients pick you. It shows on your public profile.
        </p>
        <div className="mt-5 flex flex-col gap-6">
          <ChipGroup
            form={form}
            name="sessionTypeIds"
            legend="Session format"
            options={taxonomy.sessionTypes}
          />
          <ChipGroup
            form={form}
            name="amenityIds"
            legend="Extras & amenities"
            options={taxonomy.amenities}
          />
          <LanguagesField form={form} />
          <EducationFields form={form} />
        </div>
        <div className="mt-6 flex items-center justify-end gap-4">
          {message ? (
            <p role="status" className={message.ok ? "text-brand text-sm" : "text-danger text-sm"}>
              {message.text}
            </p>
          ) : null}
          <Button type="submit" disabled={pending || !form.formState.isDirty}>
            {pending ? "Saving…" : "Save details"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
