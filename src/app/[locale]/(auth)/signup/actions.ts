"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { getPathname, redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createProfile } from "@/lib/db/profile-mutations";
import { absoluteUrl } from "@/lib/seo/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  buildEmailSchema,
  buildProfileSchema,
  type ProfileFormInput,
} from "@/lib/validation/profile";

export type SignupResult =
  { ok: true; status: "email_sent"; email: string } | { ok: false; error: string };

export async function submitSignup(input: {
  profile: ProfileFormInput;
  email?: string;
}): Promise<SignupResult> {
  const [t, tv, locale] = await Promise.all([
    getTranslations("errors"),
    getTranslations("validation"),
    getLocale(),
  ]);

  const parsed = buildProfileSchema(tv).safeParse(input.profile);
  if (!parsed.success) {
    return { ok: false, error: t("reviewForm") };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      await createProfile(supabase, user.id, parsed.data);
    } catch {
      return { ok: false, error: t("saveProfile") };
    }
    redirect({ href: "/dashboard?welcome=1", locale: locale as Locale });
  }

  const email = buildEmailSchema(tv).safeParse(input.email ?? "");
  if (!email.success) return { ok: false, error: t("validEmailForLink") };

  // Server-side copy of the wizard answers. `options.data` below only reaches
  // user_metadata when the OTP creates a *new* auth user — for emails that
  // already exist in auth.users it is ignored, so /auth/callback falls back to
  // this table. Raw input is stored; it's re-validated before profile creation.
  const admin = createAdminClient();
  if (admin) {
    const { error: pendingError } = await admin
      .from("pending_signups")
      .upsert({ email: email.data, profile: input.profile });
    if (pendingError) {
      console.error("pending_signups upsert failed", { error: pendingError });
    }
  }

  const next = getPathname({ href: "/dashboard", locale: locale as Locale });
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: {
      emailRedirectTo: absoluteUrl(`/auth/callback?next=${encodeURIComponent(next)}`),
      // Raw wizard answers; re-validated in /auth/callback before the profile is created.
      data: { pending_profile: input.profile },
    },
  });
  if (error) {
    return { ok: false, error: t("sendLinkFailed") };
  }
  return { ok: true, status: "email_sent", email: email.data };
}
