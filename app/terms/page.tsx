import type { Metadata } from "next";
import { LegalPageClient } from "@/components/legal-page-client";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of use for the Los Compadres Taquería website, orders, and catering inquiries.",
};

export default function TermsPage() {
  return <LegalPageClient page="terms" />;
}
