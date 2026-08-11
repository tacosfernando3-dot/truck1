import type { NavLink } from "@/lib/types";

export const primaryNav: NavLink[] = [
  { href: "/", key: "nav.home" },
  { href: "/menu", key: "nav.menu" },
  { href: "/locations", key: "nav.locations" },
  { href: "/catering", key: "nav.catering" },
  { href: "/#about", key: "nav.about" },
  { href: "/#contact", key: "nav.contact" },
];

export const footerPages: NavLink[] = [
  { href: "/", key: "nav.home" },
  { href: "/menu", key: "nav.menu" },
  { href: "/locations", key: "nav.locations" },
  { href: "/catering", key: "nav.catering" },
  { href: "/#about", key: "nav.about" },
  { href: "/#contact", key: "nav.contact" },
];

export const footerInfo: NavLink[] = [
  { href: "/catering", key: "nav.cateringEvents" },
  { href: "/catering#packages", key: "nav.privateParties" },
  { href: "/#gallery", key: "nav.gallery" },
  { href: "/orders", key: "nav.orders" },
  { href: "/catering#faq", key: "nav.faqs" },
  { href: "/admin", key: "nav.admin" },
];
