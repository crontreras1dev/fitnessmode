import type { ComponentProps } from "react";
import { cn } from "./cn";

type Tone = "neutral" | "brand" | "pro";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-text-muted",
  brand: "bg-brand-soft text-brand-strong",
  pro: "bg-pro-soft text-pro",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
