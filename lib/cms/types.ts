import type { GalleryItem, MenuItem } from "@/lib/types";

export type GallerySocial = "instagram" | "facebook" | "tiktok";

export type CmsGoogleReview = {
  id: string;
  author: string;
  rating: number;
  text: string;
  textEs?: string;
  relativeTime?: string;
  publishedAt?: string;
  profilePhotoUrl?: string;
  authorUrl?: string;
};

/** Homepage Google reviews carousel snapshot (editable in admin / refreshed via Places). */
export type CmsGoogleReviews = {
  rating: number;
  userRatingCount: number;
  reviews: CmsGoogleReview[];
  updatedAt: string;
};

export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type BusinessDayHours = {
  day: Weekday;
  open: boolean;
  /** 24h "HH:MM" when open */
  opens: string;
  /** 24h "HH:MM" when open */
  closes: string;
  /** Shown instead of "Closed" when the day is off (e.g. By appointment) */
  note?: string;
};

export type CmsBusiness = {
  name: string;
  shortName: string;
  handle: string;
  phone: string;
  email: string;
  cuisine: string;
  priceRange: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  showInstagram: boolean;
  showFacebook: boolean;
  showTikTok: boolean;
  /** Social profile used by the homepage gallery section */
  gallerySocial: GallerySocial;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  footerBlurb: string;
  /** Weekly open/closed schedule */
  hours: BusinessDayHours[];
  /** Cached Google reviews shown on the homepage */
  googleReviews: CmsGoogleReviews;
};

export type CmsContent = {
  categories: string[];
  /** Categories turned off on the public menu (still editable in admin). */
  hiddenCategories?: string[];
  menu: MenuItem[];
  gallery: GalleryItem[];
  business: CmsBusiness;
};
