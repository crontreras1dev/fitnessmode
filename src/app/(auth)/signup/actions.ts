"use server";

import { redirect } from "next/navigation";
import { createProfile } from "@/lib/db/profile-mutations";
import { absoluteUrl } from "@/lib/seo/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { emailSchema, profileSchema, type ProfileFormInput } from "@/lib/validation/profile";

export type SignupResult =
  { ok: true; status: "email_sent"; email: string } | { ok: false; error: string };

export async function submitSignup(input: {
  profile: ProfileFormInput;
  email?: string;
}): Promise<SignupResult> {
  const parsed = profileSchema.safeParse(input.profile);
  if (!parsed.success) {
    return { ok: false, error: "Some answers need another look. Please review the form." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      await createProfile(supabase, user.id, parsed.data);
    } catch {
      return { ok: false, error: "We couldn't save your profile. Please try again." };
    }
    redirect("/dashboard?welcome=1");
  }

  const email = emailSchema.safeParse(input.email ?? "");
  if (!email.success)
    return { ok: false, error: "Enter a valid email to receive your sign-in link." };

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

  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: {
      emailRedirectTo: absoluteUrl("/auth/callback?next=/dashboard"),
      // Raw wizard answers; re-validated in /auth/callback before the profile is created.
      data: { pending_profile: input.profile },
    },
  });
  if (error) {
    return { ok: false, error: "We couldn't send the sign-in link. Please try again in a minute." };
  }
  return { ok: true, status: "email_sent", email: email.data };
}
