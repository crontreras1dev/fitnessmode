import Link from "next/link";
import { getCities, getTaxonomy } from "@/lib/db/queries";
import { cityPath } from "@/lib/seo/site";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroSearch } from "@/components/search/hero-search";

export const revalidate = 3600;

const STEPS = [
  {
    title: "Search your city",
    body: "Filter by modality — at home, gym, outdoor or online — specialty and rate. No account needed.",
  },
  {
    title: "Check their real work",
    body: "Jump straight to a trainer's Instagram or TikTok to see their style and real client results.",
  },
  {
    title: "Reach out directly",
    body: "Message the trainer on their channels. Zero commission, zero middlemen.",
  },
];

export default async function HomePage() {
  const [taxonomy, cities] = await Promise.all([getTaxonomy(), getCities({ publishedOnly: true })]);

  return (
    <>
      <section className="border-border from-brand-soft/60 to-bg border-b bg-gradient-to-b">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Find a personal trainer near you
          </h1>
          <p className="text-text-muted max-w-xl text-lg text-pretty">
            Browse local personal trainers, athletic coaches and online coaches. Preview their
            social feed, compare rates, and contact them directly.
          </p>
          <HeroSearch modalities={taxonomy.modalities} />
        </div>
      </section>

      {cities.length ? (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Popular cities</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={cityPath(city.slug)}
                  className="rounded-card border-border bg-surface hover:border-brand flex flex-col border px-4 py-3 transition-colors"
                >
                  <span className="font-medium">Trainers in {city.name}</span>
                  <span className="text-text-muted text-sm">
                    {[city.region, city.country_code].filter(Boolean).join(", ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full">
                <span className="text-brand text-sm font-semibold">Step {index + 1}</span>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="text-text-muted mt-2 text-sm">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-card bg-text text-bg flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Are you a trainer?</h2>
            <p className="text-bg/70 mt-2 max-w-lg">
              Get a free profile page that ranks on local Google search and sends clients straight
              to your Instagram or TikTok. Keep 100% of what you earn.
            </p>
          </div>
          <ButtonLink href="/signup" size="lg" className="shrink-0">
            Create your free profile
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
