import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import FaqAccordion from "@/components/FaqAccordion";
import CtaBand from "@/components/CtaBand";
import { faqs } from "@/lib/faq";
import { breadcrumbSchema, faqSchema, jsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "FAQ — Booking a private chef in Richmond, DC and Maryland",
  description:
    "Straight answers on service areas, lead times, pricing, tastings, kitchen requirements, dietary needs, staff, bar service and how to book Chef R. Kearse.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const schema = jsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "FAQ", path: "/faq" },
    ]),
    faqSchema(faqs.map((f) => ({ q: f.q, a: f.a })))
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageHero
        eyebrow="Questions"
        title="The things people ask before they call."
        lede="If your question is not here, ask it in the enquiry form — it goes to the chef, not to a call centre."
        crumb={{ label: "FAQ", href: "/faq" }}
        image={{ src: "/images/dishes/salsa-prep-1024.webp", alt: "" }}
      />

      <section className="section" aria-label="Frequently asked questions">
        <div className="shell-narrow">
          <FaqAccordion items={faqs} headingLevel="h2" />
        </div>
      </section>

      <CtaBand
        heading="Still deciding? Start with the date."
        sub="Knowing whether he is free is the cheapest question you can ask. Five fields, thirty seconds."
      />
    </>
  );
}
