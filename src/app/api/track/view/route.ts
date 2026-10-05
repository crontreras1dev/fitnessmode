import type { NextRequest } from "next/server";
import { handleTrackRequest } from "@/lib/analytics/server";
import { trackViewSchema } from "@/lib/validation/track";

export async function POST(request: NextRequest) {
  return handleTrackRequest(request, trackViewSchema, "view");
}
