import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/db/types";

type EventType = Database["public"]["Enums"]["profile_event_type"];
type ClickTarget = Database["public"]["Enums"]["profile_click_target"];

const BOT_PATTERN = /bot|crawler|spider|crawling|preview|facebookexternalhit|slurp|lighthouse/i;

function referrerHost(request: NextRequest) {
  const referrer = request.headers.get("referer");
  if (!referrer) return null;
  try {
    return new URL(referrer).host.slice(0, 255);
  } catch {
    return null;
  }
}

/** Shared handler for /api/track/*: validates the payload and writes a profile_events row. */
export async function handleTrackRequest<
  S extends z.ZodType<{ profileId: string; target?: ClickTarget }>,
>(request: NextRequest, schema: S, eventType: EventType) {
  if (BOT_PATTERN.test(request.headers.get("user-agent") ?? "")) {
    return new NextResponse(null, { status: 204 });
  }

  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Tracking not configured" }, { status: 503 });
  }

  const { profileId, target } = parsed.data;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profileId)
    .eq("status", "active")
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "Unknown profile" }, { status: 404 });
  }

  const { error } = await supabase.from("profile_events").insert({
    profile_id: profileId,
    event_type: eventType,
    target: eventType === "click" ? target : null,
    referrer: referrerHost(request),
  });
  if (error) {
    return NextResponse.json({ error: "Could not record event" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
