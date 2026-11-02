import { siteConfig } from "@/lib/seo/site";

// Mirrors the @theme tokens in globals.css — Satori only accepts inline styles.
export const ogColors = {
  bg: "#f7f7f4",
  surface: "#ffffff",
  text: "#13161a",
  muted: "#5c6470",
  border: "#e2e4e0",
  brand: "#2563eb",
  brandStrong: "#1d4ed8",
  brandSoft: "#dbeafe",
  pro: "#ea580c",
  proSoft: "#ffedd5",
};

export function clamp(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function WordMark({ fontSize = 40 }: { fontSize?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: fontSize * 0.45 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: fontSize * 1.6,
          height: fontSize * 1.6,
          borderRadius: fontSize * 0.4,
          backgroundColor: ogColors.brand,
          color: "#ffffff",
          fontSize: fontSize * 0.8,
        }}
      >
        FM
      </div>
      <div style={{ display: "flex", color: ogColors.brand, fontSize }}>{siteConfig.name}</div>
    </div>
  );
}

/** Branded card used by public pages and as a fallback when a trainer is missing. */
export function GenericCard({ headline }: { headline: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 72,
        backgroundColor: ogColors.bg,
      }}
    >
      <WordMark />
      <div style={{ display: "flex", fontSize: 52, lineHeight: 1.2, color: ogColors.text }}>
        {clamp(headline, 140)}
      </div>
      <div style={{ display: "flex", fontSize: 28, color: ogColors.muted }}>
        {siteConfig.url.replace(/^https?:\/\//, "")}
      </div>
    </div>
  );
}
