"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Locale } from "@/data/dictionaries";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  function select(next: Locale) {
    setLocale(next);
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-border-dark p-0.5 text-xs font-semibold tracking-wide",
        className,
      )}
      role="group"
      aria-label={t("lang.switchTo")}
    >
      {(["en", "es"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => select(code)}
          className={cn(
            "min-h-8 min-w-9 cursor-pointer rounded px-2 uppercase transition",
            locale === code
              ? "bg-yellow text-white"
              : "text-muted hover:text-white",
          )}
          aria-pressed={locale === code}
        >
          {t(`lang.${code}`)}
        </button>
      ))}
    </div>
  );
}
