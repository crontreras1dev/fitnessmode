import type { City, Taxonomy } from "@/lib/db/queries";
import type { SearchFilters as Filters } from "@/lib/validation/search";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";

/** Plain GET form: filters live in URL params, so it works without JS and is shareable. */
export function SearchFilters({
  filters,
  cities,
  taxonomy,
}: {
  filters: Filters;
  cities: City[];
  taxonomy: Taxonomy;
}) {
  return (
    <form action="/search" method="get" className="flex flex-col gap-4">
      <Field label="Keyword" htmlFor="filter-q">
        <Input id="filter-q" name="q" defaultValue={filters.q} placeholder="e.g. boxing, yoga" />
      </Field>
      <Field label="City" htmlFor="filter-city">
        <Select id="filter-city" name="city" defaultValue={filters.city ?? ""}>
          <option value="">All cities</option>
          {cities.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Trainer type" htmlFor="filter-category">
        <Select id="filter-category" name="category" defaultValue={filters.category ?? ""}>
          <option value="">Any type</option>
          {taxonomy.categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Modality" htmlFor="filter-modality">
        <Select id="filter-modality" name="modality" defaultValue={filters.modality ?? ""}>
          <option value="">Any modality</option>
          {taxonomy.modalities.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Specialty" htmlFor="filter-specialty">
        <Select id="filter-specialty" name="specialty" defaultValue={filters.specialty ?? ""}>
          <option value="">Any specialty</option>
          {taxonomy.specialties.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </Select>
      </Field>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium">Rate per session</legend>
        <div className="mt-1.5 flex items-center gap-2">
          <Input
            name="min"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min"
            aria-label="Minimum rate"
            defaultValue={filters.min}
          />
          <span className="text-text-muted">–</span>
          <Input
            name="max"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max"
            aria-label="Maximum rate"
            defaultValue={filters.max}
          />
        </div>
      </fieldset>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Apply filters
        </Button>
        <ButtonLink href="/search" variant="ghost">
          Reset
        </ButtonLink>
      </div>
    </form>
  );
}
