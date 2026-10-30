const STORAGE_KEY = "fitnessmode:favorites";

/** Dispatched on window after a favorite is toggled in this tab. */
export const FAVORITES_CHANGED_EVENT = "favorites:changed";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function isFavorite(slug: string): boolean {
  return getFavorites().includes(slug);
}

export function toggleFavorite(slug: string): boolean {
  const favorites = getFavorites();
  const exists = favorites.includes(slug);
  const next = exists ? favorites.filter((item) => item !== slug) : [...favorites, slug];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
  return !exists;
}
