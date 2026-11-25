import { galleryItems } from "@/data/gallery";
import { business } from "@/data/locations";
import { menuCategories, menuItems } from "@/data/menu";
import { CACHED_GOOGLE_REVIEWS } from "@/lib/google-reviews-data";
import type {
  BusinessDayHours,
  CmsContent,
  CmsGoogleReviews,
} from "@/lib/cms/types";

/** Matches the live Google listing (rating + count); review texts sync via Places or admin. */
export const DEFAULT_GOOGLE_REVIEWS: CmsGoogleReviews = {
  rating: CACHED_GOOGLE_REVIEWS.rating,
  userRatingCount: CACHED_GOOGLE_REVIEWS.userRatingCount,
  updatedAt: CACHED_GOOGLE_REVIEWS.updatedAt,
  reviews: structuredClone(CACHED_GOOGLE_REVIEWS.reviews),
};

export const DEFAULT_BUSINESS_HOURS: BusinessDayHours[] = [
  { day: "Monday", open: true, opens: "11:00", closes: "20:00" },
  { day: "Tuesday", open: true, opens: "11:00", closes: "20:00" },
  { day: "Wednesday", open: true, opens: "11:30", closes: "20:30" },
  { day: "Thursday", open: true, opens: "11:00", closes: "21:00" },
  { day: "Friday", open: true, opens: "12:00", closes: "21:00" },
  { day: "Saturday", open: true, opens: "10:00", closes: "19:00" },
  {
    day: "Sunday",
    open: false,
    opens: "11:00",
    closes: "20:00",
    note: "By appointment",
  },
];

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
      hours: structuredClone(DEFAULT_BUSINESS_HOURS),
      googleReviews: structuredClone(DEFAULT_GOOGLE_REVIEWS),
    },
  };
}
