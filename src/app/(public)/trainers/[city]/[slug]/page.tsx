import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getTrainerBySlug, getTrainerContact, type Trainer } from "@/lib/db/queries";
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
import { TrainerCtaButtons, type TrainerCta } from "@/components/trainers/trainer-cta-buttons";

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

export default async function TrainerProfilePage({ params }: Props) {
  const { city: citySlug, slug } = await params;
  const trainer = await getTrainerBySlug(slug);
  if (!trainer) notFound();
  const expectedCity = trainer.city?.slug ?? REMOTE_CITY_SLUG;
  if (expectedCity !== citySlug) permanentRedirect(trainerProfilePath(trainer));

  const ctas = await buildCtas(trainer);
  const location = trainerLocationName(trainer);
  const rate = formatRate(trainer.rateMin, trainer.rateMax, trainer.currency);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
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

      <header className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        <TrainerAvatar name={trainer.displayName} avatarUrl={trainer.avatarUrl} size="xl" />
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight">{trainer.displayName}</h1>
                {trainer.tier === "pro" ? <Badge tone="pro">Verified trainer</Badge> : null}
              </div>
              <p className="text-text-muted mt-1">
                {trainer.categories.map((category) => category.name).join(" · ")} in {location}
              </p>
              {trainer.headline ? <p className="mt-2 text-lg">{trainer.headline}</p> : null}
            </div>
            <div className="flex items-center gap-1">
              <FavoriteButton slug={trainer.slug} className="shrink-0" />
              <ShareButton
                url={absoluteUrl(trainerProfilePath(trainer))}
                title={trainer.displayName}
                className="shrink-0"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mt-6">
        <TrainerCtaButtons profileId={trainer.id} ctas={ctas} />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[1fr_16rem]">
        <section>
          <h2 className="text-lg font-semibold">About</h2>
          <p className="text-text-muted mt-3 whitespace-pre-line">{trainer.bio}</p>
        </section>
        <Card className="flex flex-col gap-5">
          {rate ? (
            <div>
              <h2 className="text-text-muted text-sm">Rate per session</h2>
              <p className="mt-1 text-xl font-semibold">{rate}</p>
            </div>
          ) : null}
          {trainer.modalities.length ? (
            <div>
              <h2 className="text-text-muted text-sm">Trains</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {trainer.modalities.map((modality) => (
                  <Badge key={modality.slug} tone="brand">
                    {modality.name}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
          {trainer.specialties.length ? (
            <div>
              <h2 className="text-text-muted text-sm">Specialties</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {trainer.specialties.map((specialty) => (
                  <Badge key={specialty.slug}>{specialty.name}</Badge>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
