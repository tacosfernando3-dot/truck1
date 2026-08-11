"use client";

import { Plus } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useI18n, useT } from "@/lib/i18n";
import { localizeMenuItem } from "@/lib/localize-menu";
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
  const t = useT();
  const { locale } = useI18n();
  const localized = localizeMenuItem(item, locale);

  return (
    <button
      type="button"
      onClick={() => {
        addItem(item);
        openCart();
      }}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-yellow px-6 text-sm font-semibold tracking-wide text-white uppercase transition hover:bg-yellow-hover ${className}`}
      aria-label={t("menuPage.addToCart", { name: localized.localizedName })}
    >
      <Plus className="h-4 w-4" aria-hidden />
      {t("menuPage.addToOrderPrice", { price: formatCurrency(item.price, locale) })}
    </button>
  );
}
