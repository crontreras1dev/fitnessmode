export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-hidden="true">
      <div className="bg-surface rounded-card mx-auto h-10 w-2/3 animate-pulse" />
      <div className="bg-surface rounded-card mx-auto mt-4 h-5 w-1/2 animate-pulse" />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <li key={index}>
            <div className="rounded-card border-border bg-surface h-72 animate-pulse border" />
          </li>
        ))}
      </ul>
    </div>
  );
}
