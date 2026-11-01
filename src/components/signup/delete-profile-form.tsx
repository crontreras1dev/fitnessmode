"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useState, useTransition } from "react";
import { deleteProfile } from "@/app/[locale]/(dashboard)/dashboard/profile/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DeleteProfileForm() {
  const t = useTranslations("deleteProfile");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await deleteProfile(confirmation);
      setError(result.error);
    });
  }

  return (
    <Card className="border-danger/40">
      <h2 className="text-danger text-lg font-semibold">{t("title")}</h2>
      <p className="text-text-muted mt-2 text-sm">{t("body")}</p>
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3">
        <label htmlFor="delete-confirmation" className="text-sm font-medium">
          {t("confirmPrompt")}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="delete-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            className="border-border bg-surface text-text focus:border-danger focus:ring-danger/20 h-11 flex-1 rounded-xl border px-3.5 text-sm focus:ring-2 focus:outline-none"
          />
          <Button type="submit" variant="danger" disabled={pending || confirmation !== "DELETE"}>
            {pending ? t("deleting") : t("delete")}
          </Button>
        </div>
        {error ? (
          <p role="alert" className="text-danger text-sm">
            {error}
          </p>
        ) : null}
      </form>
    </Card>
  );
}
