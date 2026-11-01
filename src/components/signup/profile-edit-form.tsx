"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { Taxonomy } from "@/lib/db/queries";
import {
  buildProfileSchema,
  type ProfileFormInput,
  type ProfileFormValues,
} from "@/lib/validation/profile";
import { saveProfile } from "@/app/[locale]/(dashboard)/dashboard/profile/actions";
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
  initialCity: CitySuggestion | null;
}) {
  const t = useTranslations("profileForm");
  const tv = useTranslations("validation");
  const schema = useMemo(() => buildProfileSchema(tv), [tv]);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(() => {
    startTransition(async () => {
      const result = await saveProfile(form.getValues());
      setMessage(result.ok ? { ok: true, text: t("saved") } : { ok: false, text: result.error });
      if (result.ok) form.reset(form.getValues());
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-5 text-lg font-semibold">{t("aboutYou")}</h2>
        <BasicsFields form={form} initialCity={initialCity} />
      </Card>
      <Card>
        <h2 className="mb-5 text-lg font-semibold">{t("yourServices")}</h2>
        <ServicesFields form={form} taxonomy={taxonomy} />
      </Card>
      <Card>
        <h2 className="mb-5 text-lg font-semibold">{t("yourLinks")}</h2>
        <LinksFields form={form} />
      </Card>
      <div className="flex items-center justify-end gap-4">
        {message ? (
          <p role="status" className={message.ok ? "text-brand text-sm" : "text-danger text-sm"}>
            {message.text}
          </p>
        ) : null}
        <Button type="submit" size="lg" disabled={pending || !form.formState.isDirty}>
          {pending ? t("saving") : t("saveChanges")}
        </Button>
      </div>
    </form>
  );
}
