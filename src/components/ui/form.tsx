import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

const controlClasses =
  "w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-text placeholder:text-text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-danger";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClasses, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlClasses, "min-h-32 py-3", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(controlClasses, "h-11 pr-8", className)} {...props} />;
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-text text-sm font-medium", className)} {...props} />;
}

export function FieldError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-danger text-sm">
      {message}
    </p>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error ? <p className="text-text-muted text-xs">{hint}</p> : null}
      <FieldError message={error} id={htmlFor ? `${htmlFor}-error` : undefined} />
    </div>
  );
}

export function ChoiceChip({
  label,
  className,
  ...props
}: ComponentProps<"input"> & { label: string }) {
  return (
    <label
      className={cn(
        "border-border bg-surface text-text has-checked:border-brand has-checked:bg-brand-soft has-checked:text-brand-strong has-focus-visible:ring-brand/30 inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors has-focus-visible:ring-2",
        className,
      )}
    >
      <input type="checkbox" className="sr-only" {...props} />
      {label}
    </label>
  );
}
