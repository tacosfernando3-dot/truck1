"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useI18n, useT } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

export function MobileCartBar() {
  const { cartCount, subtotal, openCart } = useCart();
  const t = useT();
  const { locale } = useI18n();

  if (cartCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden animate-fade-up">
      <button
        type="button"
        onClick={openCart}
        className="mx-auto flex w-full max-w-lg min-h-12 items-center justify-between rounded-md bg-yellow px-5 py-3 font-semibold tracking-wide text-background uppercase shadow-lg shadow-yellow/20"
        aria-label={t("cart.viewCartAria", {
          count: cartCount,
          subtotal: formatCurrency(subtotal, locale),
        })}
      >
        <span className="inline-flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" aria-hidden />
          {t("cart.viewCart", { count: cartCount })}
        </span>
        <span>{formatCurrency(subtotal, locale)}</span>
      </button>
    </div>
  );
}
