import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import BladeRule from "@/components/BladeRule";
import CtaBand from "@/components/CtaBand";
import { site } from "@/lib/site";
import { breadcrumbSchema, jsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Contact — Chef R. Kearse, Richmond VA",
  description:
    "Call, email or send an enquiry to Chef R. Kearse. Private chef and catering across Richmond, Northern Virginia, Washington DC and Maryland.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const schema = jsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
    ])
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageHero
        eyebrow="Contact"
        title="Reach the chef directly."
        lede="No agency, no answering service. Calls and emails go to Chef Kearse."
        crumb={{ label: "Contact", href: "/contact" }}
        image={{ src: "/images/dishes/scallops-prep-1024.webp", alt: "" }}
        cta={false}
      />

      <section className="section" aria-labelledby="contact-heading">
        <div className="shell grid gap-14 lg:grid-cols-3 lg:gap-16">
          <div>
            <h2 id="contact-heading" className="t-label text-accent">
              By phone
            </h2>
            <div className="mt-5">
              <BladeRule />
            </div>
            <a
              href={`tel:${site.contact.phoneHref}`}
              className="t-h3 mt-7 block hover:text-accent"
            >
              {site.contact.phone}
            </a>
            <a
              href={`tel:${site.contact.phoneAltHref}`}
              className="tap-sm mt-2 block text-muted hover:text-accent"
            >
              Toll free {site.contact.phoneAlt}
            </a>
          </div>

          <div>
            <h2 className="t-label text-accent">By email</h2>
            <div className="mt-5">
              <BladeRule />
            </div>
            <a
              href={`mailto:${site.contact.email}`}
              className="t-h3 mt-7 block break-all hover:text-accent"
            >
              {site.contact.email}
            </a>
            <p className="t-small mt-4 text-muted">
              Include your date, your headcount and where you are — that is everything he
              needs for a first answer.
            </p>
          </div>

          <div>
            <h2 className="t-label text-accent">Online</h2>
            <div className="mt-5">
              <BladeRule />
            </div>
            <ul className="mt-7 space-y-3">
              <li>
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline tap-sm text-lg"
                >
                  Instagram {site.social.instagramHandle}
                </a>
              </li>
              <li>
                <a
                  href={site.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline tap-sm text-lg"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={site.social.yelp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline tap-sm text-lg"
                >
                  Yelp
                </a>
              </li>
              <li>
                <a
                  href={site.social.zola}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline tap-sm text-lg"
                >
                  Zola (weddings)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="shell mt-20 grid gap-12 border-t border-line pt-14 lg:grid-cols-2">
          <div>
            <h2 className="t-h3 max-w-[18ch]">Where he cooks</h2>
            <p className="t-lead mt-5 max-w-[46ch]">
              Based in {site.location.city}, {site.location.regionName}, cooking across
              Virginia, Washington DC and Maryland.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {site.serviceAreas.map((a) => (
                <li key={a} className="border border-line bg-paper px-4 py-2 text-[0.9375rem]">
                  {a}
                </li>
              ))}
            </ul>
            <p className="t-small mt-6 text-muted">
              Outside that list? Ask anyway — travel is quoted per event.
            </p>
          </div>

          <div className="bg-paper p-8 md:p-10">
            <p className="t-label text-accent">Fastest route</p>
            <h2 className="t-h3 mt-4 max-w-[18ch]">
              Send the date and he can answer in one reply.
            </h2>
            <p className="t-lead mt-5">
              The enquiry form asks the five things he needs to know before he can tell you
              anything useful.
            </p>
            <Link href="/book" className="btn btn-primary mt-8 w-full sm:w-auto">
              Check your date
            </Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
