import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Trainer log in", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Trainer log in</h1>
        <p className="text-text-muted mt-2">
          We&apos;ll email you a magic link — no password needed. Clients don&apos;t need an
          account.
        </p>
      </header>
      {error ? (
        <p role="alert" className="bg-pro-soft text-danger rounded-xl px-4 py-3 text-sm">
          That sign-in link is invalid or has expired. Request a new one below.
        </p>
      ) : null}
      <LoginForm next={next} />
      <p className="text-text-muted text-sm">
        Not listed yet?{" "}
        <Link href="/signup" className="text-brand font-medium underline">
          Create your free profile
        </Link>
      </p>
    </div>
  );
}
