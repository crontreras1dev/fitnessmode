import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import type { Database } from "@/lib/db/types";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

const PROTECTED_PREFIXES = ["/dashboard"];

/** Refresh the session when the access token is within this many seconds of expiry. */
const REFRESH_MARGIN_S = 60;

function base64UrlDecode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
}

/**
 * Reads `expires_at` (unix seconds) from the `sb-<ref>-auth-token` session
 * cookie written by @supabase/ssr, or null when absent/unreadable. The value is
 * `base64-<base64url JSON>` and may be split across `…-auth-token.0/.1/…` chunks.
 */
function readSessionExpiry(request: NextRequest) {
  const all = request.cookies.getAll();
  const base = all
    .find((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name))
    ?.name.replace(/\.\d+$/, "");
  if (!base) return null;

  const exact = all.find((c) => c.name === base);
  const raw = exact
    ? exact.value
    : all
        .filter((c) => c.name.startsWith(`${base}.`))
        .sort(
          (a, b) => Number(a.name.slice(base.length + 1)) - Number(b.name.slice(base.length + 1)),
        )
        .map((c) => c.value)
        .join("");
  if (!raw) return null;

  try {
    const session: unknown = JSON.parse(
      raw.startsWith("base64-") ? base64UrlDecode(raw.slice(7)) : raw,
    );
    const expiresAt = (session as { expires_at?: unknown }).expires_at;
    return typeof expiresAt === "number" ? expiresAt : null;
  } catch {
    return null;
  }
}

/** Path without a leading /en or /es segment. */
function pathnameWithoutLocale(pathname: string) {
  const segment = pathname.split("/")[1] ?? "";
  return hasLocale(routing.locales, segment) ? pathname.slice(segment.length + 1) || "/" : pathname;
}

/** Path prefixed for the locale found in the pathname (default locale stays bare). */
function localizePath(pathname: string, target: string) {
  const segment = pathname.split("/")[1] ?? "";
  const locale = hasLocale(routing.locales, segment) ? segment : routing.defaultLocale;
  return locale === routing.defaultLocale ? target : `/${locale}${target}`;
}

/**
 * Refreshes the Supabase session cookie (writing onto the response produced by
 * the intl middleware) and guards dashboard routes.
 */
export async function updateSession(request: NextRequest, response: NextResponse) {
  if (!isSupabaseConfigured) return response;

  const { pathname, search } = request.nextUrl;
  const barePath = pathnameWithoutLocale(pathname);
  const isProtected = PROTECTED_PREFIXES.some((prefix) => barePath.startsWith(prefix));

  // Public route with a session that is far from expiry: nothing to verify or
  // refresh, so skip the remote getUser() round-trip on this request entirely.
  if (!isProtected) {
    const expiresAt = readSessionExpiry(request);
    if (expiresAt !== null && expiresAt - REFRESH_MARGIN_S > Date.now() / 1000) return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        if (response.headers.get("location")) {
          // Redirect responses only need the refreshed cookies for the browser.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          return;
        }
        // Rebuild the response so refreshed request cookies reach downstream
        // code, while preserving what the intl middleware already decided
        // (locale rewrite, request headers, locale cookie).
        const next = NextResponse.next({ request });
        response.headers.forEach((value, key) => next.headers.set(key, value));
        next.headers.set("x-middleware-request-cookie", request.headers.get("cookie") ?? "");
        response = next;
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Do not run code between createServerClient and getUser(): it refreshes the session.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = localizePath(pathname, "/login");
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return response;
}
