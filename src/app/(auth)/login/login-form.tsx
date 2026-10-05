"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { sendLoginLink, type LoginResult } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<LoginResult | null>(null);
  const [pending, startTransition] = useTransition();

  if (result?.ok) {
    return (
      <div role="status" className="rounded-card border-border bg-surface border p-6">
        <h2 className="text-lg font-semibold">Check your inbox</h2>
        <p className="text-text-muted mt-2">
          We sent a sign-in link to <strong className="text-text">{result.email}</strong>.
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
        label="Email"
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
          New here?{" "}
          <Link href="/signup" className="text-brand font-medium underline">
            Create your free profile
          </Link>
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
