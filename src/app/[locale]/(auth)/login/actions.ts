"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";
import { buildEmailSchema } from "@/lib/validation/profile";

export type LoginResult =
  { ok: true; email: string } | { ok: false; error: string; noAccount?: boolean };

export async function sendLoginLink(rawEmail: string, next?: string): Promise<LoginResult> {
  const [t, tv, locale] = await Promise.all([
    getTranslations("errors"),
    getTranslations("validation"),
    getLocale(),
  ]);

  const email = buildEmailSchema(tv).safeParse(rawEmail);
  if (!email.success) return { ok: false, error: t("validEmail") };

  const fallbackNext = getPathname({ href: "/dashboard", locale: locale as Locale });
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : fallbackNext;
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
      error: noAccount ? t("noAccount") : t("sendLinkFailed"),
    };
  }
  return { ok: true, email: email.data };
}
