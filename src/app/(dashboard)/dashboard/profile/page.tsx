import type { Metadata } from "next";
import { getTaxonomy } from "@/lib/db/queries";
import type { ProfileFormInput } from "@/lib/validation/profile";
import { ProfileEditForm } from "@/components/signup/profile-edit-form";
import { requireOwnProfile } from "../data";

export const metadata: Metadata = { title: "Edit profile", robots: { index: false } };

export default async function DashboardProfilePage() {
  const { supabase, profile } = await requireOwnProfile();
  const [taxonomy, contact] = await Promise.all([
    getTaxonomy(),
    supabase.rpc("get_profile_contact", { p_profile_id: profile.id }),
  ]);
  const ownContact = contact.data?.[0];

  const defaultValues: ProfileFormInput = {
    displayName: profile.display_name,
    cityId: profile.city_id,
    headline: profile.headline ?? "",
    bio: profile.bio ?? "",
    categoryIds: profile.profile_categories.map((item) => String(item.category_id)),
    modalityIds: profile.profile_modalities.map((item) => String(item.modality_id)),
    specialtyIds: profile.profile_specialties.map((item) => String(item.specialty_id)),
    rateMin: profile.rate_min?.toString() ?? "",
    rateMax: profile.rate_max?.toString() ?? "",
    currency: profile.currency as ProfileFormInput["currency"],
    instagramUrl: profile.instagram_url ?? "",
    tiktokUrl: profile.tiktok_url ?? "",
    websiteUrl: profile.website_url ?? "",
    whatsapp: ownContact?.whatsapp ?? "",
    phone: ownContact?.phone ?? "",
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit profile</h1>
      <ProfileEditForm
        taxonomy={taxonomy}
        defaultValues={defaultValues}
        initialCity={profile.city}
      />
    </div>
  );
}
