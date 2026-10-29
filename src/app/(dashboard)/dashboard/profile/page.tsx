import type { Metadata } from "next";
import { getTaxonomy } from "@/lib/db/queries";
import { galleryPhotoUrl } from "@/lib/gallery";
import type { DetailsFormInput, ProfileFormInput } from "@/lib/validation/profile";
import { DetailsForm } from "@/components/dashboard/details-form";
import { GalleryUpload } from "@/components/dashboard/gallery-upload";
import { AvatarUpload } from "@/components/signup/avatar-upload";
import DeleteProfileForm from "@/components/signup/delete-profile-form";
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
    cityId: profile.city_id ?? 0,
    customLocation: profile.custom_location ?? "",
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

  const detailsDefaults: DetailsFormInput = {
    sessionTypeIds: profile.profile_session_types.map((item) => String(item.session_type_id)),
    amenityIds: profile.profile_amenities.map((item) => String(item.amenity_id)),
    languages: profile.languages,
    education: Array.isArray(profile.education)
      ? profile.education.flatMap((entry) =>
          entry && typeof entry === "object"
            ? [
                {
                  degree: String((entry as { degree?: unknown }).degree ?? ""),
                  institution: String((entry as { institution?: unknown }).institution ?? ""),
                  year: String((entry as { year?: unknown }).year ?? ""),
                },
              ]
            : [],
        )
      : [],
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit profile</h1>
      <AvatarUpload name={profile.display_name} avatarUrl={profile.avatar_url} />
      <ProfileEditForm
        taxonomy={taxonomy}
        defaultValues={defaultValues}
        initialCity={profile.city}
      />
      <DetailsForm taxonomy={taxonomy} defaultValues={detailsDefaults} />
      <GalleryUpload
        photos={profile.profile_photos.map((photo) => ({
          id: photo.id,
          url: galleryPhotoUrl(photo.path),
        }))}
      />
      <DeleteProfileForm />
    </div>
  );
}
