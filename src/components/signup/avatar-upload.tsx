"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { removeAvatar, saveUploadedAvatar } from "@/app/(dashboard)/dashboard/profile/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrainerAvatar } from "@/components/trainers/trainer-avatar";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUpload({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [supabase] = useState(createClient);
  const [currentUrl, setCurrentUrl] = useState(avatarUrl);
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [message, setMessage] = useState<{ ok: boolean; text: string }>();
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function selectFile(selected?: File) {
    setMessage(undefined);
    if (!selected) {
      setFile(undefined);
      return;
    }
    if (!AVATAR_TYPES.includes(selected.type)) {
      setMessage({ ok: false, text: "Choose a JPEG, PNG, or WebP image." });
      return;
    }
    if (selected.size > MAX_AVATAR_SIZE) {
      setMessage({ ok: false, text: "Choose an image smaller than 5 MB." });
      return;
    }
    setFile(selected);
  }

  function upload() {
    if (!file) return;
    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setMessage({ ok: false, text: "Your session expired. Please log in again." });
        return;
      }

      const { error } = await supabase.storage.from("avatars").upload(`${user.id}/avatar`, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: true,
      });
      if (error) {
        setMessage({ ok: false, text: "We couldn't upload your photo. Please try again." });
        return;
      }

      const result = await saveUploadedAvatar(Date.now());
      if (!result.ok) {
        setMessage({ ok: false, text: result.error });
        return;
      }
      setCurrentUrl(result.avatarUrl);
      setFile(undefined);
      if (inputRef.current) inputRef.current.value = "";
      setMessage({ ok: true, text: "Profile photo updated." });
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await removeAvatar();
      if (!result.ok) {
        setMessage({ ok: false, text: result.error });
        return;
      }
      setCurrentUrl(null);
      setFile(undefined);
      if (inputRef.current) inputRef.current.value = "";
      setMessage({ ok: true, text: "Profile photo removed." });
    });
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">Profile photo</h2>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <TrainerAvatar name={name} avatarUrl={previewUrl ?? currentUrl} size="lg" />
        <div className="flex flex-1 flex-col gap-3">
          <div>
            <label htmlFor="avatar" className="text-sm font-medium">
              Choose a photo
            </label>
            <input
              ref={inputRef}
              id="avatar"
              type="file"
              accept={AVATAR_TYPES.join(",")}
              disabled={pending}
              onChange={(event) => selectFile(event.target.files?.[0])}
              className="border-border bg-surface text-text file:bg-surface-muted file:text-text mt-1.5 block w-full rounded-xl border text-sm file:mr-3 file:border-0 file:px-3.5 file:py-2.5 file:font-medium"
            />
            <p className="text-text-muted mt-1.5 text-xs">JPEG, PNG, or WebP. Maximum 5 MB.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={upload} disabled={pending || !file}>
              {pending && file ? "Uploading…" : "Upload photo"}
            </Button>
            {currentUrl ? (
              <Button variant="secondary" onClick={remove} disabled={pending}>
                Remove photo
              </Button>
            ) : null}
          </div>
          {message ? (
            <p role="status" className={message.ok ? "text-brand text-sm" : "text-danger text-sm"}>
              {message.text}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
