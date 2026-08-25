"use client";

import { useMemo } from "react";
import { Button } from "@/components/button";
import { useContent } from "@/components/content-provider";
import { MenuCard } from "@/components/menu-card";
import { SectionHeading } from "@/components/section-heading";
import type { MenuItem } from "@/lib/types";
import { useT } from "@/lib/i18n";

function isVisible(
  item: MenuItem,
  hidden: Set<string>,
) {
  return item.available !== false && !hidden.has(item.category);
}

export function MenuPreview() {
  const t = useT();
  const { content } = useContent();
  const items = useMemo(() => {
    const hidden = new Set(content.hiddenCategories ?? []);
    const visible = content.menu.filter((item) => isVisible(item, hidden));
    const featured = visible.filter((item) => item.featured);
    return (featured.length > 0 ? featured : visible).slice(0, 4);
  }, [content.hiddenCategories, content.menu]);

  return (
    <section
      id="menu"
      className="relative grain bg-cream py-16 text-background sm:py-20"
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

        {items.length > 0 ? (
          <>
            <div className="hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-4">
              {items.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>

            <div className="grid gap-3.5 md:hidden">
              {items.map((item) => (
                <MenuCard key={item.id} item={item} compact />
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-background/60">
            {t("menuPreview.viewFull")}
          </p>
        )}
      </div>
    </section>
  );
}
