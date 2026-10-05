"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import type { Taxonomy } from "@/lib/db/queries";
import {
  emailSchema,
  emptyProfileInput,
  profileSchema,
  SIGNUP_STEPS,
  type ProfileFormInput,
  type ProfileFormValues,
} from "@/lib/validation/profile";
import { submitSignup, type SignupResult } from "@/app/(auth)/signup/actions";
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
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [result, setResult] = useState<SignupResult | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: emptyProfileInput,
    mode: "onTouched",
  });
  const isLast = step === SIGNUP_STEPS.length - 1;

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
      const parsed = emailSchema.safeParse(email);
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
        <h2 className="text-xl font-semibold">Check your inbox</h2>
        <p className="text-text-muted">
          We sent a confirmation link to <strong className="text-text">{result.email}</strong>. Open
          it to publish your profile for review — it usually goes live within 24 hours.
        </p>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <StepIndicator steps={SIGNUP_STEPS.map((item) => item.title)} current={step} />
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
              label="Email"
              htmlFor="email"
              error={emailError}
              hint="We'll send a magic link to confirm — no password needed. Never shown publicly."
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
            Back
          </Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Submitting…" : requireEmail ? "Create my profile" : "Submit for review"}
          </Button>
        ) : (
          <Button size="lg" onClick={next}>
            Continue
          </Button>
        )}
      </div>
    </form>
  );
}
