import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { termName } from "@/i18n/terms";
import type { City, Taxonomy } from "@/lib/db/queries";
import type { SearchFilters as Filters } from "@/lib/validation/search";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";

/**
 * Plain GET form: filters live in URL params, so it works without JS and is shareable.
 * Keyed on the filters so uncontrolled fields reset on client navigation (e.g. Reset).
 */
export async function SearchFilters({
  filters,
  cities,
  taxonomy,
}: {
  filters: Filters;
  cities: City[];
  taxonomy: Taxonomy;
}) {
  const [t, locale, messages] = await Promise.all([
    getTranslations("search"),
    getLocale(),
    getMessages(),
  ]);
  const action = getPathname({ href: "/search", locale });

  return (
    <form
      key={JSON.stringify(filters)}
      action={action}
      method="get"
      className="flex flex-col gap-4"
    >
      <Field label={t("keyword")} htmlFor="filter-q">
        <Input
          id="filter-q"
          name="q"
          defaultValue={filters.q}
          placeholder={t("keywordPlaceholder")}
        />
      </Field>
      <Field label={t("city")} htmlFor="filter-city">
        <Select id="filter-city" name="city" defaultValue={filters.city ?? ""}>
          <option value="">{t("allCities")}</option>
          {cities.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("trainerType")} htmlFor="filter-category">
        <Select id="filter-category" name="category" defaultValue={filters.category ?? ""}>
          <option value="">{t("anyType")}</option>
          {taxonomy.categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {termName(messages, "categories", item)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("modality")} htmlFor="filter-modality">
        <Select id="filter-modality" name="modality" defaultValue={filters.modality ?? ""}>
          <option value="">{t("anyModality")}</option>
          {taxonomy.modalities.map((item) => (
            <option key={item.slug} value={item.slug}>
              {termName(messages, "modalities", item)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("specialty")} htmlFor="filter-specialty">
        <Select id="filter-specialty" name="specialty" defaultValue={filters.specialty ?? ""}>
          <option value="">{t("anySpecialty")}</option>
          {taxonomy.specialties.map((item) => (
            <option key={item.slug} value={item.slug}>
              {termName(messages, "specialties", item)}
            </option>
          ))}
        </Select>
      </Field>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium">{t("ratePerSession")}</legend>
        <div className="mt-1.5 flex items-center gap-2">
          <Input
            name="min"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder={t("min")}
            aria-label={t("minRate")}
            defaultValue={filters.min}
          />
          <span className="text-text-muted">–</span>
          <Input
            name="max"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder={t("max")}
            aria-label={t("maxRate")}
            defaultValue={filters.max}
          />
        </div>
      </fieldset>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {t("apply")}
        </Button>
        <ButtonLink href="/search" variant="ghost">
          {t("reset")}
        </ButtonLink>
      </div>
    </form>
  );
}
