"use server";

import { absoluteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";
import { emailSchema } from "@/lib/validation/profile";

export type LoginResult =
  { ok: true; email: string } | { ok: false; error: string; noAccount?: boolean };

export async function sendLoginLink(rawEmail: string, next = "/dashboard"): Promise<LoginResult> {
  const email = emailSchema.safeParse(rawEmail);
  if (!email.success) return { ok: false, error: "Enter a valid email." };

  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: absoluteUrl(`/auth/callback?next=${encodeURIComponent(safeNext)}`),
    },
  });
  if (error) {
    const noAccount = error.code === "otp_disabled" || /signups not allowed/i.test(error.message);
    return {
      ok: false,
      noAccount,
      error: noAccount
        ? "We couldn't find a trainer account for that email."
        : "We couldn't send the sign-in link. Please try again in a minute.",
    };
  }
  return { ok: true, email: email.data };
}
