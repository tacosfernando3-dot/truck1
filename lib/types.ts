export type MenuCategory = string;

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  longDescription: string;
  price: number;
  image: string;
  featured?: boolean;
  /** When false, hidden from the public menu (still editable in admin). */
  available?: boolean;
  /** Focal point for object-fit cover crops (0–100). */
  imageFocus?: { x: number; y: number };
  serves?: string;
  heat?: "mild" | "medium" | "hot";
  includes?: string[];
  allergens?: string[];
};

export type CartItem = MenuItem & {
  quantity: number;
};

export type NavLink = {
  href: string;
  key: string;
};

export type LocationStop = {
  id: string;
  day: string;
  neighborhood: string;
  address: string;
  city: string;
  zip: string;
  hours: string;
  lat: number;
  lng: number;
  isToday?: boolean;
  isPrivate?: boolean;
};

export type GalleryItem = {
  id: string;
  alt: string;
  image: string;
};

export type CateringPackage = {
  id: string;
  name: string;
  priceLabel: string;
  features: string[];
  highlighted?: boolean;
};
