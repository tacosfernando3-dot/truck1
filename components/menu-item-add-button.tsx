"use client";

import { Plus } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import type { MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function MenuItemAddButton({
  item,
  className = "",
}: {
  item: MenuItem;
  className?: string;
}) {
  const { addItem, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={() => {
        addItem(item);
        openCart();
      }}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-yellow px-6 text-sm font-semibold tracking-wide text-background uppercase transition hover:bg-yellow-hover ${className}`}
      aria-label={`Add ${item.name} to cart`}
    >
      <Plus className="h-4 w-4" aria-hidden />
      Add to order — {formatCurrency(item.price)}
    </button>
  );
}
