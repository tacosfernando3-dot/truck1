"use client";

import { useMemo } from "react";
import { Button } from "@/components/button";
import { useContent } from "@/components/content-provider";
import { MenuCard } from "@/components/menu-card";
import { SectionHeading } from "@/components/section-heading";
import type { MenuItem } from "@/lib/types";
import { useT } from "@/lib/i18n";

function isVisible(item: MenuItem, hidden: Set<string>) {
  return item.available !== false && !hidden.has(item.category);
}

export function MenuPreview() {
  const t = useT();
  const { content } = useContent();
  const items = useMemo(() => {
    const hidden = new Set(content.hiddenCategories ?? []);
    return content.menu.filter(
      (item) => item.featured && isVisible(item, hidden),
    );
  }, [content.hiddenCategories, content.menu]);

  // Duplicate for a seamless infinite loop when there is enough content.
  const loopItems = useMemo(() => {
    if (items.length === 0) return [];
    if (items.length === 1) return [...items, ...items, ...items, ...items];
    return [...items, ...items];
  }, [items]);

  const durationSec = Math.max(18, items.length * 6);

  return (
    <section
      id="menu"
      className="relative grain overflow-hidden bg-cream py-16 text-background sm:py-20"
    >
      <div className="container-site">
        <SectionHeading
          eyebrow={t("menuPreview.eyebrow")}
          title={t("menuPreview.title")}
          action={
            <Button
              href="/menu"
              variant="outline-dark"
              className="self-start md:self-auto"
            >
              {t("menuPreview.viewFull")}
            </Button>
          }
        />
      </div>

      {items.length > 0 ? (
        <div className="menu-marquee mt-8 sm:mt-10" aria-label={t("menuPreview.title")}>
          <div
            className="menu-marquee-track"
            style={{ animationDuration: `${durationSec}s` }}
          >
            {loopItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="menu-marquee-item"
                aria-hidden={index >= items.length ? true : undefined}
                inert={index >= items.length ? true : undefined}
              >
                <MenuCard item={item} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="container-site">
          <p className="text-sm text-background/60">{t("menuPreview.empty")}</p>
        </div>
      )}
    </section>
  );
}
