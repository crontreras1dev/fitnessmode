import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Only auth-aware routes: public directory pages stay static/ISR and skip the auth round-trip.
export const config = {
  matcher: ["/dashboard/:path*", "/signup", "/login", "/auth/:path*"],
};
