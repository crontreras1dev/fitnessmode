export default function Loading() {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      <div className="bg-surface rounded-card h-8 w-40 animate-pulse" />
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-card border-border bg-surface h-12 animate-pulse border"
        />
      ))}
      <div className="bg-surface rounded-card h-11 w-32 animate-pulse" />
    </div>
  );
}
