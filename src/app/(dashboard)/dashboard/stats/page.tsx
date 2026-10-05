import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { getStats } from "../data";

export const metadata: Metadata = { title: "Stats", robots: { index: false } };

const TARGET_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  website: "Website",
  whatsapp: "WhatsApp",
  phone: "Phone",
};

export default async function DashboardStatsPage() {
  const stats = await getStats(30);
  const peak = Math.max(1, ...stats.daily.map((row) => Number(row.views)));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Stats · last 30 days</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-text-muted text-sm">Profile views</p>
          <p className="mt-1 text-3xl font-semibold">{stats.totalViews}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm">Outbound clicks</p>
          <p className="mt-1 text-3xl font-semibold">{stats.totalClicks}</p>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold">Daily views</h2>
        <div
          className="mt-4 flex h-40 items-end gap-1"
          role="img"
          aria-label="Daily profile views chart"
        >
          {stats.daily.map((row) => (
            <div
              key={row.day}
              title={`${row.day}: ${row.views} views, ${row.clicks} clicks`}
              className="bg-brand/80 flex-1 rounded-t"
              style={{ height: `${Math.max(2, (Number(row.views) / peak) * 100)}%` }}
            />
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Clicks by channel</h2>
        {stats.breakdown.length ? (
          <table className="mt-4 w-full text-sm">
            <thead className="text-text-muted text-left">
              <tr>
                <th className="pb-2 font-normal">Channel</th>
                <th className="pb-2 text-right font-normal">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {stats.breakdown.map((row) => (
                <tr key={row.target} className="border-border border-t">
                  <td className="py-2">{TARGET_LABELS[row.target] ?? row.target}</td>
                  <td className="py-2 text-right font-medium">{row.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-text-muted mt-3 text-sm">No outbound clicks yet.</p>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold">Daily breakdown</h2>
        <table className="mt-4 w-full text-sm">
          <thead className="text-text-muted text-left">
            <tr>
              <th className="pb-2 font-normal">Day</th>
              <th className="pb-2 text-right font-normal">Views</th>
              <th className="pb-2 text-right font-normal">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {[...stats.daily].reverse().map((row) => (
              <tr key={row.day} className="border-border border-t">
                <td className="py-2">{row.day}</td>
                <td className="py-2 text-right">{row.views}</td>
                <td className="py-2 text-right">{row.clicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
