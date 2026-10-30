import { initials } from "@/lib/format";
import { cn } from "@/components/ui/cn";

export function TrainerAvatar({
  name,
  avatarUrl,
  size = "md",
  shape = "circle",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "md" | "lg" | "xl" | "fluid";
  shape?: "circle" | "square";
}) {
  const sizeClasses =
    size === "fluid"
      ? "aspect-square w-full text-4xl"
      : size === "xl"
        ? "size-32 text-3xl"
        : size === "lg"
          ? "size-24 text-2xl"
          : "size-14 text-lg";
  const shapeClass = shape === "square" ? "rounded-xl" : "rounded-full";
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- arbitrary trainer-provided hosts
      <img
        src={avatarUrl}
        alt=""
        className={cn("shrink-0 object-cover", shapeClass, sizeClasses)}
        loading="lazy"
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "bg-brand-soft text-brand-strong inline-flex shrink-0 items-center justify-center font-semibold",
        shapeClass,
        sizeClasses,
      )}
    >
      {initials(name)}
    </span>
  );
}
