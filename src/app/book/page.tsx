import type { Metadata } from "next";
import Link from "next/link";
import InquiryForm from "@/components/InquiryForm";
import BladeRule from "@/components/BladeRule";
import { site, testimonials } from "@/lib/site";
import { breadcrumbSchema, jsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Check your date — Chef R. Kearse",
  description:
    "Five short questions. Tell Chef R. Kearse your date, your headcount and the kind of night it is, and he will come back with a menu direction and a quote.",
  alternates: { canonical: "/book" },
  robots: { index: true, follow: true },
};

const ASSURANCES = [
  "It goes straight to the chef — not a booking platform.",
  "No account, no deposit, no obligation.",
  "Consultations and tastings available; the fee is waived when you sign.",
  "Staff, bar, setup and cleanup are part of what he quotes.",
];

export default function BookPage() {
  const schema = jsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Check your date", path: "/book" },
    ])
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section
        className="section"
        style={{ paddingTop: "calc(var(--header-h) + 3rem)" }}
        aria-label="Check your date"
      >
        <div className="shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* Left rail: reassurance sits beside the ask, not below it */}
          <div className="order-1 lg:hidden">
            <nav aria-label="Breadcrumb" className="t-label text-muted">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="link-underline tap-sm">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-accent">Check your date</li>
              </ol>
            </nav>
            <h1 className="t-h1 mt-6 max-w-[12ch]">Check your date.</h1>
            <p className="t-lead mt-5 max-w-[38ch]">
              Five questions, about thirty seconds. You will find out whether he is free
              and what he would cook.
            </p>
          </div>

          <aside className="order-3 lg:order-1">
            <nav aria-label="Breadcrumb" className="t-label hidden text-muted lg:block">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="link-underline tap-sm">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-accent">Check your date</li>
              </ol>
            </nav>

            <h2 id="book-heading" className="t-h1 mt-9 hidden max-w-[12ch] lg:block">
              Check your date.
            </h2>
            <p className="t-lead mt-6 hidden max-w-[38ch] lg:block">
              Five questions, about thirty seconds. You will find out whether he is free
              and what he would cook.
            </p>

            <div className="mt-2 lg:mt-9">
              <BladeRule />
            </div>

            <ul className="mt-8 space-y-4">
              {ASSURANCES.map((a) => (
                <li key={a} className="flex items-start gap-3 text-[0.9375rem]">
                  <span
                    aria-hidden="true"
                    className="mt-[0.7em] inline-block h-px w-4 shrink-0 bg-accent"
                  />
                  <span>{a}</span>
                </li>
              ))}
            </ul>

            <figure className="mt-12 border-l-2 border-accent pl-5">
              <blockquote className="t-serif-italic text-lg leading-snug">
                &ldquo;{testimonials[0].quote}&rdquo;
              </blockquote>
              <figcaption className="t-small mt-3 text-muted">
                {testimonials[0].author} · {testimonials[0].source},{" "}
                {testimonials[0].dateLabel}
              </figcaption>
            </figure>

            <div className="mt-12 border-t border-line pt-8">
              <p className="t-label text-muted">Would rather just call?</p>
              <a
                href={`tel:${site.contact.phoneHref}`}
                className="t-h3 mt-3 block text-accent"
              >
                {site.contact.phone}
              </a>
              <a
                href={`tel:${site.contact.phoneAltHref}`}
                className="t-small mt-2 block text-muted"
              >
                Toll free {site.contact.phoneAlt}
              </a>
              <a
                href={`mailto:${site.contact.email}`}
                className="link-underline t-small mt-3 inline-block break-all text-muted"
              >
                {site.contact.email}
              </a>
            </div>
          </aside>

          <div className="order-2 lg:order-2">
            <InquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
