"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { useContent } from "@/components/content-provider";
import { MenuCard } from "@/components/menu-card";
import { MenuFilter } from "@/components/menu-filter";
import { categorySectionId } from "@/lib/cms/utils";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function categoryLabel(category: string, t: (key: string) => string) {
  const translated = t(`categories.${category}`);
  return translated === `categories.${category}` ? category : translated;
}

type MobileView = "grid" | "list";

export function MenuPageClient() {
  const t = useT();
  const { content } = useContent();
  const [mobileView, setMobileView] = useState<MobileView>("grid");

  const sections = useMemo(
    () =>
      content.categories.map((category) => ({
        category,
        items: content.menu.filter((item) => item.category === category),
      })),
    [content.categories, content.menu],
  );

  return (
    <>
      <div className="hidden border-b border-border-dark bg-surface-dark py-10 md:block">
        <div className="container-site">
          <p className="text-sm font-semibold tracking-[0.22em] text-yellow uppercase">
            {t("menuPage.orderAhead")}
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white uppercase sm:text-5xl">
            {t("menuPage.fullMenu")}
          </h1>
        </div>
      </div>

      <div className="container-site pt-4 pb-12 sm:pt-6 sm:pb-16">
        <BackButton className="mb-6" />

        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.22em] text-yellow uppercase">
            {t("menuPage.eyebrow")}
          </p>
          <h2 className="mt-2 font-brush text-fluid-section text-white">
            {t("menuPage.title")}
          </h2>
          <p className="mt-3 text-muted">{t("menuPage.subtitle")}</p>
        </div>

        <MenuFilter />

        <div className="space-y-14">
          {sections.map(({ category, items }) => {
            const headingId = `menu-heading-${categorySectionId(category)}`;
            return (
              <section
                key={category}
                id={categorySectionId(category)}
                className="scroll-mt-28"
                aria-labelledby={headingId}
              >
                <div className="mb-5 flex items-end justify-between gap-3 border-b border-border-dark pb-3">
                  <h3
                    id={headingId}
                    className="min-w-0 font-display text-3xl tracking-wide text-yellow uppercase"
                  >
                    {categoryLabel(category, t)}
                  </h3>

                  <div
                    className="flex shrink-0 items-center gap-1 md:hidden"
                    role="group"
                    aria-label="Category layout"
                  >
                    <button
                      type="button"
                      onClick={() => setMobileView("grid")}
                      className={cn(
                        "inline-flex h-9 w-9 items-center justify-center rounded-md border transition",
                        mobileView === "grid"
                          ? "border-yellow bg-yellow/15 text-yellow"
                          : "border-border-dark text-muted hover:text-white",
                      )}
                      aria-pressed={mobileView === "grid"}
                      aria-label="Thumbnail view"
                    >
                      <LayoutGrid className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileView("list")}
                      className={cn(
                        "inline-flex h-9 w-9 items-center justify-center rounded-md border transition",
                        mobileView === "list"
                          ? "border-yellow bg-yellow/15 text-yellow"
                          : "border-border-dark text-muted hover:text-white",
                      )}
                      aria-pressed={mobileView === "list"}
                      aria-label="List view"
                    >
                      <List className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>

                {items.length === 0 ? (
                  <p className="text-muted">{t("menuPage.empty")}</p>
                ) : (
                  <>
                    <div
                      className={cn(
                        "md:hidden",
                        mobileView === "grid"
                          ? "grid grid-cols-2 gap-3"
                          : "grid gap-3",
                      )}
                    >
                      {items.map((item) => (
                        <div key={item.id} className="animate-fade-up min-w-0">
                          <MenuCard
                            item={item}
                            compact
                            compactMode={mobileView}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-3">
                      {items.map((item) => (
                        <div key={item.id} className="animate-fade-up">
                          <MenuCard item={item} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            );
          })}
        </div>

        <p className="sr-only">
          <Link href="/">{t("common.returnHome")}</Link>
        </p>
      </div>
    </>
  );
}
