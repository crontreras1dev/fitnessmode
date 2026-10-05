import { z } from "zod";

export const CURRENCIES = ["USD", "EUR", "GBP", "MXN", "COP", "ARS", "CLP", "PEN"] as const;

const idList = (message: string, max: number) =>
  z
    .array(z.string())
    .min(1, message)
    .max(max, `Choose up to ${max}`)
    .transform((ids) => ids.map(Number).filter((id) => Number.isInteger(id) && id > 0));

const optionalRate = z
  .string()
  .trim()
  .regex(/^\d{0,6}$/, "Use whole numbers only")
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

const socialField = (network: keyof typeof SOCIAL_HOSTS) =>
  z
    .string()
    .trim()
    .max(300)
    .transform((value, ctx) => {
      const normalized = normalizeSocialUrl(network, value);
      if (normalized === undefined) {
        ctx.addIssue({ code: "custom", message: `Enter your ${network} @handle or profile URL` });
        return z.NEVER;
      }
      return normalized;
    });

const websiteField = z
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
      ctx.addIssue({ code: "custom", message: "Enter a valid website URL" });
      return z.NEVER;
    }
  });

const optionalPhone = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .refine(
    (value) => value === "" || /^\+?[0-9]{7,15}$/.test(value),
    "Use international format, e.g. +34600111222",
  )
  .transform((value) => (value === "" ? null : value));

export const basicsShape = {
  displayName: z.string().trim().min(2, "Enter your name").max(80),
  cityId: z.number({ error: "Choose your city" }).int().positive("Choose your city"),
  headline: z.string().trim().max(120).optional().default(""),
  bio: z
    .string()
    .trim()
    .min(40, "Tell clients a bit more (at least 40 characters)")
    .max(1500, "Keep it under 1500 characters"),
};

export const servicesShape = {
  categoryIds: idList("Choose at least one category", 3),
  modalityIds: idList("Choose at least one modality", 4),
  specialtyIds: z
    .array(z.string())
    .max(5, "Choose up to 5")
    .transform((ids) => ids.map(Number).filter((id) => Number.isInteger(id) && id > 0)),
  rateMin: optionalRate,
  rateMax: optionalRate,
  currency: z.enum(CURRENCIES),
};

export const linksShape = {
  instagramUrl: socialField("instagram"),
  tiktokUrl: socialField("tiktok"),
  websiteUrl: websiteField,
  whatsapp: optionalPhone,
  phone: optionalPhone,
};

type RefineInput = {
  rateMin: number | null;
  rateMax: number | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  websiteUrl: string | null;
};

function refineProfile(data: RefineInput, ctx: z.RefinementCtx) {
  if (data.rateMin !== null && data.rateMax !== null && data.rateMin > data.rateMax) {
    ctx.addIssue({ code: "custom", path: ["rateMax"], message: "Max rate must be ≥ min rate" });
  }
  if (!data.instagramUrl && !data.tiktokUrl && !data.websiteUrl) {
    ctx.addIssue({
      code: "custom",
      path: ["instagramUrl"],
      message: "Add at least one link so clients can see your work",
    });
  }
}

export const profileSchema = z
  .object({ ...basicsShape, ...servicesShape, ...linksShape })
  .superRefine(refineProfile);

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email"));

export type ProfileFormInput = z.input<typeof profileSchema>;
export type ProfileFormValues = z.output<typeof profileSchema>;

export const SIGNUP_STEPS = [
  { title: "About you", fields: ["displayName", "cityId", "headline", "bio"] },
  {
    title: "Your services",
    fields: ["categoryIds", "modalityIds", "specialtyIds", "rateMin", "rateMax", "currency"],
  },
  { title: "Your links", fields: ["instagramUrl", "tiktokUrl", "websiteUrl", "whatsapp", "phone"] },
] as const satisfies readonly { title: string; fields: readonly (keyof ProfileFormInput)[] }[];

export const emptyProfileInput: ProfileFormInput = {
  displayName: "",
  cityId: 0,
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
