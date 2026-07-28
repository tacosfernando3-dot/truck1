import type { Metadata } from "next";
import { Bebas_Neue, Inter, Permanent_Marker } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { MobileCartBar } from "@/components/mobile-cart-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SitePreloader } from "@/components/site-preloader";
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
  metadataBase: new URL("https://streetflavortruck.com"),
  title: {
    default: "Street Flavor | Bold Flavor Anywhere",
    template: "%s | Street Flavor",
  },
  description:
    "Gourmet street food made fresh and served wherever the city takes us.",
  openGraph: {
    title: "Street Flavor | Bold Flavor Anywhere",
    description:
      "Gourmet street food made fresh and served wherever the city takes us.",
    type: "website",
    locale: "en_US",
    siteName: business.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Street Flavor | Bold Flavor Anywhere",
    description:
      "Gourmet street food made fresh and served wherever the city takes us.",
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
      <body className="min-h-full flex flex-col font-sans antialiased">
        <LanguageProvider>
          <SitePreloader />
          <CartProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <CartDrawer />
            <MobileCartBar />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
