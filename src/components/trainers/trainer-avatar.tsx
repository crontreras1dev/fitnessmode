import { initials } from "@/lib/format";
import { cn } from "@/components/ui/cn";

export function TrainerAvatar({
  name,
  avatarUrl,
  size = "md",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "md" | "lg";
}) {
  const sizeClasses = size === "lg" ? "size-24 text-2xl" : "size-14 text-lg";
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- arbitrary trainer-provided hosts
      <img
        src={avatarUrl}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", sizeClasses)}
        loading="lazy"
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "bg-brand-soft text-brand-strong inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizeClasses,
      )}
    >
      {initials(name)}
    </span>
  );
}
