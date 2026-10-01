import type { Metadata, Viewport } from "next";
// Fonts are declared directly in globals.css from files in /public/fonts —
// latin subsets only, self-hosted, no third-party request.
import "./globals.css";
import { site } from "@/lib/site";

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
      </head>
      {/*
        The root shell only. Fonts and the document itself.

        The site header, footer, mobile bar, smooth scrolling and the
        LocalBusiness structured data all live in src/app/(site)/layout.tsx,
        because a root layout wraps EVERY route — including the staff portal and
        the guests' private event pages, none of which should carry the
        marketing chrome or a restaurant schema.

        Smooth scroll in particular: Lenis is right for an editorial page you
        read top to bottom, and wrong for an operations tool. It intercepts the
        wheel, which fights the pipeline board's horizontal scroller, and it
        added a phantom 74px of horizontal page scroll on that route. The portal
        uses native scrolling.
      */}
      <body>{children}</body>
    </html>
  );
}
