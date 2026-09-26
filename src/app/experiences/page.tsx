import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import BladeRule from "@/components/BladeRule";
import ProcessSteps from "@/components/ProcessSteps";
import CtaBand from "@/components/CtaBand";
import SplitHeading from "@/components/SplitHeading";
import { experiences } from "@/lib/experiences";
import { dishSrc } from "@/lib/dishes";
import { site } from "@/lib/site";
import { breadcrumbSchema, jsonLd, serviceSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Experiences — Private Dinners, Personal Chef, Weddings & Catering",
  description:
    "Private chef dinners at home, weekly personal chef service, wedding catering and full-service event catering across Richmond, Northern Virginia, Washington DC and Maryland.",
  alternates: { canonical: "/experiences" },
};

export default function ExperiencesPage() {
  const schema = jsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Experiences", path: "/experiences" },
    ]),
    ...experiences.map((x) =>
      serviceSchema(x.title, x.lede, `/experiences#${x.slug}`)
    )
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageHero
        eyebrow="What he does"
        title="Four ways to put a chef in your kitchen."
        lede="Dinner for two or dinner for two hundred. The scale changes; the standard does not."
        crumb={{ label: "Experiences", href: "/experiences" }}
        image={{
          src: "/images/dishes/lobster-tail-plated-1024.webp",
          alt: "",
        }}
      />

      {experiences.map((x, i) => (
        <section
          key={x.slug}
          id={x.slug}
          className={`section scroll-mt-24 ${i % 2 === 1 ? "bg-bone-2" : ""}`}
          aria-labelledby={`${x.slug}-heading`}
        >
          <div
            className={`shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${
              i % 2 === 1 ? "lg:[&>figure]:order-2" : ""
            }`}
          >
            <Reveal as="figure" className="m-0">
              <div
                className={`grain relative overflow-hidden bg-bone-2 ${
                  x.ratio === "portrait" ? "aspect-[4/5]" : "aspect-[5/4]"
                }`}
              >
                <Image
                  src={dishSrc(x.image, 1024)}
                  alt={x.imageAlt}
                  fill
                  sizes="(min-width:1024px) 46vw, 92vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            <div>
              <p className="t-label text-accent">{x.eyebrow}</p>
              <SplitHeading
                id={`${x.slug}-heading`}
                text={x.title}
                className="t-h2 mt-5 max-w-[14ch]"
              />
              <p className="t-lead mt-6 max-w-[46ch] text-ink">{x.lede}</p>
              <p className="t-lead mt-4 max-w-[52ch]">{x.body}</p>

              <div className="mt-9">
                <BladeRule />
              </div>

              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {x.includes.map((inc) => (
                  <li key={inc} className="flex items-start gap-3 text-[0.9375rem]">
                    <span
                      aria-hidden="true"
                      className="mt-[0.7em] inline-block h-px w-4 shrink-0 bg-accent"
                    />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>

              <p className="t-small mt-7 text-muted">
                <span className="t-label text-ink">Best for</span>
                <br />
                {x.bestFor}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/book?service=${encodeURIComponent(x.title)}`}
                  className="btn btn-primary"
                >
                  Check your date
                </Link>
                <Link href="/menus" className="btn btn-ghost">
                  See the plates
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* What's always included */}
      <section className="dark-section section" aria-labelledby="inc-heading">
        <div className="shell">
          <p className="t-label text-accent">Always included</p>
          <SplitHeading
            id="inc-heading"
            text="The parts nobody wants to think about."
            className="t-h2 mt-5 max-w-[18ch] text-bone"
          />
          <div className="mt-10">
            <BladeRule />
          </div>
          <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {site.inclusions.map((inc, i) => (
              <Reveal as="li" key={inc} delay={i * 0.05}>
                <span className="t-serif-italic text-2xl text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-lg text-bone">{inc}</p>
              </Reveal>
            ))}
          </ul>
          <p className="t-small mt-12 max-w-2xl text-muted-dark">
            Service styles available: {site.serviceStyles.join(" · ")}. Bar service:{" "}
            {site.beverage.join(" · ")}. Vegan and vegetarian options are available on
            every menu — tell him about allergies and dietary needs when you enquire and
            he will build around them.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="proc-heading">
        <div className="shell">
          <p className="t-label text-accent">How it works</p>
          <SplitHeading
            id="proc-heading"
            text="From your date to your dining room."
            className="t-h2 mt-5 max-w-[18ch]"
          />
          <div className="mt-16">
            <ProcessSteps />
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
