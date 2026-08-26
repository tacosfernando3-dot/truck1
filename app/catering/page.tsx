import type { Metadata } from "next";
import { CateringPageClient } from "@/components/catering-page-client";

export const metadata: Metadata = {
  title: "Catering",
  description:
    "Bring Los Compadres to your event — custom catering for parties, offices, and productions.",
};

export default function CateringPage() {
  return <CateringPageClient />;
}
