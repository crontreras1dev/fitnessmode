import "server-only";
import { createHash } from "node:crypto";
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

function clientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip");
}

/** Salted, per-profile IP hash: dedups repeat events without storing raw IPs or correlating a visitor across profiles. */
function hashIp(ip: string, profileId: string) {
  const salt = process.env.TRACK_IP_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createHash("sha256").update(`${salt}:${profileId}:${ip}`).digest("hex");
}

/**
 * Shared handler for /api/track/*: validates the payload and records a
 * profile_events row, skipping repeats from the same IP within the dedup
 * window enforced by record_profile_event().
 */
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

  const ip = clientIp(request);
  const { error } = await supabase.rpc("record_profile_event", {
    p_profile_id: profileId,
    p_event_type: eventType,
    p_target: eventType === "click" ? (target ?? null) : null,
    p_referrer: referrerHost(request),
    p_ip_hash: ip ? hashIp(ip, profileId) : null,
  });
  if (error) {
    return NextResponse.json({ error: "Could not record event" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
