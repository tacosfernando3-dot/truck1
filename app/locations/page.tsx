import type { Metadata } from "next";
import { LocationsPageClient } from "@/components/locations-page-client";

export const metadata: Metadata = {
  title: "Locations",
  description:
    "Find where Los Compadres Taquería is rolling this week in Elmhurst, Queens, NY.",
};

export default function LocationsPage() {
  return <LocationsPageClient />;
}
