export function formatRate(min: number | null, max: number | null, currency: string) {
  if (min === null && max === null) return null;
  const format = (value: number) =>
    new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(
      value,
    );
  if (min !== null && max !== null && min !== max) return `${format(min)}–${format(max)}`;
  return format((min ?? max) as number);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
