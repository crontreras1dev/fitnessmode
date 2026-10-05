import { NextResponse, type NextRequest } from "next/server";
import { getCities, type City } from "@/lib/db/queries";
import { slugify } from "@/lib/seo/slug";

const MAX_RESULTS = 8;
const NEAREST_CITY_MAX_KM = 150;

function toSuggestion(city: City, nearest = false) {
  const { id, slug, name, region, country_code, is_published } = city;
  return { id, slug, name, region, country_code, is_published, ...(nearest ? { nearest } : {}) };
}

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Free-text fallback: geocode with Mapbox and snap to the nearest listed city. */
async function nearestListedCity(query: string, cities: City[]) {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) return null;
  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
  url.searchParams.set("q", query);
  url.searchParams.set("types", "place,locality,neighborhood");
  url.searchParams.set("limit", "1");
  url.searchParams.set("access_token", token);
  const response = await fetch(url, { next: { revalidate: 86400 } }).catch(() => null);
  if (!response?.ok) return null;
  const json = (await response.json()) as {
    features?: { geometry?: { coordinates?: [number, number] } }[];
  };
  const coordinates = json.features?.[0]?.geometry?.coordinates;
  if (!coordinates) return null;
  const [lng, lat] = coordinates;
  let best: { city: City; km: number } | null = null;
  for (const city of cities) {
    if (city.latitude === null || city.longitude === null) continue;
    const km = distanceKm(lat, lng, city.latitude, city.longitude);
    if (!best || km < best.km) best = { city, km };
  }
  return best && best.km <= NEAREST_CITY_MAX_KM ? best.city : null;
}

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  const cities = await getCities();

  let results;
  if (!query) {
    results = cities.filter((city) => city.is_published).map((city) => toSuggestion(city));
  } else {
    const needle = slugify(query);
    const matches = cities
      .filter((city) => city.slug.includes(needle) || slugify(city.name).includes(needle))
      .sort((a, b) => Number(b.slug.startsWith(needle)) - Number(a.slug.startsWith(needle)));
    results = matches.map((city) => toSuggestion(city));
    if (!results.length && query.length >= 3) {
      const nearest = await nearestListedCity(query, cities);
      if (nearest) results = [toSuggestion(nearest, true)];
    }
  }

  return NextResponse.json(
    { results: results.slice(0, MAX_RESULTS) },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
  );
}
