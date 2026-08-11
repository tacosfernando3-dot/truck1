"use client";

import Image from "next/image";
import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { MenuCard } from "@/components/menu-card";
import { MenuItemAddButton } from "@/components/menu-item-add-button";
import { useI18n, useT } from "@/lib/i18n";
import { localizeMenuItem } from "@/lib/localize-menu";
import type { MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const heatKey = {
  mild: "common.mild",
  medium: "common.medium",
  hot: "common.hot",
} as const;

export function MenuItemPageClient({
  item,
  related,
}: {
  item: MenuItem;
  related: MenuItem[];
}) {
  const t = useT();
  const { locale } = useI18n();
  const localized = localizeMenuItem(item, locale);

  return (
    <div className="bg-background">
      <div className="container-site pt-4 pb-12 sm:pt-6 sm:pb-16">
        <BackButton className="mb-6" fallbackHref="/menu" />

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border-dark sm:aspect-[16/11]">
            <Image
              src={item.image}
              alt={localized.localizedName}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.22em] text-green uppercase">
              {localized.localizedCategory}
            </p>
            <h1 className="mt-2 font-brush text-fluid-section text-white">
              {localized.localizedName}
            </h1>
            <p className="mt-2 font-display text-3xl tracking-wide text-yellow">
              {formatCurrency(item.price, locale)}
            </p>
            <p className="mt-4 max-w-xl text-muted">
              {localized.localizedLongDescription}
            </p>

            <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {localized.localizedServes && (
                <div>
                  <dt className="inline text-muted">{t("common.serves")} </dt>
                  <dd className="inline font-semibold text-white">
                    {localized.localizedServes}
                  </dd>
                </div>
              )}
              {item.heat && (
                <div>
                  <dt className="inline text-muted">{t("common.heat")} </dt>
                  <dd className="inline font-semibold text-white">
                    {t(heatKey[item.heat])}
                  </dd>
                </div>
              )}
            </dl>

            {localized.localizedIncludes && localized.localizedIncludes.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold tracking-[0.18em] text-green uppercase">
                  {t("common.whatsIncluded")}
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {localized.localizedIncludes.map((line) => (
                    <li
                      key={line}
                      className="border-l-2 border-yellow/70 pl-3 text-sm text-muted"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {localized.localizedAllergens && localized.localizedAllergens.length > 0 && (
              <p className="mt-6 text-xs text-muted/80">
                {localized.localizedAllergens.join(" · ")}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <MenuItemAddButton item={item} className="w-full sm:w-auto" />
              <Link
                href="/menu"
                className="inline-flex min-h-12 items-center justify-center px-2 text-sm font-semibold tracking-wide text-muted uppercase transition hover:text-yellow"
              >
                {t("common.viewFullMenu")}
              </Link>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-border-dark pt-12">
            <h2 className="font-brush text-fluid-section text-white">
              {t("menuPage.moreCategory", { category: localized.localizedCategory })}
            </h2>
            <p className="mt-2 text-muted">{t("menuPage.relatedSubtitle")}</p>
            <div className="mt-8 hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-3">
              {related.map((relatedItem) => (
                <MenuCard key={relatedItem.id} item={relatedItem} />
              ))}
            </div>
            <div className="mt-6 grid gap-4 md:hidden">
              {related.map((relatedItem) => (
                <MenuCard key={relatedItem.id} item={relatedItem} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
