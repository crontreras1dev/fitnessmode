import { ImageResponse } from "next/og";
import { getMessages, getTranslations } from "next-intl/server";
import { getTrainerBySlug } from "@/lib/db/queries";
import { initials } from "@/lib/format";
import { termName } from "@/i18n/terms";
import { siteConfig, trainerLocationName } from "@/lib/seo/site";
import { clamp, GenericCard, ogColors as c, WordMark } from "@/lib/og/cards";

export const alt = `${siteConfig.name} trainer profile`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [trainer, t, tc, tm, messages] = await Promise.all([
    getTrainerBySlug(slug),
    getTranslations({ locale, namespace: "trainer" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "metadata" }),
    getMessages({ locale }),
  ]);

  if (!trainer) {
    return new ImageResponse(<GenericCard headline={tm("siteDescription")} />, { ...size });
  }

  const location = trainerLocationName(trainer, tc("online"));
  const categories = trainer.categories
    .map((category) => termName(messages, "categories", category))
    .join(" · ");
  const subtitle = categories ? t("categoriesIn", { categories, location }) : location;

  const avatar = trainer.avatarUrl ? (
    <img
      src={trainer.avatarUrl}
      alt=""
      width={300}
      height={300}
      style={{ borderRadius: 24, objectFit: "cover" }}
    />
  ) : (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 300,
        height: 300,
        borderRadius: 24,
        backgroundColor: c.brandSoft,
        color: c.brandStrong,
        fontSize: 120,
      }}
    >
      {initials(trainer.displayName)}
    </div>
  );

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: 56,
        backgroundColor: c.bg,
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: 44,
          padding: 48,
          backgroundColor: c.surface,
          border: `1px solid ${c.border}`,
          borderRadius: 32,
        }}
      >
        {avatar}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
            <div style={{ display: "flex", fontSize: 60, lineHeight: 1.1, color: c.text }}>
              {clamp(trainer.displayName, 34)}
            </div>
            <div style={{ display: "flex", fontSize: 30, color: c.muted }}>
              {clamp(subtitle, 60)}
            </div>
            {trainer.headline ? (
              <div style={{ display: "flex", fontSize: 28, lineHeight: 1.3, color: c.text }}>
                {clamp(trainer.headline, 100)}
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {trainer.tier === "pro" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 20px",
                  borderRadius: 999,
                  backgroundColor: c.proSoft,
                  color: c.pro,
                  fontSize: 24,
                }}
              >
                {t("verified")}
              </div>
            ) : (
              <div style={{ display: "flex" }} />
            )}
            <WordMark fontSize={30} />
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
