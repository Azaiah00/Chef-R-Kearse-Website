import Image from "next/image";
import Link from "next/link";
import { navLinks, site } from "@/lib/site";

const Ico = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M14.5 8.5H17V5.5h-2.5A3.5 3.5 0 0 0 11 9v2H9v3h2v7h3v-7h2.2l.5-3H14V9a.5.5 0 0 1 .5-.5Z" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="m12 3.6 2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 17l-5.25 2.75 1-5.85L3.5 9.75l5.9-.85L12 3.6Z" />
    </svg>
  ),
};

export default function SiteFooter() {
  return (
    <footer className="dark-section relative overflow-hidden">
      <div className="shell pt-20 pb-12 md:pt-28">
        <div className="grid gap-14 lg:grid-cols-[1.35fr_1fr_1fr_1.1fr]">
          <div>
            <Image
              src="/images/brand/logo-bone.png"
              alt={`${site.name} — Private Chef & Catering`}
              width={440}
              height={125}
              className="h-14 w-[197px]"
            />
            <p className="t-serif-italic mt-6 max-w-sm text-xl leading-snug text-bone/85">
              {site.tagline}
            </p>
            <p className="t-small mt-5 max-w-sm text-muted-dark">
              Private chef dinners, weddings and full-service catering across Richmond,
              Northern Virginia, Washington DC and Maryland. Cooking for private tables
              since {site.founded}.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="t-label text-accent">Explore</h2>
            <ul className="mt-5 space-y-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline tap text-bone/85 hover:text-bone">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" className="link-underline tap text-bone/85 hover:text-bone">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/book" className="link-underline tap text-accent">
                  Check your date
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="t-label text-accent">Where he cooks</h2>
            <ul className="mt-5 space-y-2 text-bone/80">
              {site.serviceAreas.slice(0, 7).map((a) => (
                <li key={a} className="t-small">
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="t-label text-accent">Get in touch</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <a href={`tel:${site.contact.phoneHref}`} className="tap-sm text-xl text-bone">
                  {site.contact.phone}
                </a>
              </li>
              <li>
                <a href={`tel:${site.contact.phoneAltHref}`} className="tap-sm t-small text-bone/75">
                  Toll free {site.contact.phoneAlt}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="link-underline tap-sm t-small break-all text-bone/75"
                >
                  {site.contact.email}
                </a>
              </li>
              <li className="t-small text-muted-dark">
                Based in {site.location.city}, {site.location.region}
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Chef R. Kearse on Instagram"
                className="grid h-11 w-11 place-items-center border border-line-dark text-bone/80 transition-colors hover:border-accent hover:text-accent"
              >
                <span className="block h-5 w-5">{Ico.instagram}</span>
              </a>
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Chef R. Kearse on Facebook"
                className="grid h-11 w-11 place-items-center border border-line-dark text-bone/80 transition-colors hover:border-accent hover:text-accent"
              >
                <span className="block h-5 w-5">{Ico.facebook}</span>
              </a>
              <a
                href={site.social.yelp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chef R. Kearse on Yelp"
                className="grid h-11 w-11 place-items-center border border-line-dark text-bone/80 transition-colors hover:border-accent hover:text-accent"
              >
                <span className="block h-5 w-5">{Ico.star}</span>
              </a>
            </div>
          </div>
        </div>

        {/*
          Staff sign-in.

          Deliberately in the footer rather than the header: guests have no use
          for it, and a "Staff login" button next to "Reserve" muddies the one
          action the page is asking for. But it is a real bordered button in its
          own block, not a text link buried in a list — the chef and his
          assistant have to find it without being told where to look, on a phone,
          possibly for the first time.
        */}
        <div className="mt-16 border-t border-line-dark pt-8">
          <div className="flex flex-col gap-4 border border-line-dark px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="t-label text-accent">For the team</p>
              <p className="t-serif-italic mt-2 text-xl leading-snug text-bone">
                The Kitchen Office
              </p>
              <p className="t-small mt-1 max-w-md text-muted-dark">
                Bookings, guests, menus and marketing — all in one place.
              </p>
            </div>
            <Link
              href="/portal/login"
              className="btn btn-ghost-light shrink-0 justify-center whitespace-nowrap"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
                <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
              </svg>
              Staff sign in
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-line-dark pt-8 text-muted-dark md:flex-row md:items-center md:justify-between">
          <p className="t-small">
            &copy; {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <p className="t-small">
            Menus are written per event. Prices quoted on enquiry.
          </p>
        </div>
      </div>
    </footer>
  );
}
