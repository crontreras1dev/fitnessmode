import { NextResponse, type NextRequest } from "next/server";
import { getTrainersBySlugs } from "@/lib/db/queries";

const MAX_SLUGS = 100;
const SLUG_PATTERN = /^[a-z0-9-]{1,60}$/;

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("slugs") ?? "";
  const slugs = [
    ...new Set(
      raw
        .split(",")
        .map((slug) => slug.trim())
        .filter((slug) => SLUG_PATTERN.test(slug)),
    ),
  ].slice(0, MAX_SLUGS);

  const trainers = await getTrainersBySlugs(slugs);
  return NextResponse.json({ trainers });
}
