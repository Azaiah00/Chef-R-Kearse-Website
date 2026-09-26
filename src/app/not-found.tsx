import Link from "next/link";
import Image from "next/image";
import { navLinks, site } from "@/lib/site";

export default function NotFound() {
  return (
    <section
      className="dark-section grain relative flex min-h-[80svh] items-center overflow-hidden"
      style={{ paddingTop: "var(--header-h)" }}
    >
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/dishes/butter-pan-texture-1024.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,16,14,.95),rgba(18,16,14,.86))]" />
      </div>

      <div className="shell relative z-10 py-20">
        <p className="t-label text-accent">404</p>
        <h1 className="t-h1 mt-5 max-w-[16ch] text-bone">
          That page is off the menu.
        </h1>
        <p className="t-lead mt-6 max-w-lg">
          The link is broken or the page has moved. Everything worth reading is one tap
          away.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary sm:min-w-[14rem]">
            Back to the start
          </Link>
          <Link href="/book" className="btn btn-ghost-light">
            Check your date
          </Link>
        </div>

        <ul className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-line-dark pt-8">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="link-underline t-label text-bone/70">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={`tel:${site.contact.phoneHref}`}
              className="link-underline t-label text-accent"
            >
              Call {site.contact.phone}
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
