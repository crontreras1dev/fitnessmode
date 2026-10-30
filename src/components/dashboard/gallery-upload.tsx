"use client";

import { useRef, useState, useTransition } from "react";
import { removeGalleryPhoto, saveGalleryPhoto } from "@/app/(dashboard)/dashboard/profile/actions";
import { galleryPhotoUrl } from "@/lib/gallery";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";

const MAX_PHOTOS = 8;
const MAX_PHOTO_SIZE = 8 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type GalleryPhoto = { id: number; url: string };

export function GalleryUpload({ photos: initialPhotos }: { photos: GalleryPhoto[] }) {
  const [supabase] = useState(createClient);
  const [photos, setPhotos] = useState(initialPhotos);
  const [message, setMessage] = useState<{ ok: boolean; text: string }>();
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function upload(files: FileList | null) {
    if (!files?.length) return;
    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setMessage({ ok: false, text: "Your session expired. Please log in again." });
        return;
      }

      for (const file of Array.from(files)) {
        if (photos.length >= MAX_PHOTOS) {
          setMessage({ ok: false, text: `You can add up to ${MAX_PHOTOS} photos.` });
          break;
        }
        if (!PHOTO_TYPES.includes(file.type)) {
          setMessage({ ok: false, text: "Choose JPEG, PNG, or WebP images." });
          continue;
        }
        if (file.size > MAX_PHOTO_SIZE) {
          setMessage({ ok: false, text: `"${file.name}" is larger than 8 MB.` });
          continue;
        }

        const path = `${user.id}/${crypto.randomUUID()}`;
        const { error } = await supabase.storage.from("gallery").upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
        });
        if (error) {
          setMessage({ ok: false, text: "We couldn't upload your photo. Please try again." });
          continue;
        }

        const result = await saveGalleryPhoto(path);
        if (!result.ok) {
          setMessage({ ok: false, text: result.error });
          continue;
        }
        setPhotos((current) => [
          ...current,
          { id: result.photo.id, url: galleryPhotoUrl(result.photo.path) },
        ]);
        setMessage({ ok: true, text: "Photo added." });
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function remove(photo: GalleryPhoto) {
    startTransition(async () => {
      const result = await removeGalleryPhoto(photo.id);
      if (!result.ok) {
        setMessage({ ok: false, text: result.error });
        return;
      }
      setPhotos((current) => current.filter((item) => item.id !== photo.id));
      setMessage({ ok: true, text: "Photo removed." });
    });
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">Photo gallery</h2>
      <p className="text-text-muted mt-1 text-sm">
        Show your space, sessions and results. Up to {MAX_PHOTOS} photos — JPEG, PNG, or WebP, max 8
        MB each.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt="Gallery photo"
              className="border-border aspect-square w-full rounded-xl border object-cover"
            />
            <button
              type="button"
              onClick={() => remove(photo)}
              disabled={pending}
              aria-label="Remove photo"
              className="bg-surface text-danger border-border absolute top-1.5 right-1.5 rounded-xl border px-2 py-0.5 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
            >
              Remove
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending}
            className="border-border text-text-muted hover:border-brand hover:text-brand aspect-square w-full rounded-xl border border-dashed text-sm font-medium transition-colors"
          >
            {pending ? "Uploading…" : "+ Add photos"}
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_TYPES.join(",")}
        multiple
        disabled={pending}
        onChange={(event) => upload(event.target.files)}
        className="sr-only"
      />
      {message ? (
        <p role="status" className={`mt-3 text-sm ${message.ok ? "text-brand" : "text-danger"}`}>
          {message.text}
        </p>
      ) : null}
    </Card>
  );
}
