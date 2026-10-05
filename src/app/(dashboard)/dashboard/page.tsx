import type { Metadata } from "next";
import Link from "next/link";
import { profilePath } from "@/lib/seo/site";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getStats, requireOwnProfile } from "./data";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

const STATUS_COPY = {
  pending: "Your profile is in review. We check every new listing to keep the directory spam-free.",
  active: "Your profile is live and visible in search.",
  suspended: "Your profile is hidden. Contact support if you think this is a mistake.",
} as const;

type Props = { searchParams: Promise<{ welcome?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const { welcome } = await searchParams;
  const { profile } = await requireOwnProfile();
  const stats = await getStats(30);
  const publicPath = profilePath(profile.city.slug, profile.slug);

  return (
    <div className="flex flex-col gap-6">
      {welcome ? (
        <p role="status" className="rounded-card bg-brand-soft text-brand-strong px-5 py-4 text-sm">
          Welcome to FitnessMode, {profile.display_name}! Your profile was submitted for review.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Hi, {profile.display_name}</h1>
        <div className="flex gap-2">
          <Badge tone={profile.status === "active" ? "brand" : "neutral"} className="capitalize">
            {profile.status}
          </Badge>
          <Badge tone={profile.tier === "pro" ? "pro" : "neutral"} className="uppercase">
            {profile.tier}
          </Badge>
        </div>
      </div>
      <Card className="flex flex-col gap-3">
        <p className="text-text-muted">{STATUS_COPY[profile.status]}</p>
        {profile.status === "active" ? (
          <p className="text-sm">
            Public page:{" "}
            <Link href={publicPath} className="text-brand font-medium underline">
              {publicPath}
            </Link>
          </p>
        ) : null}
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-text-muted text-sm">Profile views · last 30 days</p>
          <p className="mt-1 text-3xl font-semibold">{stats.totalViews}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm">Outbound clicks · last 30 days</p>
          <p className="mt-1 text-3xl font-semibold">{stats.totalClicks}</p>
        </Card>
      </div>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/dashboard/profile" variant="secondary">
          Edit profile
        </ButtonLink>
        <ButtonLink href="/dashboard/stats" variant="secondary">
          View stats
        </ButtonLink>
      </div>
    </div>
  );
}
