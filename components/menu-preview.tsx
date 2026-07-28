"use client";

import { Button } from "@/components/button";
import { MenuCard } from "@/components/menu-card";
import { SectionHeading } from "@/components/section-heading";
import { getFeaturedMenuItems } from "@/data/menu";

export function MenuPreview() {
  const items = getFeaturedMenuItems();

  return (
    <section id="menu" className="relative grain bg-cream py-16 text-background sm:py-20">
      <div className="container-site">
        <SectionHeading
          eyebrow="The Menu"
          title="MADE TO CRAVE"
          action={
            <Button href="/menu" variant="outline-dark" className="self-start md:self-auto">
              View Full Menu
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
