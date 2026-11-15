import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "./cn";

type Tone = "neutral" | "brand" | "pro" | "amber" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-text-muted",
  brand: "bg-brand-soft text-brand-strong",
  pro: "bg-pro-soft text-pro",
  amber: "bg-amber-soft text-amber",
  danger: "bg-danger-soft text-danger",
};

const sizes = {
  sm: "gap-1.5 px-2.5 py-0.5 text-xs",
  lg: "gap-2 px-3.5 py-1.5 text-sm",
};

const iconSizes = { sm: "size-3.5", lg: "size-4" };

export function Badge({
  tone = "neutral",
  size = "sm",
  icon: Icon,
  className,
  children,
  ...props
}: ComponentProps<"span"> & { tone?: Tone; size?: keyof typeof sizes; icon?: LucideIcon }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizes[size],
        tones[tone],
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className={iconSizes[size]} aria-hidden /> : null}
      {children}
    </span>
  );
}
