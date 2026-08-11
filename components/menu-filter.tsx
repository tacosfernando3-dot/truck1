"use client";

import { useContent } from "@/components/content-provider";
import { categorySectionId } from "@/lib/cms/utils";
import { useT } from "@/lib/i18n";

function categoryLabel(category: string, t: (key: string) => string) {
  const translated = t(`categories.${category}`);
  return translated === `categories.${category}` ? category : translated;
}

export function MenuFilter() {
  const t = useT();
  const { content } = useContent();

  function scrollToCategory(category: string) {
    const el = document.getElementById(categorySectionId(category));
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      className="scrollbar-none sticky top-[68px] z-20 -mx-1 mb-10 flex gap-2 overflow-x-auto bg-background/95 px-1 py-3 backdrop-blur-md lg:top-[78px]"
      role="navigation"
      aria-label={t("menuPage.categories")}
    >
      {content.categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => scrollToCategory(category)}
          className="min-h-11 shrink-0 rounded-md border border-border-dark bg-surface-dark px-4 py-2.5 text-sm font-semibold tracking-wide text-muted uppercase transition hover:border-yellow hover:text-yellow"
        >
          {categoryLabel(category, t)}
        </button>
      ))}
    </div>
  );
}
