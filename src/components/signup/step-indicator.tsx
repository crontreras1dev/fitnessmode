import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/cn";

export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  const t = useTranslations("signup");
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label={t("progress")}>
      {steps.map((title, index) => (
        <li
          key={title}
          aria-current={index === current ? "step" : undefined}
          className="flex flex-col gap-2"
        >
          <span className={cn("h-1.5 rounded-full", index <= current ? "bg-brand" : "bg-border")} />
          <span
            className={cn(
              "text-xs sm:text-sm",
              index === current ? "text-text font-medium" : "text-text-muted",
            )}
          >
            {index + 1}. {title}
          </span>
        </li>
      ))}
    </ol>
  );
}
