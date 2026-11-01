import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  // English keeps its existing unprefixed URLs; Spanish lives under /es.
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
