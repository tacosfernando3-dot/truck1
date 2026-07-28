import type { MenuItem } from "@/lib/types";
import type { Dictionary, Locale } from "@/data/dictionaries";
import { dictionaries } from "@/data/dictionaries";

export type LocalizedMenuItem = MenuItem & {
  localizedName: string;
  localizedDescription: string;
  localizedLongDescription: string;
  localizedServes?: string;
  localizedIncludes?: string[];
  localizedAllergens?: string[];
  localizedCategory: string;
};

export function localizeMenuItem(
  item: MenuItem,
  locale: Locale,
): LocalizedMenuItem {
  const dict = dictionaries[locale] as Dictionary;
  const entry = dict.menu[item.id as keyof typeof dict.menu];
  const categoryKey = item.category as keyof typeof dict.categories;

  return {
    ...item,
    localizedName: entry?.name ?? item.name,
    localizedDescription: entry?.description ?? item.description,
    localizedLongDescription: entry?.longDescription ?? item.longDescription,
    localizedServes: entry?.serves ?? item.serves,
    localizedIncludes: entry?.includes ? [...entry.includes] : item.includes,
    localizedAllergens: entry?.allergens
      ? [...entry.allergens]
      : item.allergens,
    localizedCategory: dict.categories[categoryKey] ?? item.category,
  };
}

export function localizeCategory(category: string, locale: Locale) {
  const dict = dictionaries[locale] as Dictionary;
  const key = category as keyof typeof dict.categories;
  return dict.categories[key] ?? category;
}
