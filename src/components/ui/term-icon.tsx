import {
  Baby,
  Bandage,
  BicepsFlexed,
  Car,
  Dumbbell,
  Flame,
  GlassWater,
  Home,
  Laptop,
  Lock,
  PersonStanding,
  Scale,
  Shirt,
  ShowerHead,
  Snowflake,
  SquareUser,
  StretchHorizontal,
  Tag,
  TreePine,
  Trophy,
  User,
  Users,
  UsersRound,
  Weight,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import type { TaxonomyKind } from "@/i18n/terms";

const maps: Record<TaxonomyKind, Record<string, LucideIcon>> = {
  categories: {
    "personal-trainer": SquareUser,
    "athletic-coach": Trophy,
    "online-coach": Laptop,
  },
  modalities: {
    home: Home,
    gym: Dumbbell,
    outdoor: TreePine,
    online: Laptop,
  },
  specialties: {
    "weight-loss": Scale,
    "strength-training": Dumbbell,
    "muscle-gain": BicepsFlexed,
    "injury-recovery": Bandage,
    mobility: StretchHorizontal,
    hiit: Flame,
    "sports-performance": Trophy,
    "prenatal-postnatal": Baby,
    "senior-fitness": PersonStanding,
  },
  sessionTypes: {
    personal: User,
    "semi-personal": Users,
    group: UsersRound,
  },
  amenities: {
    "wi-fi": Wifi,
    parking: Car,
    "air-conditioning": Snowflake,
    lockers: Lock,
    showers: ShowerHead,
    "changing-room": Shirt,
    "equipment-included": Weight,
    "water-station": GlassWater,
  },
};

/** Lucide icon for a taxonomy term, falling back to a generic tag. */
export function termIcon(kind: TaxonomyKind, slug: string): LucideIcon {
  return maps[kind][slug] ?? Tag;
}
