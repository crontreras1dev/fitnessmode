import type { ClickTarget } from "@/lib/validation/track";

function send(path: string, payload: Record<string, string>) {
  const body = JSON.stringify(payload);
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(path, blob)) return;
  }
  void fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function trackProfileView(profileId: string) {
  send("/api/track/view", { profileId });
}

export function trackOutboundClick(profileId: string, target: ClickTarget) {
  send("/api/track/click", { profileId, target });
}
