import type { Metadata, Viewport } from "next";
// Fonts are declared directly in globals.css from files in /public/fonts —
// latin subsets only, self-hosted, no third-party request.
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MobileCtaBar from "@/components/MobileCtaBar";
import SmoothScroll from "@/components/SmoothScroll";
import { site } from "@/lib/site";
import {
  jsonLd,
  localBusinessSchema,
  organizationSchema,
  websiteSchema,
} from "@/lib/schema";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Private Chef & Catering — Richmond, DC & Maryland`,
    template: `%s | ${site.name}`,
  },
  description:
    "Third-generation private chef and caterer. Plated dinners in your home, weddings and full-service catering across Richmond, Northern Virginia, Washington DC and Maryland. Check your date.",
  applicationName: site.legalName,
  authors: [{ name: site.legalName }],
  creator: site.legalName,
  keywords: [
    "private chef Richmond VA",
    "personal chef Richmond",
    "private chef DC",
    "private chef Maryland",
    "wedding caterer Richmond VA",
    "in-home dining Richmond",
    "DMV personal chef",
    "catering Richmond Virginia",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.legalName,
    title: `${site.name} — Private Chef & Catering`,
    description: site.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Private Chef & Catering`,
    description: site.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#12100E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="no-js">
      <head>
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/fraunces-latin-opsz-normal.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/inter-latin-wght-normal.woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              jsonLd(organizationSchema(), localBusinessSchema(), websiteSchema())
            ),
          }}
        />
      </head>
      <body className="has-mobile-bar">
        <SmoothScroll />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <MobileCtaBar />
      </body>
    </html>
  );
}
