import Image from "next/image";
import Link from "next/link";
import { getCities, getFeaturedTrainers, getTaxonomy } from "@/lib/db/queries";
import { cityPath } from "@/lib/seo/site";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroSearch } from "@/components/search/hero-search";
import { TrainerCarousel } from "@/components/trainers/trainer-carousel";

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
  const [taxonomy, cities, featuredTrainers] = await Promise.all([
    getTaxonomy(),
    getCities({ publishedOnly: true }),
    getFeaturedTrainers(24),
  ]);

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

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold tracking-tight">What is FitnessMode?</h2>
            <p className="text-text-muted mt-4">
              Choosing a trainer from a Google search or an Instagram hashtag is a shot in the dark
              — you can&apos;t easily compare specialties, rates, or locations side by side.
            </p>
            <p className="text-text-muted mt-3">
              FitnessMode puts local trainers, coaches, and online professionals in one place.
              Browse by city and modality, preview each trainer&apos;s real work through their
              social feeds, and message them directly when you&apos;re ready.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {[
                "Free to browse — no account needed",
                "See real client results on their social feeds",
                "Contact trainers directly — no markups on your sessions",
              ].map((badge) => (
                <li
                  key={badge}
                  className="border-border bg-surface text-text-muted rounded-full border px-3 py-1 text-sm"
                >
                  {badge}
                </li>
              ))}
            </ul>
          </div>
          <Image
            src="/images/what-is-fitnessmode.png"
            alt="A person browsing trainer profile cards with location pins and social media icons"
            width={1408}
            height={768}
            className="mx-auto w-full max-w-md md:w-5/12"
          />
        </div>
      </section>

      {featuredTrainers.length ? (
        <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Featured trainers</h2>
          <p className="text-text-muted mt-2">
            See someone you like? Open their profile and message them today.
          </p>
          <div className="mt-6">
            <TrainerCarousel pool={featuredTrainers} count={5} />
          </div>
        </section>
      ) : null}

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
        <div className="rounded-card bg-text text-bg flex flex-col items-center gap-6 p-8 text-center sm:items-start sm:p-10 sm:text-left lg:mx-auto lg:w-1/2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Are you a trainer?</h2>
            <p className="text-bg/70 mt-2 max-w-lg">
              Get a free profile page that ranks on local Google search and sends clients straight
              to your Instagram or TikTok. Keep 100% of what you earn.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <ButtonLink href="/signup" size="lg" className="shrink-0">
              Create your free profile
            </ButtonLink>
            <Link
              href="/for-trainers"
              className="text-bg/80 hover:text-bg shrink-0 underline underline-offset-4"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
