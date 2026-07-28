"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BackButton } from "@/components/back-button";
import { MenuCard } from "@/components/menu-card";
import { MenuFilter } from "@/components/menu-filter";
import { menuItems } from "@/data/menu";

export function MenuPageClient() {
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    if (category === "All") return menuItems;
    return menuItems.filter((item) => item.category === category);
  }, [category]);

  return (
    <div className="container-site pt-4 pb-12 sm:pt-6 sm:pb-16">
      <BackButton className="mb-6" />

      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-semibold tracking-[0.22em] text-yellow uppercase">
          Our Menu
        </p>
        <h1 className="mt-2 font-brush text-fluid-section text-white">
          MADE TO CRAVE
        </h1>
        <p className="mt-3 text-muted">
          Tacos, smash burgers, bowls, sides, and drinks — built for the
          sidewalk and ready for the cart.
        </p>
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
        <p className="text-muted">No items in this category yet.</p>
      )}

      <p className="sr-only">
        <Link href="/">Return home</Link>
      </p>
    </div>
  );
}
