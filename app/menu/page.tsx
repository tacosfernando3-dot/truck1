import type { Metadata } from "next";
import { MenuPageClient } from "@/components/menu-page-client";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Street tacos, smash burgers, bowls, sides, and drinks from Street Flavor Food Truck.",
};

export default function MenuPage() {
  return (
    <div className="bg-background">
      <MenuPageClient />
    </div>
  );
}
