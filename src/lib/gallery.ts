import { supabaseUrl } from "@/lib/supabase/env";

/** Public URL for an object in the 'gallery' storage bucket. */
export function galleryPhotoUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/gallery/${path}`;
}
