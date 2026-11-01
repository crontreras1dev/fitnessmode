"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { sendLoginLink, type LoginResult } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<LoginResult | null>(null);
  const [pending, startTransition] = useTransition();

  if (result?.ok) {
    return (
      <div role="status" className="rounded-card border-border bg-surface border p-6">
        <h2 className="text-lg font-semibold">{t("auth.checkInbox")}</h2>
        <p className="text-text-muted mt-2">
          {t.rich("auth.sentLoginLink", {
            email: result.email,
            strong: (chunks) => <strong className="text-text">{chunks}</strong>,
          })}
        </p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => setResult(await sendLoginLink(email, next)));
      }}
    >
      <Field
        label={t("auth.email")}
        htmlFor="login-email"
        error={result && !result.ok ? result.error : undefined}
      >
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={result && !result.ok ? true : undefined}
        />
      </Field>
      {result && !result.ok && result.noAccount ? (
        <p className="text-sm">
          {t("auth.newHere")}{" "}
          <Link href="/signup" className="text-brand font-medium underline">
            {t("common.createFreeProfile")}
          </Link>
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t("auth.sending") : t("auth.emailLoginLink")}
      </Button>
    </form>
  );
}
