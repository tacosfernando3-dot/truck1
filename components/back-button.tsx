"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  className?: string;
  fallbackHref?: string;
};

export function BackButton({
  className = "",
  fallbackHref = "/",
}: BackButtonProps) {
  const router = useRouter();

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
      className={`inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide text-muted uppercase transition hover:text-yellow ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Back
    </button>
  );
}
