import { z } from "zod";

export const trackViewSchema = z.object({
  profileId: z.guid(),
});

export const CLICK_TARGETS = ["instagram", "tiktok", "website", "whatsapp", "phone"] as const;
export type ClickTarget = (typeof CLICK_TARGETS)[number];

export const trackClickSchema = z.object({
  profileId: z.guid(),
  target: z.enum(CLICK_TARGETS),
});
