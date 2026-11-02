export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6" aria-hidden="true">
      <div className="bg-surface rounded-card h-8 w-56 animate-pulse" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-card border-border bg-surface h-40 animate-pulse border"
          />
        ))}
      </div>
    </div>
  );
}
