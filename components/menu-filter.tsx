"use client";

import { menuCategories } from "@/data/menu";
import { cn } from "@/lib/utils";

export function MenuFilter({
  active,
  onChange,
}: {
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className="scrollbar-none mb-8 flex gap-2 overflow-x-auto pb-1"
      role="tablist"
      aria-label="Menu categories"
    >
      {menuCategories.map((category) => {
        const isActive = active === category;
        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(category)}
            className={cn(
              "shrink-0 rounded-md px-4 py-2.5 text-sm font-semibold tracking-wide uppercase transition min-h-11",
              isActive
                ? "bg-yellow text-background"
                : "border border-border-dark bg-surface-dark text-muted hover:text-white",
            )}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
