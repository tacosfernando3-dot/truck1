"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/utils";

export function MobileCartBar() {
  const { cartCount, subtotal, openCart } = useCart();

  if (cartCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden animate-fade-up">
      <button
        type="button"
        onClick={openCart}
        className="mx-auto flex w-full max-w-lg min-h-12 items-center justify-between rounded-md bg-yellow px-5 py-3 font-semibold tracking-wide text-background uppercase shadow-lg shadow-yellow/20"
        aria-label={`View cart, ${cartCount} items, ${formatCurrency(subtotal)}`}
      >
        <span className="inline-flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" aria-hidden />
          View Cart ({cartCount})
        </span>
        <span>{formatCurrency(subtotal)}</span>
      </button>
    </div>
  );
}
