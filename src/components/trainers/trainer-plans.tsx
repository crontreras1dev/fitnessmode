import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";

const FREE_FEATURES = [
  "Public profile page with your own URL",
  "Showcase Instagram, TikTok, and website links",
  "Appear in city and modality search results",
  "Direct leads to your social channels — zero commission",
  "No monthly fees and no client commissions",
];

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-brand size-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function TrainerPlans({ className }: { className?: string }) {
  return (
    <section className={cn("mx-auto max-w-3xl px-4 sm:px-6", className)}>
      <Card className="border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Free plan</h2>
            <p className="text-text-muted mt-2">
              Everything you need to start getting discovered by clients today.
            </p>
          </div>
          <div className="shrink-0">
            <span className="text-3xl font-semibold">Free</span>
            <span className="text-text-muted"> / forever</span>
          </div>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {FREE_FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
              <CheckIcon />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <ButtonLink href="/signup" size="lg" className="mt-8 w-full sm:w-auto">
          Create your free profile
        </ButtonLink>
      </Card>
    </section>
  );
}
