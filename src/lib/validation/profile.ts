import { z } from "zod";

/** Translator scoped to the "validation" message namespace. */
export type ValidationT = (key: string, values?: Record<string, string | number>) => string;

export const CURRENCIES = ["USD", "EUR", "GBP", "MXN", "COP", "ARS", "CLP", "PEN"] as const;

const idList = (t: ValidationT, message: string, max: number) =>
  z
    .array(z.string())
    .min(1, message)
    .max(max, t("chooseUpTo", { max }))
    .transform((ids) => ids.map(Number).filter((id) => Number.isInteger(id) && id > 0));

const optionalRate = (t: ValidationT) =>
  z
    .string()
    .trim()
    .regex(/^\d{0,6}$/, t("wholeNumbers"))
    .transform((value) => (value === "" ? null : Number(value)));

const SOCIAL_HOSTS = {
  instagram: "instagram.com",
  tiktok: "tiktok.com",
} as const;

/** Accepts a full URL, a bare domain URL or an @handle and returns a canonical https URL. */
export function normalizeSocialUrl(network: keyof typeof SOCIAL_HOSTS, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const host = SOCIAL_HOSTS[network];
  const handleMatch = trimmed.match(/^@?([A-Za-z0-9._]{1,30})$/);
  if (handleMatch) {
    const handle = handleMatch[1];
    return network === "tiktok"
      ? `https://www.tiktok.com/@${handle}`
      : `https://www.instagram.com/${handle}`;
  }
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (!url.hostname.replace(/^www\./, "").endsWith(host)) return undefined;
    url.protocol = "https:";
    return url.toString();
  } catch {
    return undefined;
  }
}

const socialField = (t: ValidationT, network: keyof typeof SOCIAL_HOSTS) =>
  z
    .string()
    .trim()
    .max(300)
    .transform((value, ctx) => {
      const normalized = normalizeSocialUrl(network, value);
      if (normalized === undefined) {
        ctx.addIssue({ code: "custom", message: t("socialHandle", { network }) });
        return z.NEVER;
      }
      return normalized;
    });

const websiteField = (t: ValidationT) =>
  z
    .string()
    .trim()
    .max(300)
    .transform((value, ctx) => {
      if (!value) return null;
      try {
        const url = new URL(value.startsWith("http") ? value : `https://${value}`);
        if (!url.hostname.includes(".")) throw new Error("invalid host");
        return url.toString();
      } catch {
        ctx.addIssue({ code: "custom", message: t("websiteUrl") });
        return z.NEVER;
      }
    });

const optionalPhone = (t: ValidationT) =>
  z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s()-]/g, ""))
    .refine(
      (value) => value === "" || /^\+?[0-9]{7,15}$/.test(value),
      t("phoneFormat"),
    )
    .transform((value) => (value === "" ? null : value));

const basicsShape = (t: ValidationT) => ({
  displayName: z.string().trim().min(2, t("enterName")).max(80),
  cityId: z.number({ error: t("chooseCity") }).int().nonnegative(t("chooseCity")),
  customLocation: z.string().trim().max(120).optional().default(""),
  headline: z.string().trim().max(120).optional().default(""),
  bio: z.string().trim().min(40, t("bioTooShort")).max(1500, t("bioTooLong")),
});

const servicesShape = (t: ValidationT) => ({
  categoryIds: idList(t, t("chooseCategory"), 3),
  modalityIds: idList(t, t("chooseModality"), 4),
  specialtyIds: z
    .array(z.string())
    .max(5, t("chooseUpTo", { max: 5 }))
    .transform((ids) => ids.map(Number).filter((id) => Number.isInteger(id) && id > 0)),
  rateMin: optionalRate(t),
  rateMax: optionalRate(t),
  currency: z.enum(CURRENCIES),
});

const linksShape = (t: ValidationT) => ({
  instagramUrl: socialField(t, "instagram"),
  tiktokUrl: socialField(t, "tiktok"),
  websiteUrl: websiteField(t),
  whatsapp: optionalPhone(t),
  phone: optionalPhone(t),
});

type RefineInput = {
  cityId: number;
  customLocation: string;
  rateMin: number | null;
  rateMax: number | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  websiteUrl: string | null;
};

function refineProfile(t: ValidationT, data: RefineInput, ctx: z.RefinementCtx) {
  if (data.cityId <= 0 && data.customLocation.length < 2) {
    ctx.addIssue({
      code: "custom",
      path: ["cityId"],
      message: t("chooseCityOrCustom"),
    });
  }
  if (data.rateMin !== null && data.rateMax !== null && data.rateMin > data.rateMax) {
    ctx.addIssue({ code: "custom", path: ["rateMax"], message: t("rateOrder") });
  }
  if (!data.instagramUrl && !data.tiktokUrl && !data.websiteUrl) {
    ctx.addIssue({
      code: "custom",
      path: ["instagramUrl"],
      message: t("needOneLink"),
    });
  }
}

export function buildProfileSchema(t: ValidationT) {
  return z
    .object({ ...basicsShape(t), ...servicesShape(t), ...linksShape(t) })
    .superRefine((data, ctx) => refineProfile(t, data, ctx));
}

export function buildEmailSchema(t: ValidationT) {
  return z.string().trim().toLowerCase().pipe(z.email(t("validEmail")));
}

// ---------------------------------------------------------------------------
// Dashboard-only details (not part of the signup wizard)
// ---------------------------------------------------------------------------

const optionalIdList = (t: ValidationT, max: number) =>
  z
    .array(z.string())
    .max(max, t("chooseUpTo", { max }))
    .transform((ids) => ids.map(Number).filter((id) => Number.isInteger(id) && id > 0));

const educationEntrySchema = (t: ValidationT) =>
  z.object({
    degree: z.string().trim().min(2, t("degree")).max(120),
    institution: z.string().trim().max(120).optional().default(""),
    year: z
      .string()
      .trim()
      .regex(/^(\d{4})?$/, t("fourDigitYear"))
      .transform((value) => (value === "" ? null : Number(value)))
      .refine(
        (value) => value === null || (value >= 1950 && value <= new Date().getFullYear()),
        t("validYear"),
      ),
  });

export function buildDetailsSchema(t: ValidationT) {
  return z.object({
    sessionTypeIds: optionalIdList(t, 4),
    amenityIds: optionalIdList(t, 12),
    languages: z
      .array(z.string().trim().min(1).max(40, t("languageTooLong")))
      .max(10, t("tooManyLanguages"))
      .transform((values) => {
        const seen = new Set<string>();
        return values
          .map((value) => value.replace(/\s+/g, " "))
          .filter((value) => {
            const key = value.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
      }),
    education: z.array(educationEntrySchema(t)).max(12, t("tooManyEducation")),
  });
}

export type DetailsFormInput = z.input<ReturnType<typeof buildDetailsSchema>>;
export type DetailsFormValues = z.output<ReturnType<typeof buildDetailsSchema>>;
export type EducationEntry = z.output<ReturnType<typeof educationEntrySchema>>;

export const emptyDetailsInput: DetailsFormInput = {
  sessionTypeIds: [],
  amenityIds: [],
  languages: [],
  education: [],
};

export type ProfileFormInput = z.input<ReturnType<typeof buildProfileSchema>>;
export type ProfileFormValues = z.output<ReturnType<typeof buildProfileSchema>>;

export const SIGNUP_STEPS = [
  {
    titleKey: "step1",
    fields: ["displayName", "cityId", "customLocation", "headline", "bio"],
  },
  {
    titleKey: "step2",
    fields: ["categoryIds", "modalityIds", "specialtyIds", "rateMin", "rateMax", "currency"],
  },
  {
    titleKey: "step3",
    fields: ["instagramUrl", "tiktokUrl", "websiteUrl", "whatsapp", "phone"],
  },
] as const satisfies readonly {
  titleKey: string;
  fields: readonly (keyof ProfileFormInput)[];
}[];

export const emptyProfileInput: ProfileFormInput = {
  displayName: "",
  cityId: 0,
  customLocation: "",
  headline: "",
  bio: "",
  categoryIds: [],
  modalityIds: [],
  specialtyIds: [],
  rateMin: "",
  rateMax: "",
  currency: "USD",
  instagramUrl: "",
  tiktokUrl: "",
  websiteUrl: "",
  whatsapp: "",
  phone: "",
};
