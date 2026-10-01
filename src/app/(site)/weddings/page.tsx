import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import BladeRule from "@/components/BladeRule";
import SplitHeading from "@/components/SplitHeading";
import FaqAccordion from "@/components/FaqAccordion";
import CtaBand from "@/components/CtaBand";
import { weddingFaqs } from "@/lib/faq";
import { site, testimonials } from "@/lib/site";
import { breadcrumbSchema, faqSchema, jsonLd, serviceSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Wedding Catering — Richmond VA, Northern Virginia, DC & Maryland",
  description:
    "Full-service wedding catering from Chef R. Kearse. Rehearsal dinner to late-night bites, seated or family style, with serving staff, bartenders, rentals, setup and cleanup.",
  alternates: { canonical: "/weddings" },
};

const TIMELINE = [
  {
    t: "Rehearsal dinner",
    b: "The smaller, warmer night. Family style tends to win here — it gets people talking across the table.",
  },
  {
    t: "Cocktail hour",
    b: "Passed and stationary appetisers, signature cocktails, a mobile bar where the room allows one.",
  },
  {
    t: "The reception",
    b: "Seated and plated, family style, stations or buffet — chosen for your room, your timeline and your guest list.",
  },
  {
    t: "Late night",
    b: "The last round that people actually remember. Something hot, something handheld, sent out after the dancing starts.",
  },
];

export default function WeddingsPage() {
  const featured = testimonials[0];
  const schema = jsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Weddings", path: "/weddings" },
    ]),
    serviceSchema(
      "Wedding catering",
      "Full-service wedding catering across Richmond, Northern Virginia, Washington DC and Maryland — seated, family style, stations or passed, with serving staff, bartenders, rentals, setup, breakdown and cleanup.",
      "/weddings"
    ),
    faqSchema(weddingFaqs.map((f) => ({ q: f.q, a: f.a })))
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageHero
        eyebrow="Weddings"
        title="Nobody remembers the centrepieces."
        lede="They remember whether the food was good. Full-service wedding catering across Richmond, Northern Virginia, Washington DC and Maryland — rehearsal dinner through to the last plate of the night."
        crumb={{ label: "Weddings", href: "/weddings" }}
        image={{ src: "/images/dishes/mango-salsa-platter-1024.webp", alt: "" }}
      />

      {/* Featured review, given the weight it deserves */}
      <section className="section-sm border-b border-line" aria-label="Featured review">
        <div className="shell-narrow text-center">
          <p className="t-label text-accent">A Chef Kearse wedding</p>
          <blockquote className="t-serif-italic mx-auto mt-7 max-w-[26ch] text-[1.75rem] leading-[1.28] md:max-w-[30ch] md:text-[2.6rem]">
            &ldquo;{featured.quote}&rdquo;
          </blockquote>
          <p className="t-small mt-7 text-muted">
            {featured.author} · Verified on{" "}
            <a
              href={featured.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-ink"
            >
              {featured.source}
            </a>
            , {featured.dateLabel}
          </p>
        </div>
      </section>

      {/* The offer */}
      <section className="section" aria-labelledby="offer-heading">
        <div className="shell grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="t-label text-accent">What he brings</p>
            <SplitHeading
              id="offer-heading"
              text="One kitchen. The whole weekend."
              className="t-h2 mt-5 max-w-[14ch]"
            />
            <p className="t-lead mt-7 max-w-[48ch]">
              Most couples end up stitching together a caterer, a bar company, a rental
              order and a cleanup crew, then spend the morning of the wedding chasing all
              four. Chef Kearse brings them in one booking.
            </p>

            <div className="mt-9">
              <BladeRule />
            </div>

            <ul className="mt-9 grid gap-4 sm:grid-cols-2">
              {[
                "Consultation and tasting (fee waived on signing)",
                "Menu written for your day",
                "Seated, family style, stations or passed",
                "Serving staff on the floor",
                "Bartenders and mobile bar",
                "Bar and beverage servingware rentals",
                "Signature cocktails",
                "Desserts and pastry",
                "Delivery and setup",
                "Breakdown and cleanup",
                "Vegan and vegetarian options",
                "Allergy and dietary planning with the chef",
              ].map((inc) => (
                <li key={inc} className="flex items-start gap-3 text-[0.9375rem]">
                  <span
                    aria-hidden="true"
                    className="mt-[0.7em] inline-block h-px w-4 shrink-0 bg-accent"
                  />
                  <span>{inc}</span>
                </li>
              ))}
            </ul>

            <Link href="/book?service=Wedding" className="btn btn-primary mt-10">
              Check your wedding date
            </Link>
          </div>

          <Reveal>
            <div className="grain relative aspect-[4/5] overflow-hidden bg-bone-2">
              <Image
                src="/images/dishes/lobster-shrimp-linguine-1024.webp"
                alt="Lobster tail and shrimp arranged over linguine in a shallow white bowl with a light sauce"
                fill
                sizes="(min-width:1024px) 44vw, 92vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Timeline */}
      <section className="dark-section section" aria-labelledby="timeline-heading">
        <div className="shell">
          <p className="t-label text-accent">The day, fed</p>
          <SplitHeading
            id="timeline-heading"
            text="Four services, one chef."
            className="t-h2 mt-5 max-w-[14ch] text-bone"
          />
          <ol className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
            {TIMELINE.map((s, i) => (
              <Reveal as="li" key={s.t} delay={i * 0.06}>
                <span className="t-serif-italic text-4xl text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="mt-4">
                  <BladeRule />
                </div>
                <h3 className="t-h3 mt-5 text-bone">{s.t}</h3>
                <p className="t-small mt-3 max-w-[34ch] text-muted-dark">{s.b}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Styles */}
      <section className="section" aria-labelledby="styles-heading">
        <div className="shell">
          <p className="t-label text-accent">Service styles</p>
          <SplitHeading
            id="styles-heading"
            text="Choose the one that suits the room."
            className="t-h2 mt-5 max-w-[16ch]"
          />
          <ul className="mt-12 flex flex-wrap gap-3">
            {site.serviceStyles.map((s) => (
              <li
                key={s}
                className="border border-line bg-paper px-5 py-3 text-[0.9375rem]"
              >
                {s}
              </li>
            ))}
          </ul>
          <p className="t-lead mt-9 max-w-2xl">
            Not sure which? Say what your venue looks like and how long you have the room
            for. He will tell you which style he would run and why — including when a
            buffet is genuinely the better call.
          </p>
        </div>
      </section>

      <section className="section-sm" aria-label="Wedding questions">
        <div className="shell-narrow">
          <h2 className="t-label text-accent">Wedding questions</h2>
          <div className="mt-10">
            <FaqAccordion items={weddingFaqs} />
          </div>
        </div>
      </section>

      <CtaBand
        heading="Check whether your wedding date is still open."
        sub="Dates go early for spring, autumn and the holidays. Five questions and you will know."
      />
    </>
  );
}
