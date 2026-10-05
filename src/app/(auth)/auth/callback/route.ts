import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { finalizePendingProfile } from "@/lib/db/profile-mutations";
import { createClient } from "@/lib/supabase/server";

/**
 * Magic-link landing. Supports both the token_hash email template (works across devices)
 * and the PKCE `code` flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "/dashboard";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  const supabase = await createClient();
  let error: unknown = null;
  if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  } else if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else {
    error = new Error("Missing token");
  }
  if (error) return NextResponse.redirect(new URL("/login?error=link", origin));

  try {
    const result = await finalizePendingProfile(supabase);
    if (result === "missing") return NextResponse.redirect(new URL("/signup", origin));
    if (result === "created") return NextResponse.redirect(new URL("/dashboard?welcome=1", origin));
  } catch {
    return NextResponse.redirect(new URL("/signup", origin));
  }
  return NextResponse.redirect(new URL(next, origin));
}
