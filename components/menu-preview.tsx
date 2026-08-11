"use client";

import { useMemo } from "react";
import { Button } from "@/components/button";
import { useContent } from "@/components/content-provider";
import { MenuCard } from "@/components/menu-card";
import { SectionHeading } from "@/components/section-heading";
import { useT } from "@/lib/i18n";

export function MenuPreview() {
  const t = useT();
  const { content } = useContent();
  const items = useMemo(
    () => content.menu.filter((item) => item.featured).slice(0, 4),
    [content.menu],
  );

  return (
    <section id="menu" className="relative grain bg-cream py-16 text-background sm:py-20">
      <div className="container-site">
        <SectionHeading
          eyebrow={t("menuPreview.eyebrow")}
          title={t("menuPreview.title")}
          action={
            <Button href="/menu" variant="outline-dark" className="self-start md:self-auto">
              {t("menuPreview.viewFull")}
            </Button>
          }
        />

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
      </div>
    </section>
  );
}
