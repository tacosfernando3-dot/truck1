import { CallToActionBanner } from "@/components/call-to-action-banner";
import { CateringSection } from "@/components/catering-section";
import { GallerySection } from "@/components/gallery-section";
import { HeroSection } from "@/components/hero-section";
import { LocationSection } from "@/components/location-section";
import { MenuPreview } from "@/components/menu-preview";
import { business, getTodaysLocation, fullAddress } from "@/data/locations";

function LocalBusinessJsonLd() {
  const today = getTodaysLocation();
  const schema = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: business.name,
    description:
      "Gourmet street food made fresh and served wherever the city takes us.",
    servesCuisine: business.cuisine,
    priceRange: business.priceRange,
    telephone: business.phone,
    email: business.email,
    url: "https://streetflavortruck.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: today.address,
      addressLocality: "Jackson Heights",
      addressRegion: "NY",
      postalCode: today.zip,
      addressCountry: "US",
    },
    sameAs: [business.instagram, business.facebook, business.tiktok],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <LocalBusinessJsonLd />
      <HeroSection />
      <MenuPreview />
      <LocationSection />
      <GallerySection />
      <CateringSection />
      <CallToActionBanner />
      <span className="sr-only">{fullAddress(getTodaysLocation())}</span>
    </>
  );
}
