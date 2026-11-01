import { NextResponse, type NextRequest } from "next/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const supabase = await createClient();
  await supabase.auth.signOut();
  const home =
    hasLocale(routing.locales, locale) && locale !== routing.defaultLocale ? `/${locale}` : "/";
  return NextResponse.redirect(new URL(home, request.nextUrl.origin), { status: 303 });
}
