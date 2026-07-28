"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { Plus } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import type { MenuItem } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

export function MenuCard({
  item,
  compact = false,
}: {
  item: MenuItem;
  compact?: boolean;
}) {
  const { addItem, openCart } = useCart();
  const href = `/menu/${item.id}`;

  function handleAdd(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    addItem(item);
    openCart();
  }

  if (compact) {
    return (
      <article className="group relative flex gap-3.5 overflow-hidden rounded-2xl border border-background/8 bg-white p-3.5 text-background shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)] animate-fade-up active:scale-[0.99] transition">
        <Link
          href={href}
          className="absolute inset-0 z-0 rounded-2xl"
          aria-label={`View ${item.name} details`}
        />
        <div className="relative z-[1] h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-full ring-2 ring-yellow/70 ring-offset-2 ring-offset-white pointer-events-none">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="88px"
          />
        </div>

        <div className="relative z-[1] min-w-0 flex-1 self-center pointer-events-none">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-background/45 uppercase">
                {item.category}
              </p>
              <h3 className="mt-0.5 truncate font-display text-[1.35rem] leading-none tracking-wide uppercase">
                {item.name}
              </h3>
            </div>
            <span className="shrink-0 rounded-md bg-yellow px-2 py-1 text-sm font-bold text-background">
              {formatCurrency(item.price)}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-snug text-background/60">
            {item.description}
          </p>
          <button
            type="button"
            onClick={handleAdd}
            className="pointer-events-auto mt-2.5 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-background px-3.5 text-xs font-semibold tracking-wide text-white uppercase transition hover:bg-background/90"
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="h-3.5 w-3.5 text-yellow" aria-hidden />
            Add to order
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative overflow-hidden rounded-xl border border-border-light bg-white text-background shadow-sm transition duration-300 hover:-translate-y-1 animate-fade-up">
      <Link
        href={href}
        className="absolute inset-0 z-0"
        aria-label={`View ${item.name} details`}
      />
      <div className="relative z-[1] aspect-[4/3] overflow-hidden pointer-events-none">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
        />
      </div>
      <div className="relative z-[1] p-4 pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl tracking-wide uppercase">
            {item.name}
          </h3>
          <span className="shrink-0 border-b-2 border-yellow pb-0.5 font-semibold">
            {formatCurrency(item.price)}
          </span>
        </div>
        <p className="mt-2 text-sm text-background/65">{item.description}</p>
        <button
          type="button"
          onClick={handleAdd}
          className={cn(
            "pointer-events-auto mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-yellow px-4 py-2 text-sm font-semibold tracking-wide text-background uppercase transition hover:bg-yellow-hover md:opacity-90 md:group-hover:opacity-100",
          )}
          aria-label={`Add ${item.name} to cart`}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add
        </button>
      </div>
    </article>
  );
}
