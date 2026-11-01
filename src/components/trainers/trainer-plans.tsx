import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";

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
  const t = useTranslations("plans");
  const tc = useTranslations("common");
  const features = [t("feature1"), t("feature2"), t("feature3"), t("feature4"), t("feature5")];

  return (
    <section className={cn("mx-auto max-w-3xl px-4 sm:px-6", className)}>
      <Card className="border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{t("freeTitle")}</h2>
            <p className="text-text-muted mt-2">{t("freeSubtitle")}</p>
          </div>
          <div className="shrink-0">
            <span className="text-3xl font-semibold">{t("freePrice")}</span>
            <span className="text-text-muted"> {t("forever")}</span>
          </div>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
              <CheckIcon />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <ButtonLink href="/signup" size="lg" className="mt-8 w-full sm:w-auto">
          {tc("createFreeProfile")}
        </ButtonLink>
      </Card>
    </section>
  );
}
