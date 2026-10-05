"use client";

import { useEffect } from "react";
import { trackProfileView } from "@/lib/analytics/client";

const SESSION_KEY = "fm:viewed";

/** Records one profile view per browser session (pages are ISR, so tracking is client-side). */
export function TrackView({ profileId }: { profileId: string }) {
  useEffect(() => {
    try {
      const viewed = new Set<string>(JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "[]"));
      if (viewed.has(profileId)) return;
      viewed.add(profileId);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify([...viewed]));
    } catch {
      // sessionStorage unavailable: still track.
    }
    trackProfileView(profileId);
  }, [profileId]);
  return null;
}
