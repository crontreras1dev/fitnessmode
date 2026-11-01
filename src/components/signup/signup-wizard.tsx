"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import type { Taxonomy } from "@/lib/db/queries";
import {
  buildEmailSchema,
  buildProfileSchema,
  emptyProfileInput,
  SIGNUP_STEPS,
  type ProfileFormInput,
  type ProfileFormValues,
} from "@/lib/validation/profile";
import { submitSignup, type SignupResult } from "@/app/[locale]/(auth)/signup/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";
import { BasicsFields, LinksFields, ServicesFields } from "./profile-fields";
import { StepIndicator } from "./step-indicator";

export function SignupWizard({
  taxonomy,
  requireEmail,
}: {
  taxonomy: Taxonomy;
  requireEmail: boolean;
}) {
  const t = useTranslations("signup");
  const tc = useTranslations("common");
  const ta = useTranslations("auth");
  const tv = useTranslations("validation");
  const schema = useMemo(() => buildProfileSchema(tv), [tv]);
  const emailCheck = useMemo(() => buildEmailSchema(tv), [tv]);
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [result, setResult] = useState<SignupResult | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyProfileInput,
    mode: "onTouched",
  });
  const isLast = step === SIGNUP_STEPS.length - 1;
  const stepTitles = SIGNUP_STEPS.map((item) => t(item.titleKey));

  async function next() {
    const valid = await form.trigger([...SIGNUP_STEPS[step].fields], { shouldFocus: true });
    if (valid) {
      setStep((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function onInvalid(errors: FieldErrors<ProfileFormInput>) {
    const index = SIGNUP_STEPS.findIndex((item) => item.fields.some((field) => field in errors));
    if (index >= 0) setStep(index);
  }

  const onSubmit = form.handleSubmit(() => {
    if (requireEmail) {
      const parsed = emailCheck.safeParse(email);
      if (!parsed.success) {
        setEmailError(parsed.error.issues[0]?.message);
        return;
      }
      setEmailError(undefined);
    }
    startTransition(async () => {
      setResult(
        await submitSignup({ profile: form.getValues(), email: requireEmail ? email : undefined }),
      );
    });
  }, onInvalid);

  if (result?.ok) {
    return (
      <Card role="status" className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">{t("checkInbox")}</h2>
        <p className="text-text-muted">
          {t.rich("sentConfirmation", {
            email: result.email,
            strong: (chunks) => <strong className="text-text">{chunks}</strong>,
          })}
        </p>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <StepIndicator steps={stepTitles} current={step} />
      <Card>
        <div hidden={step !== 0}>
          <BasicsFields form={form} />
        </div>
        <div hidden={step !== 1}>
          <ServicesFields form={form} taxonomy={taxonomy} />
        </div>
        <div hidden={step !== 2} className="flex flex-col gap-5">
          <LinksFields form={form} />
          {requireEmail ? (
            <Field
              label={ta("email")}
              htmlFor="email"
              error={emailError}
              hint={t("emailHint")}
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                aria-invalid={emailError ? true : undefined}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
          ) : null}
        </div>
      </Card>
      {result && !result.ok ? (
        <p role="alert" className="text-danger text-sm">
          {result.error}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button variant="secondary" onClick={() => setStep((current) => current - 1)}>
            {tc("back")}
          </Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? t("submitting") : requireEmail ? t("createProfile") : t("submitReview")}
          </Button>
        ) : (
          <Button size="lg" onClick={next}>
            {tc("continue")}
          </Button>
        )}
      </div>
    </form>
  );
}
