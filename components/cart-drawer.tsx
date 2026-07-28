"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/button";
import { CheckoutSimulator } from "@/components/checkout-simulator";
import { useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    items,
    cartCount,
    subtotal,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!isCartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !checkoutOpen) closeCart();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isCartOpen, closeCart, checkoutOpen]);

  if (!isCartOpen && !checkoutOpen) return null;

  return (
    <>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 animate-fade-in"
            aria-label="Close cart overlay"
            onClick={closeCart}
          />
          <aside
            className="relative flex h-full w-full max-w-[420px] flex-col bg-cream text-background shadow-2xl animate-slide-in-right pb-[env(safe-area-inset-bottom)]"
            role="dialog"
            aria-modal="true"
            aria-label="Your order"
          >
            <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
              <h2 className="font-display text-2xl tracking-wide uppercase">
                Your Order ({cartCount})
              </h2>
              <button
                type="button"
                onClick={closeCart}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-cream-dark"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <p className="text-background/70">
                    Your cart is empty. Time to crave something bold.
                  </p>
                  <Button href="/menu" onClick={closeCart}>
                    Browse Menu
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-3 rounded-lg border border-border-light bg-white p-3"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-background/70">
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-xs font-medium text-background/60 hover:text-background"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded border border-border-light hover:bg-cream-dark"
                            onClick={() => decrementItem(item.id)}
                            aria-label={`Decrease ${item.name}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded border border-border-light hover:bg-cream-dark"
                            onClick={() => incrementItem(item.id)}
                            aria-label={`Increase ${item.name}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-3 border-t border-border-light px-5 py-5">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <p className="text-xs text-background/60">
                  Tax estimated at checkout. Demo Stripe simulator — no real
                  charges.
                </p>
                <Button
                  className="w-full"
                  onClick={() => setCheckoutOpen(true)}
                >
                  Checkout
                </Button>
                <Button
                  variant="outline-dark"
                  className="w-full"
                  onClick={closeCart}
                >
                  Continue Browsing
                </Button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full text-center text-sm text-background/60 hover:text-background"
                >
                  Clear cart
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      <CheckoutSimulator
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
