import { galleryItems } from "@/data/gallery";
import { business } from "@/data/locations";
import { menuCategories, menuItems } from "@/data/menu";
import type { CmsContent } from "@/lib/cms/types";

export function getDefaultCms(): CmsContent {
  return {
    categories: menuCategories.filter((category) => category !== "All"),
    menu: structuredClone(menuItems),
    gallery: structuredClone(galleryItems),
    business: {
      name: business.name,
      shortName: business.shortName,
      handle: business.handle,
      phone: business.phone,
      email: business.email,
      cuisine: business.cuisine,
      priceRange: business.priceRange,
      instagram: business.instagram,
      facebook: business.facebook,
      tiktok: business.tiktok,
      streetAddress: "37th Ave & 82nd St",
      city: "Jackson Heights",
      state: "NY",
      zip: "11372",
      footerBlurb:
        "Bold flavor on wheels. Catch us in Jackson Heights, Queens and book us for your next event.",
    },
  };
}
