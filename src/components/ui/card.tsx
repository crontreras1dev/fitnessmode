import type { ComponentProps } from "react";
import { cn } from "./cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-card border-border bg-surface border p-5 sm:p-6", className)}
      {...props}
    />
  );
}
