import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { trainerProfilePath } from "@/lib/seo/site";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getStats, requireOwnProfile } from "./data";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ welcome?: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("metaTitle"), robots: { index: false } };
}

export default async function DashboardPage({ params, searchParams }: Props) {
  const [{ locale }, { welcome }] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  const { profile } = await requireOwnProfile();
  const stats = await getStats(30);
  const publicPath = trainerProfilePath(profile);

  return (
    <div className="flex flex-col gap-6">
      {welcome ? (
        <p role="status" className="rounded-card bg-brand-soft text-brand-strong px-5 py-4 text-sm">
          {t("welcome", { name: profile.display_name })}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("greeting", { name: profile.display_name })}
        </h1>
        <div className="flex gap-2">
          <Badge
            tone={
              profile.status === "active"
                ? "brand"
                : profile.status === "suspended"
                  ? "danger"
                  : "amber"
            }
            className="capitalize"
          >
            {t(`status.${profile.status}`)}
          </Badge>
          <Badge tone={profile.tier === "pro" ? "pro" : "neutral"} className="uppercase">
            {t(`tier.${profile.tier}`)}
          </Badge>
        </div>
      </div>
      <Card className="flex flex-col gap-3">
        <p className="text-text-muted">{t(`statusCopy.${profile.status}`)}</p>
        {profile.status === "active" ? (
          <p className="text-sm">
            {t("publicPage")}{" "}
            <Link href={publicPath} className="text-brand font-medium underline">
              {publicPath}
            </Link>
          </p>
        ) : null}
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-text-muted text-sm">{t("views30d")}</p>
          <p className="mt-1 text-3xl font-semibold">{stats.totalViews}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm">{t("clicks30d")}</p>
          <p className="mt-1 text-3xl font-semibold">{stats.totalClicks}</p>
        </Card>
      </div>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/dashboard/profile" variant="secondary">
          {t("editProfile")}
        </ButtonLink>
        <ButtonLink href="/dashboard/stats" variant="secondary">
          {t("viewStats")}
        </ButtonLink>
      </div>
    </div>
  );
}
