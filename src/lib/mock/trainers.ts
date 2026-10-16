import type { City, Taxonomy, Trainer } from "@/lib/db/queries";
import { PAGE_SIZE } from "@/lib/db/queries";
import type { SearchFilters } from "@/lib/validation/search";

const FIRST_NAMES = [
  "Sofía",
  "Daniel",
  "Valentina",
  "Mateo",
  "Camila",
  "Lucas",
  "Isabella",
  "Leo",
  "Lucía",
  "Nicolás",
  "Emma",
  "Alejandro",
  "Martina",
  "Gabriel",
  "Elena",
  "Adrián",
  "Sara",
  "Bruno",
  "Maya",
  "Thiago",
];

const LAST_NAMES = [
  "García",
  "Rodríguez",
  "Martínez",
  "López",
  "Hernández",
  "Silva",
  "Torres",
  "Ramírez",
  "Moreno",
  "Castro",
  "Vega",
  "Navarro",
  "Santos",
  "Reyes",
  "Mendoza",
];

export const MOCK_CITIES: City[] = [
  {
    id: 1,
    slug: "madrid",
    name: "Madrid",
    region: "Community of Madrid",
    country_code: "ES",
    latitude: 40.4168,
    longitude: -3.7038,
    is_published: true,
  },
  {
    id: 2,
    slug: "barcelona",
    name: "Barcelona",
    region: "Catalonia",
    country_code: "ES",
    latitude: 41.3874,
    longitude: 2.1686,
    is_published: true,
  },
  {
    id: 3,
    slug: "miami",
    name: "Miami",
    region: "Florida",
    country_code: "US",
    latitude: 25.7617,
    longitude: -80.1918,
    is_published: true,
  },
  {
    id: 4,
    slug: "mexico-city",
    name: "Mexico City",
    region: "CDMX",
    country_code: "MX",
    latitude: 19.4326,
    longitude: -99.1332,
    is_published: true,
  },
  {
    id: 5,
    slug: "bogota",
    name: "Bogotá",
    region: "Bogotá D.C.",
    country_code: "CO",
    latitude: 4.711,
    longitude: -74.0721,
    is_published: true,
  },
  {
    id: 6,
    slug: "buenos-aires",
    name: "Buenos Aires",
    region: "Buenos Aires",
    country_code: "AR",
    latitude: -34.6037,
    longitude: -58.3816,
    is_published: true,
  },
];

export const MOCK_TAXONOMY: Taxonomy = {
  categories: [
    { id: 1, slug: "personal-trainer", name: "Personal Trainer" },
    { id: 2, slug: "athletic-coach", name: "Athletic Coach" },
    { id: 3, slug: "online-coach", name: "Online Coach" },
  ],
  modalities: [
    { id: 1, slug: "home", name: "At home" },
    { id: 2, slug: "gym", name: "Gym" },
    { id: 3, slug: "outdoor", name: "Outdoor" },
    { id: 4, slug: "online", name: "Online" },
  ],
  specialties: [
    { id: 1, slug: "weight-loss", name: "Weight loss" },
    { id: 2, slug: "strength-training", name: "Strength training" },
    { id: 3, slug: "muscle-gain", name: "Muscle gain" },
    { id: 4, slug: "mobility", name: "Mobility & flexibility" },
    { id: 5, slug: "hiit", name: "HIIT & conditioning" },
    { id: 6, slug: "sports-performance", name: "Sports performance" },
  ],
};

const HEADLINES = [
  "Build strength, move better, and train with confidence.",
  "Personalized training for sustainable results at every fitness level.",
  "Strength and conditioning sessions designed around your goals.",
  "Helping busy people make fitness simple, effective, and enjoyable.",
  "Performance coaching focused on technique, consistency, and progress.",
  "Train smarter with practical programs you can maintain long term.",
];

export const MOCK_TRAINERS: Trainer[] = Array.from({ length: 100 }, (_, index) => {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(index * 7) % LAST_NAMES.length];
  const city = MOCK_CITIES[index % MOCK_CITIES.length];
  const category = MOCK_TAXONOMY.categories[index % MOCK_TAXONOMY.categories.length];
  const modalityCount = (index % 3) + 1;
  const modalities = Array.from(
    { length: modalityCount },
    (_, offset) => MOCK_TAXONOMY.modalities[(index + offset) % MOCK_TAXONOMY.modalities.length],
  );
  const specialties = [
    MOCK_TAXONOMY.specialties[index % MOCK_TAXONOMY.specialties.length],
    MOCK_TAXONOMY.specialties[(index + 2) % MOCK_TAXONOMY.specialties.length],
  ];
  const number = String(index + 1).padStart(3, "0");
  const currency = city.country_code === "US" ? "USD" : "EUR";

  return {
    id: `mock-trainer-${number}`,
    slug: `${firstName}-${lastName}-${number}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase(),
    displayName: `${firstName} ${lastName}`,
    headline: index % 11 === 0 ? null : HEADLINES[index % HEADLINES.length],
    bio: `Free trainer profile specializing in ${specialties.map((item) => item.name.toLowerCase()).join(" and ")}.`,
    avatarUrl: index % 5 === 0 ? null : `https://i.pravatar.cc/256?img=${(index % 70) + 1}`,
    rateMin: 25 + (index % 8) * 5,
    rateMax: 50 + (index % 10) * 5,
    currency,
    tier: "free",
    instagramUrl: null,
    tiktokUrl: null,
    websiteUrl: null,
    updatedAt: "2026-01-01T00:00:00.000Z",
    city: { slug: city.slug, name: city.name },
    categories: [category],
    modalities,
    specialties,
  };
});

export function searchMockTrainers(filters: SearchFilters) {
  const query = filters.q?.toLocaleLowerCase();
  const matches = MOCK_TRAINERS.filter((trainer) => {
    const searchable = [
      trainer.displayName,
      trainer.headline,
      trainer.bio,
      ...trainer.categories.map((item) => item.name),
      ...trainer.modalities.map((item) => item.name),
      ...trainer.specialties.map((item) => item.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();

    return (
      (!filters.city || trainer.city.slug === filters.city) &&
      (!filters.category || trainer.categories.some((item) => item.slug === filters.category)) &&
      (!filters.modality || trainer.modalities.some((item) => item.slug === filters.modality)) &&
      (!filters.specialty || trainer.specialties.some((item) => item.slug === filters.specialty)) &&
      (filters.min === undefined || (trainer.rateMax ?? 0) >= filters.min) &&
      (filters.max === undefined || (trainer.rateMin ?? Number.POSITIVE_INFINITY) <= filters.max) &&
      (!query || searchable.includes(query))
    );
  });
  const page = filters.page ?? 1;
  const offset = (page - 1) * PAGE_SIZE;

  return { trainers: matches.slice(offset, offset + PAGE_SIZE), total: matches.length, page };
}
