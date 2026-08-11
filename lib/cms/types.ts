import type { GalleryItem, MenuItem } from "@/lib/types";

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
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  footerBlurb: string;
};

export type CmsContent = {
  categories: string[];
  menu: MenuItem[];
  gallery: GalleryItem[];
  business: CmsBusiness;
};
