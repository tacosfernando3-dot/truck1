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
      <div className="hidden border-b border-border-dark bg-surface-dark py-10 md:block">
        <div className="container-site">
          <p className="text-sm font-semibold tracking-[0.22em] text-yellow uppercase">
            Order ahead
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white uppercase sm:text-5xl">
            Full Menu
          </h1>
        </div>
      </div>
      <MenuPageClient />
    </div>
  );
}
