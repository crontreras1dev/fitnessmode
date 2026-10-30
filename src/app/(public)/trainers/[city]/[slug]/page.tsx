import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getSuggestedTrainers,
  getTrainerBySlug,
  getTrainerContact,
  type Trainer,
} from "@/lib/db/queries";
import { formatRate } from "@/lib/format";
import { breadcrumbJsonLd, trainerPersonJsonLd } from "@/lib/seo/jsonld";
import {
  absoluteUrl,
  cityPath,
  REMOTE_CITY_SLUG,
  trainerLocationName,
  trainerProfilePath,
} from "@/lib/seo/site";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { FavoriteButton } from "@/components/trainers/favorite-button";
import { ShareButton } from "@/components/trainers/share-button";
import { TrackView } from "@/components/trainers/track-view";
import { TrainerAvatar } from "@/components/trainers/trainer-avatar";
import { TrainerGrid } from "@/components/trainers/trainer-card";
import { TrainerCtaButtons, type TrainerCta } from "@/components/trainers/trainer-cta-buttons";
import { TrainerSocialLinks } from "@/components/trainers/trainer-social-links";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ city: string; slug: string }> };

// Profiles are rendered on first request and cached (ISR).
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trainer = await getTrainerBySlug(slug);
  if (!trainer) return {};
  const role = trainer.categories[0]?.name ?? "Personal Trainer";
  const location = trainerLocationName(trainer);
  const title = `${trainer.displayName} — ${role} in ${location}`;
  const description = trainer.headline ?? trainer.bio?.slice(0, 155) ?? `${role} in ${location}.`;
  const path = trainerProfilePath(trainer);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "profile" },
  };
}

async function buildCtas(trainer: Trainer): Promise<TrainerCta[]> {
  const ctas: TrainerCta[] = [];
  if (trainer.instagramUrl)
    ctas.push({ target: "instagram", href: trainer.instagramUrl, label: "View Instagram" });
  if (trainer.tiktokUrl)
    ctas.push({ target: "tiktok", href: trainer.tiktokUrl, label: "View TikTok" });
  if (trainer.websiteUrl)
    ctas.push({ target: "website", href: trainer.websiteUrl, label: "Visit website" });

  if (trainer.tier === "pro") {
    const contact = await getTrainerContact(trainer.id);
    if (contact?.whatsapp) {
      const digits = contact.whatsapp.replace(/\D/g, "");
      ctas.unshift({ target: "whatsapp", href: `https://wa.me/${digits}`, label: "WhatsApp" });
    }
    if (contact?.phone) ctas.push({ target: "phone", href: `tel:${contact.phone}`, label: "Call" });
  }
  return ctas;
}

const SOCIAL_TARGETS: ReadonlySet<string> = new Set(["instagram", "tiktok", "website"]);

function BadgeSection({
  title,
  terms,
  tone = "neutral",
}: {
  title: string;
  terms: { slug: string; name: string }[];
  tone?: "neutral" | "brand";
}) {
  if (!terms.length) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {terms.map((term) => (
          <Badge key={term.slug} tone={tone}>
            {term.name}
          </Badge>
        ))}
      </div>
    </section>
  );
}

export default async function TrainerProfilePage({ params }: Props) {
  const { city: citySlug, slug } = await params;
  const trainer = await getTrainerBySlug(slug);
  if (!trainer) notFound();
  const expectedCity = trainer.city?.slug ?? REMOTE_CITY_SLUG;
  if (expectedCity !== citySlug) permanentRedirect(trainerProfilePath(trainer));

  const [ctas, suggestions] = await Promise.all([
    buildCtas(trainer),
    getSuggestedTrainers(trainer, 3),
  ]);
  const socialLinks = ctas.filter((cta) => SOCIAL_TARGETS.has(cta.target));
  const contactCtas = ctas.filter((cta) => !SOCIAL_TARGETS.has(cta.target));
  const location = trainerLocationName(trainer);
  const rate = formatRate(trainer.rateMin, trainer.rateMax, trainer.currency);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <TrackView profileId={trainer.id} />
      <JsonLd
        data={[
          trainerPersonJsonLd({
            ...trainer,
            sameAs: [trainer.instagramUrl, trainer.tiktokUrl, trainer.websiteUrl],
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            trainer.city
              ? { name: `Trainers in ${trainer.city.name}`, path: cityPath(trainer.city.slug) }
              : { name: "Trainers", path: "/search" },
            { name: trainer.displayName, path: trainerProfilePath(trainer) },
          ]),
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-text-muted text-sm">
        <Link href="/" className="hover:text-text">
          Home
        </Link>{" "}
        /{" "}
        {trainer.city ? (
          <>
            <Link href={cityPath(trainer.city.slug)} className="hover:text-text">
              {trainer.city.name}
            </Link>{" "}
            /{" "}
          </>
        ) : null}
        <span className="text-text">{trainer.displayName}</span>
      </nav>

      <div className="mt-8 grid gap-6 md:grid-cols-[2fr_1fr]">
        <aside className="md:order-2">
          <Card className="flex flex-col gap-5 md:sticky md:top-20">
            <div className="relative">
              <TrainerAvatar
                name={trainer.displayName}
                avatarUrl={trainer.avatarUrl}
                size="fluid"
                shape="square"
              />
              <FavoriteButton
                slug={trainer.slug}
                className="absolute top-2 right-2 shadow-sm"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{trainer.displayName}</h1>
                {trainer.tier === "pro" ? <Badge tone="pro">Verified trainer</Badge> : null}
              </div>
              <p className="text-text-muted mt-1">
                {trainer.categories.length
                  ? `${trainer.categories.map((category) => category.name).join(" · ")} in ${location}`
                  : location}
              </p>
              {trainer.headline ? <p className="mt-2">{trainer.headline}</p> : null}
            </div>
            <div className="flex items-center gap-1">
              <TrainerSocialLinks profileId={trainer.id} links={socialLinks} />
              <ShareButton
                url={absoluteUrl(trainerProfilePath(trainer))}
                title={trainer.displayName}
              />
            </div>
            {rate ? (
              <div>
                <h2 className="text-text-muted text-sm">Rate per session</h2>
                <p className="mt-1 text-xl font-semibold">{rate}</p>
              </div>
            ) : null}
            <TrainerCtaButtons profileId={trainer.id} ctas={contactCtas} />
          </Card>
        </aside>

        <div className="flex min-w-0 flex-col gap-10 md:order-1">
          <section>
            <h2 className="text-lg font-semibold">About</h2>
            <p className="text-text-muted mt-3 whitespace-pre-line">{trainer.bio}</p>
          </section>

          {trainer.photos.length ? (
            <section>
              <h2 className="text-lg font-semibold">Gallery</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {trainer.photos.map((photo) => (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary trainer-provided hosts
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt={`${trainer.displayName} gallery photo`}
                    loading="lazy"
                    className="border-border aspect-square w-full rounded-xl border object-cover"
                  />
                ))}
              </div>
            </section>
          ) : null}

          {trainer.education.length ? (
            <section>
              <h2 className="text-lg font-semibold">Academic background</h2>
              <ul className="mt-3 flex flex-col gap-1.5">
                {trainer.education.map((entry, index) => (
                  <li key={index} className="text-text-muted text-sm">
                    <span className="text-text font-medium">{entry.degree}</span>
                    {entry.institution ? ` — ${entry.institution}` : ""}
                    {entry.year ? `, ${entry.year}` : ""}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <BadgeSection title="Trains" terms={trainer.modalities} tone="brand" />
          <BadgeSection title="Session format" terms={trainer.sessionTypes} tone="brand" />
          <BadgeSection title="Specialties" terms={trainer.specialties} />
          <BadgeSection
            title="Languages"
            terms={trainer.languages.map((language) => ({ slug: language, name: language }))}
          />
          <BadgeSection title="Extras" terms={trainer.amenities} />
        </div>
      </div>

      {suggestions.length ? (
        <section className="mt-14">
          <h2 className="text-lg font-semibold">
            {trainer.city ? `Other trainers in ${trainer.city.name}` : "Other trainers"}
          </h2>
          <div className="mt-4">
            <TrainerGrid trainers={suggestions} showCity />
          </div>
        </section>
      ) : null}
    </div>
  );
}
