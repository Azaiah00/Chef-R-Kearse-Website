import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import GalleryGrid from "@/components/GalleryGrid";
import CtaBand from "@/components/CtaBand";
import { breadcrumbSchema, jsonLd } from "@/lib/schema";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gallery — Real plates from real events",
  description:
    "Photographs of Chef R. Kearse's own work: seafood, fire, Southern plates, desserts and the kitchen behind them. Richmond, Northern Virginia, Washington DC and Maryland.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  const schema = jsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Gallery", path: "/gallery" },
    ])
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageHero
        eyebrow="The work"
        title="Every plate here came off his own pass."
        lede="No stock photography. These are real dishes from real Chef Kearse events, taken at the table they were served on."
        crumb={{ label: "Gallery", href: "/gallery" }}
        image={{ src: "/images/dishes/mango-salsa-detail-1024.webp", alt: "" }}
      />

      <section className="section" aria-label="Photo gallery">
        <div className="shell">
          <GalleryGrid />
          <p className="t-small mt-12 max-w-2xl text-muted">
            More of his current work is posted to Instagram at{" "}
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline tap-sm text-ink"
            >
              {site.social.instagramHandle}
            </a>
            .
          </p>
        </div>
      </section>

      <CtaBand
        heading="Saw the one you want on your table?"
        sub="Send him the date and a rough headcount. He will come back with a menu written for your night."
      />
    </>
  );
}
