import type { LocationStop } from "@/lib/types";

/** Jackson Heights, Queens — approx. neighborhood center */
const JH = {
  city: "Jackson Heights, Queens, NY",
  zip: "11372",
  lat: 40.7557,
  lng: -73.8831,
} as const;

export const business = {
  name: "Street Flavor Food Truck",
  shortName: "Street Flavor",
  handle: "@STREETFLAVORTRUCK",
  phone: "(718) 555-0142",
  email: "hello@streetflavortruck.com",
  cuisine: "American street food, tacos, burgers, and bowls",
  priceRange: "$$",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  tiktok: "https://tiktok.com",
  area: "Jackson Heights, Queens, NY",
} as const;

export const weeklyLocations: LocationStop[] = [
  {
    id: "mon",
    day: "Monday",
    neighborhood: "Jackson Heights",
    address: "37th Ave & 82nd St",
    city: JH.city,
    zip: JH.zip,
    hours: "11:00 AM–8:00 PM",
    lat: 40.7478,
    lng: -73.8836,
    isToday: true,
  },
  {
    id: "tue",
    day: "Tuesday",
    neighborhood: "Jackson Heights",
    address: "Diversity Plaza · 74th St & 37th Ave",
    city: JH.city,
    zip: JH.zip,
    hours: "11:00 AM–8:00 PM",
    lat: 40.7498,
    lng: -73.8912,
  },
  {
    id: "wed",
    day: "Wednesday",
    neighborhood: "Jackson Heights",
    address: "Roosevelt Ave & 90th St",
    city: JH.city,
    zip: JH.zip,
    hours: "11:30 AM–8:30 PM",
    lat: 40.7485,
    lng: -73.8765,
  },
  {
    id: "thu",
    day: "Thursday",
    neighborhood: "Jackson Heights",
    address: "Travers Park · 34th Ave",
    city: JH.city,
    zip: JH.zip,
    hours: "11:00 AM–9:00 PM",
    lat: 40.7539,
    lng: -73.8865,
  },
  {
    id: "fri",
    day: "Friday",
    neighborhood: "Jackson Heights",
    address: "Northern Blvd & 82nd St",
    city: JH.city,
    zip: JH.zip,
    hours: "12:00 PM–9:00 PM",
    lat: 40.7556,
    lng: -73.8849,
  },
  {
    id: "sat",
    day: "Saturday",
    neighborhood: "Jackson Heights",
    address: "37th Ave Open Street · 80th St",
    city: JH.city,
    zip: JH.zip,
    hours: "10:00 AM–7:00 PM",
    lat: 40.7492,
    lng: -73.8858,
  },
  {
    id: "sun",
    day: "Sunday",
    neighborhood: "Private Events",
    address: "Contact us for availability in Jackson Heights & Queens",
    city: "Jackson Heights, Queens, NY",
    zip: JH.zip,
    hours: "By appointment",
    lat: JH.lat,
    lng: JH.lng,
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
