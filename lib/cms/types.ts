import type { GalleryItem, MenuItem } from "@/lib/types";

export type GallerySocial = "instagram" | "facebook" | "tiktok";

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
};

export type CmsContent = {
  categories: string[];
  /** Categories turned off on the public menu (still editable in admin). */
  hiddenCategories?: string[];
  menu: MenuItem[];
  gallery: GalleryItem[];
  business: CmsBusiness;
};
