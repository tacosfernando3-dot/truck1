import { CallToActionBanner } from "@/components/call-to-action-banner";
import { CateringSection } from "@/components/catering-section";
import { GallerySection } from "@/components/gallery-section";
import { HeroSection } from "@/components/hero-section";
import { LocationSection } from "@/components/location-section";
import { MenuPreview } from "@/components/menu-preview";
import { readCms } from "@/lib/cms/store";
import { formatBusinessAddress } from "@/lib/cms/utils";

async function LocalBusinessJsonLd() {
  const cms = await readCms();
  const { business } = cms;
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
      streetAddress: business.streetAddress,
      addressLocality: business.city,
      addressRegion: business.state,
      postalCode: business.zip,
      addressCountry: "US",
    },
    sameAs: [
      business.showInstagram ? business.instagram : null,
      business.showFacebook ? business.facebook : null,
      business.showTikTok ? business.tiktok : null,
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function HomePage() {
  const address = formatBusinessAddress((await readCms()).business);

  return (
    <>
      <LocalBusinessJsonLd />
      <HeroSection />
      <MenuPreview />
      <LocationSection />
      <GallerySection />
      <CateringSection />
      <CallToActionBanner />
      <span className="sr-only">{address}</span>
    </>
  );
}
