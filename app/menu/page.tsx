import type { Metadata } from "next";
import { MenuPageClient } from "@/components/menu-page-client";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Street tacos, tortas, burgers, sides, and drinks from Los Compadres Taquería.",
};

export default function MenuPage() {
  return (
    <div className="bg-background">
      <MenuPageClient />
    </div>
  );
}
