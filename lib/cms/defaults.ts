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
      phone: "(929) 283-0153",
      email: business.email,
      cuisine: business.cuisine,
      priceRange: business.priceRange,
      instagram: business.instagram,
      facebook: business.facebook,
      tiktok: business.tiktok,
      showInstagram: true,
      showFacebook: true,
      showTikTok: true,
      gallerySocial: "instagram",
      streetAddress: "82-12 Broadway",
      city: "Elmhurst",
      state: "NY",
      zip: "11373",
      footerBlurb:
        "Bold flavor on wheels. Catch us in Elmhurst, Queens and book us for your next event.",
    },
  };
}
