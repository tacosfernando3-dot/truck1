"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BackButton } from "@/components/back-button";
import { MenuCard } from "@/components/menu-card";
import { MenuFilter } from "@/components/menu-filter";
import { menuItems } from "@/data/menu";
import { useT } from "@/lib/i18n";

export function MenuPageClient() {
  const t = useT();
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    if (category === "All") return menuItems;
    return menuItems.filter((item) => item.category === category);
  }, [category]);

  return (
    <>
      <div className="hidden border-b border-border-dark bg-surface-dark py-10 md:block">
        <div className="container-site">
          <p className="text-sm font-semibold tracking-[0.22em] text-green uppercase">
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
          <p className="text-sm font-semibold tracking-[0.22em] text-green uppercase">
            {t("menuPage.eyebrow")}
          </p>
          <h2 className="mt-2 font-brush text-fluid-section text-white">
            {t("menuPage.title")}
          </h2>
          <p className="mt-3 text-muted">{t("menuPage.subtitle")}</p>
        </div>

        <MenuFilter active={category} onChange={setCategory} />

        <div className="grid gap-4 md:hidden">
          {filtered.map((item) => (
            <div key={`${category}-${item.id}`} className="animate-fade-up">
              <MenuCard item={item} compact />
            </div>
          ))}
        </div>

        <div className="hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <div key={`${category}-desk-${item.id}`} className="animate-fade-up">
              <MenuCard item={item} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-muted">{t("menuPage.empty")}</p>
        )}

        <p className="sr-only">
          <Link href="/">{t("common.returnHome")}</Link>
        </p>
      </div>
    </>
  );
}
