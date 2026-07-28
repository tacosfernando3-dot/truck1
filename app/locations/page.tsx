import type { Metadata } from "next";
import { LocationsPageClient } from "@/components/locations-page-client";

export const metadata: Metadata = {
  title: "Locations",
  description:
    "Find where Street Flavor Food Truck is rolling this week in Jackson Heights, Queens, NY.",
};

export default function LocationsPage() {
  return <LocationsPageClient />;
}
