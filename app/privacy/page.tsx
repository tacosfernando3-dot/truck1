import type { Metadata } from "next";
import { LegalPageClient } from "@/components/legal-page-client";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Los Compadres Taquería collects, uses, and protects information on our website.",
};

export default function PrivacyPage() {
  return <LegalPageClient page="privacy" />;
}
