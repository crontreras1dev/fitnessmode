import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  return updateSession(request, response);
}

// Locale-aware pages only: API routes, Next internals and files are skipped.
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
