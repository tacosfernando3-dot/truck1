import type { Metadata } from "next";
import { CateringPageClient } from "@/components/catering-page-client";

export const metadata: Metadata = {
  title: "Catering",
  description:
    "Bring Street Flavor to your event — packages from $18 per guest with on-site truck options.",
};

export default function CateringPage() {
  return <CateringPageClient />;
}
