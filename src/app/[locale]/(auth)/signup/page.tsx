import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getTaxonomy } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { AuthDivider, GoogleAuthButton } from "@/components/auth/google-auth-button";
import { LegalConsent } from "@/components/legal/legal-consent";
import { SignupWizard } from "@/components/signup/signup-wizard";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "signup" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function SignupPage({ params, searchParams }: Props) {
  const [{ locale }, { error }, supabase, t, ta] = await Promise.all([
    params,
    searchParams,
    createClient(),
    getTranslations("signup"),
    getTranslations("auth"),
  ]);
  setRequestLocale(locale);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (profile) redirect({ href: "/dashboard", locale });
  }
  const taxonomy = await getTaxonomy();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-text-muted mt-2">{t("subtitle")}</p>
      </header>
      {error === "oauth" ? (
        <p role="alert" className="bg-pro-soft text-danger rounded-xl px-4 py-3 text-sm">
          {ta("signupOauthError")}
        </p>
      ) : null}
      {error === "profile" ? (
        <p role="alert" className="bg-pro-soft text-danger rounded-xl px-4 py-3 text-sm">
          {ta("signupProfileError")}
        </p>
      ) : null}
      {!user ? (
        <>
          <GoogleAuthButton next="/signup" failurePath="/signup" />
          <LegalConsent className="mt-3 text-center" />
          <AuthDivider />
        </>
      ) : null}
      <SignupWizard taxonomy={taxonomy} requireEmail={!user} />
    </div>
  );
}
