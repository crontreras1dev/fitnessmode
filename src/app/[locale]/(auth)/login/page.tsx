import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthDivider, GoogleAuthButton } from "@/components/auth/google-auth-button";
import { LoginForm } from "./login-form";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("loginMetaTitle"), robots: { index: false } };
}

export default async function LoginPage({ params, searchParams }: Props) {
  const [{ locale }, { next, error }] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const tc = await getTranslations("common");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{t("loginTitle")}</h1>
        <p className="text-text-muted mt-2">{t("loginSubtitle")}</p>
      </header>
      {error ? (
        <p role="alert" className="bg-pro-soft text-danger rounded-xl px-4 py-3 text-sm">
          {error === "oauth" ? t("oauthError") : t("linkError")}
        </p>
      ) : null}
      <GoogleAuthButton next={next ?? "/dashboard"} failurePath="/login" />
      <AuthDivider />
      <LoginForm next={next} />
      <p className="text-text-muted text-sm">
        {t("notListed")}{" "}
        <Link href="/signup" className="text-brand font-medium underline">
          {tc("createFreeProfile")}
        </Link>
      </p>
    </div>
  );
}
