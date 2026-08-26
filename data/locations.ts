import type { LocationStop } from "@/lib/types";

/** Elmhurst, Queens — near Broadway / Queens Blvd */
const EQ = {
  city: "Elmhurst, Queens, NY",
  zip: "11373",
  lat: 40.7424,
  lng: -73.8778,
} as const;

export const business = {
  name: "Los Compadres Taquería",
  shortName: "Los Compadres",
  handle: "@loscompadrestaqueria",
  phone: "(929) 283-0153",
  email: "hello@loscompadrestaqueriany.com",
  cuisine: "Mexican street food, tacos, tortas, and more",
  priceRange: "$$",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  tiktok: "https://tiktok.com",
  area: "Elmhurst, Queens, NY",
} as const;

export const weeklyLocations: LocationStop[] = [
  {
    id: "mon",
    day: "Monday",
    neighborhood: "Elmhurst, Queens",
    address: "82-12 Broadway",
    city: EQ.city,
    zip: EQ.zip,
    hours: "11:00 AM–8:00 PM",
    lat: 40.7424,
    lng: -73.8778,
    isToday: true,
  },
  {
    id: "tue",
    day: "Tuesday",
    neighborhood: "Elmhurst, Queens",
    address: "Queens Blvd & Broadway",
    city: EQ.city,
    zip: EQ.zip,
    hours: "11:00 AM–8:00 PM",
    lat: 40.7412,
    lng: -73.8789,
  },
  {
    id: "wed",
    day: "Wednesday",
    neighborhood: "Elmhurst, Queens",
    address: "Baxter Ave & Broadway",
    city: EQ.city,
    zip: EQ.zip,
    hours: "11:30 AM–8:30 PM",
    lat: 40.7431,
    lng: -73.8762,
  },
  {
    id: "thu",
    day: "Thursday",
    neighborhood: "Elmhurst, Queens",
    address: "Elmhurst Hospital area · Broadway",
    city: EQ.city,
    zip: EQ.zip,
    hours: "11:00 AM–9:00 PM",
    lat: 40.7445,
    lng: -73.8755,
  },
  {
    id: "fri",
    day: "Friday",
    neighborhood: "Elmhurst, Queens",
    address: "Broadway & Whitney Ave",
    city: EQ.city,
    zip: EQ.zip,
    hours: "12:00 PM–9:00 PM",
    lat: 40.7418,
    lng: -73.8794,
  },
  {
    id: "sat",
    day: "Saturday",
    neighborhood: "Elmhurst, Queens",
    address: "Newtown Playground · 56th Ave",
    city: EQ.city,
    zip: EQ.zip,
    hours: "10:00 AM–7:00 PM",
    lat: 40.7356,
    lng: -73.8768,
  },
  {
    id: "sun",
    day: "Sunday",
    neighborhood: "Private Events",
    address: "Contact us for availability in Elmhurst & Queens",
    city: "Elmhurst, Queens, NY",
    zip: EQ.zip,
    hours: "By appointment",
    lat: EQ.lat,
    lng: EQ.lng,
    isPrivate: true,
  },
];

export function getTodaysLocation() {
  return weeklyLocations.find((stop) => stop.isToday) ?? weeklyLocations[0];
}

export function fullAddress(stop: LocationStop) {
  if (stop.isPrivate) return stop.address;
  return `${stop.address}, ${stop.city} ${stop.zip}`.trim();
}
