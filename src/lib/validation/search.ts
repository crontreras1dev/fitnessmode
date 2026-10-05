import { z } from "zod";

const slugParam = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .optional()
  .catch(undefined);

const intParam = z.coerce.number().int().min(0).max(1_000_000).optional().catch(undefined);

export const searchParamsSchema = z.object({
  city: slugParam,
  category: slugParam,
  modality: slugParam,
  specialty: slugParam,
  min: intParam,
  max: intParam,
  q: z
    .string()
    .trim()
    .max(100)
    .optional()
    .catch(undefined)
    .transform((v) => v || undefined),
  page: z.coerce.number().int().min(1).max(500).optional().catch(undefined),
});

export type SearchFilters = z.output<typeof searchParamsSchema>;

export function parseSearchParams(params: Record<string, string | string[] | undefined>) {
  const flat = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value || undefined,
    ]),
  );
  return searchParamsSchema.parse(flat);
}
