import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCities, getCityBySlug, getTaxonomy, getTrainersByCity } from "@/lib/db/queries";
import { breadcrumbJsonLd, trainerItemListJsonLd } from "@/lib/seo/jsonld";
import { cityPath } from "@/lib/seo/site";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { TrainerGrid } from "@/components/trainers/trainer-card";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ city: string }> };

export async function generateStaticParams() {
  const cities = await getCities({ publishedOnly: true });
  return cities.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city?.is_published) return {};
  const title = `Personal Trainers in ${city.name}`;
  const description = `Find personal trainers, athletic coaches and online coaches in ${city.name}. Compare rates, modalities and specialties, and see their work on Instagram and TikTok.`;
  return {
    title,
    description,
    alternates: { canonical: cityPath(city.slug) },
    openGraph: { title, description, url: cityPath(city.slug) },
  };
}

export default async function CityPage({ params }: Props) {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city?.is_published) notFound();

  const [trainers, taxonomy] = await Promise.all([getTrainersByCity(city.id), getTaxonomy()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd
        data={[
          trainerItemListJsonLd(city, trainers),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: `Trainers in ${city.name}`, path: cityPath(city.slug) },
          ]),
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-text-muted text-sm">
        <Link href="/" className="hover:text-text">
          Home
        </Link>{" "}
        / <span className="text-text">{city.name}</span>
      </nav>
      <header className="mt-4 flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Personal trainers in {city.name}
        </h1>
        <p className="text-text-muted max-w-2xl">
          {trainers.length
            ? `${trainers.length} local ${trainers.length === 1 ? "trainer" : "trainers"} offering sessions at home, in the gym, outdoors and online in ${city.name}.`
            : `We're onboarding trainers in ${city.name} right now.`}
        </p>
        <ul className="mt-2 flex flex-wrap gap-2" aria-label="Filter by modality">
          {taxonomy.modalities.map((modality) => (
            <li key={modality.slug}>
              <Link
                href={`/search?city=${city.slug}&modality=${modality.slug}`}
                className="border-border bg-surface hover:border-brand inline-flex rounded-full border px-3.5 py-1.5 text-sm"
              >
                {modality.name}
              </Link>
            </li>
          ))}
        </ul>
      </header>

      <section className="mt-8">
        {trainers.length ? (
          <TrainerGrid trainers={trainers} />
        ) : (
          <div className="rounded-card border-border flex flex-col items-start gap-4 border border-dashed p-8">
            <h2 className="text-lg font-semibold">Be the first trainer listed in {city.name}</h2>
            <p className="text-text-muted">
              Get a free profile that shows up when people search for trainers in {city.name}.
            </p>
            <ButtonLink href="/signup">List yourself free</ButtonLink>
          </div>
        )}
      </section>
    </div>
  );
}
