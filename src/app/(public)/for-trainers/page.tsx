import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { TrainerPlans } from "@/components/trainers/trainer-plans";

export const metadata: Metadata = {
  title: "For trainers",
  description:
    "Create a free FitnessMode profile and get discovered by clients searching for personal trainers in your city. Zero commission.",
};

const STEPS = [
  {
    title: "Create your profile",
    body: "Add your photo, headline, bio, specialties, and the channels where clients can reach you.",
  },
  {
    title: "Get discovered locally",
    body: "Show up when people search your city, modality, or specialty. No ads or bidding required.",
  },
  {
    title: "Receive direct leads",
    body: "Clients click straight through to your Instagram, TikTok, website, or contact details. You keep 100%.",
  },
];

export default function ForTrainersPage() {
  return (
    <>
      <section className="border-border from-brand-soft/60 to-bg border-b bg-gradient-to-b">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Grow your personal training business for free
          </h1>
          <p className="text-text-muted max-w-xl text-lg text-pretty">
            Create a free profile on FitnessMode and get discovered by clients searching for
            trainers in your city. No commission, no monthly fees.
          </p>
          <ButtonLink href="/signup" size="lg">
            Create your free profile
          </ButtonLink>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
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

      <TrainerPlans className="pb-14" />

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-card bg-text text-bg flex flex-col items-center gap-6 p-8 text-center sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Ready to get more clients?</h2>
            <p className="text-bg/70 mt-2 max-w-xl">
              Join other trainers who use FitnessMode to turn local search traffic into direct
              bookings.
            </p>
          </div>
          <ButtonLink href="/signup" size="lg">
            Create your free profile
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
