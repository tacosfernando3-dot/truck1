import type { Metadata } from "next";
import { Bebas_Neue, Inter, Permanent_Marker } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { ContactModal } from "@/components/contact-modal";
import { ContactProvider } from "@/components/contact-provider";
import { ContentProvider } from "@/components/content-provider";
import { MobileCartBar } from "@/components/mobile-cart-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SitePreloader } from "@/components/site-preloader";
import { ScrollToTop } from "@/components/scroll-to-top";
import { LanguageProvider } from "@/lib/i18n";
import { business } from "@/data/locations";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const marker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marker",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://loscompadrestaqueriany.com"),
  title: {
    default: "Los Compadres Taquería | Bold Flavor Anywhere",
    template: "%s | Los Compadres",
  },
  description:
    "Mexican street food made fresh in Elmhurst, Queens — tacos, tortas, and more.",
  openGraph: {
    title: "Los Compadres Taquería | Bold Flavor Anywhere",
    description:
      "Mexican street food made fresh in Elmhurst, Queens — tacos, tortas, and more.",
    type: "website",
    locale: "en_US",
    siteName: business.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Los Compadres Taquería | Bold Flavor Anywhere",
    description:
      "Mexican street food made fresh in Elmhurst, Queens — tacos, tortas, and more.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bebas.variable} ${marker.variable} h-full`}
    >
      <body className="min-h-full font-sans antialiased">
        <LanguageProvider>
          <ContentProvider>
            <SitePreloader />
            <ContactProvider>
              <CartProvider>
                <div className="site-frame">
                  <SiteHeader />
                  <main className="flex-1">{children}</main>
                  <SiteFooter />
                </div>
                <CartDrawer />
                <MobileCartBar />
                <ContactModal />
              </CartProvider>
            </ContactProvider>
          </ContentProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
