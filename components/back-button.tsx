"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";

type BackButtonProps = {
  className?: string;
  fallbackHref?: string;
};

export function BackButton({
  className = "",
  fallbackHref = "/",
}: BackButtonProps) {
  const router = useRouter();
  const t = useT();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide text-muted uppercase transition hover:text-yellow md:hidden ${className}`}
      aria-label={t("common.goBack")}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {t("common.back")}
    </button>
  );
}
