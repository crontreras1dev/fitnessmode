"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { Taxonomy } from "@/lib/db/queries";
import {
  profileSchema,
  type ProfileFormInput,
  type ProfileFormValues,
} from "@/lib/validation/profile";
import { saveProfile } from "@/app/(dashboard)/dashboard/profile/actions";
import type { CitySuggestion } from "@/components/search/city-autocomplete";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BasicsFields, LinksFields, ServicesFields } from "./profile-fields";

export function ProfileEditForm({
  taxonomy,
  defaultValues,
  initialCity,
}: {
  taxonomy: Taxonomy;
  defaultValues: ProfileFormInput;
  initialCity: CitySuggestion;
}) {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(() => {
    startTransition(async () => {
      const result = await saveProfile(form.getValues());
      setMessage(
        result.ok ? { ok: true, text: "Profile saved." } : { ok: false, text: result.error },
      );
      if (result.ok) form.reset(form.getValues());
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-5 text-lg font-semibold">About you</h2>
        <BasicsFields form={form} initialCity={initialCity} />
      </Card>
      <Card>
        <h2 className="mb-5 text-lg font-semibold">Your services</h2>
        <ServicesFields form={form} taxonomy={taxonomy} />
      </Card>
      <Card>
        <h2 className="mb-5 text-lg font-semibold">Your links</h2>
        <LinksFields form={form} />
      </Card>
      <div className="flex items-center justify-end gap-4">
        {message ? (
          <p role="status" className={message.ok ? "text-brand text-sm" : "text-danger text-sm"}>
            {message.text}
          </p>
        ) : null}
        <Button type="submit" size="lg" disabled={pending || !form.formState.isDirty}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
