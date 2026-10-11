"use client";

import { type FormEvent, useState, useTransition } from "react";
import { deleteProfile } from "@/app/(dashboard)/dashboard/profile/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DeleteProfileForm() {
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
      <h2 className="text-danger text-lg font-semibold">Danger zone</h2>
      <p className="text-text-muted mt-2 text-sm">
        Permanently delete your trainer profile, public listing, and analytics. Your login account
        will remain available, but this profile cannot be recovered.
      </p>
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3">
        <label htmlFor="delete-confirmation" className="text-sm font-medium">
          Type <span className="font-mono">DELETE</span> to confirm
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
            {pending ? "Deleting…" : "Delete profile"}
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
