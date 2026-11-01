"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  removeAvatar,
  saveUploadedAvatar,
} from "@/app/[locale]/(dashboard)/dashboard/profile/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrainerAvatar } from "@/components/trainers/trainer-avatar";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUpload({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const t = useTranslations("avatar");
  const te = useTranslations("errors");
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
      setMessage({ ok: false, text: t("badType") });
      return;
    }
    if (selected.size > MAX_AVATAR_SIZE) {
      setMessage({ ok: false, text: t("tooLarge") });
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
        setMessage({ ok: false, text: te("sessionExpired") });
        return;
      }

      const { error } = await supabase.storage.from("avatars").upload(`${user.id}/avatar`, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: true,
      });
      if (error) {
        setMessage({ ok: false, text: te("savePhoto") });
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
      setMessage({ ok: true, text: t("updated") });
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
      setMessage({ ok: true, text: t("removed") });
    });
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <TrainerAvatar name={name} avatarUrl={previewUrl ?? currentUrl} size="lg" />
        <div className="flex flex-1 flex-col gap-3">
          <div>
            <label className="text-sm font-medium">{t("choosePhoto")}</label>
            <input
              ref={inputRef}
              id="avatar"
              type="file"
              accept={AVATAR_TYPES.join(",")}
              disabled={pending}
              onChange={(event) => selectFile(event.target.files?.[0])}
              className="sr-only"
            />
            <div className="mt-1.5 flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
                disabled={pending}
              >
                {t("selectFile")}
              </Button>
              <span className="text-text-muted truncate text-sm" aria-live="polite">
                {file ? file.name : t("noFile")}
              </span>
            </div>
            <p className="text-text-muted mt-1.5 text-xs">{t("requirements")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={upload} disabled={pending || !file}>
              {pending && file ? t("uploading") : t("upload")}
            </Button>
            {currentUrl ? (
              <Button variant="secondary" onClick={remove} disabled={pending}>
                {t("remove")}
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
