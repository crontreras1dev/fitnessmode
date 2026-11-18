"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

export function CopyProfileLink({ url, className }: { url: string; className?: string }) {
  const t = useTranslations("dashboard");
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(buttonClasses({ variant: "secondary" }), className)}
    >
      {copied ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
      {copied ? t("profileLinkCopied") : t("copyProfileLink")}
    </button>
  );
}
