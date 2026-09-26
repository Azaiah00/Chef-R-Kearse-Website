"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, site } from "@/lib/site";

/** Routes that open with a full-bleed dark hero the header can sit on top of. */
const HERO_ROUTES = new Set(["/", "/weddings", "/gallery"]);

export default function SiteHeader() {
  const pathname = usePathname();
  const overHero = HERO_ROUTES.has(pathname);
  const [solid, setSolid] = useState(!overHero);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!overHero) {
      setSolid(true);
      return;
    }
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const light = !solid && !open;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-3 focus:text-bone"
      >
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          solid || open
            ? "border-b border-line bg-bone/92 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
        style={{ height: "var(--header-h)" }}
      >
        {/* Scrim: keeps the nav legible while the header floats over a photo */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 h-[190%] bg-[linear-gradient(180deg,rgba(18,16,14,.78)_0%,rgba(18,16,14,.42)_45%,rgba(18,16,14,0)_100%)] transition-opacity duration-500 ${
            light ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="shell relative flex h-full items-center justify-between gap-6">
          <Link
            href="/"
            aria-label={`${site.name} — home`}
            className="relative block shrink-0 py-1"
          >
            <Image
              src={light ? "/images/brand/logo-bone.png" : "/images/brand/logo-ink.png"}
              alt={`${site.name} — Private Chef & Catering`}
              width={440}
              height={125}
              priority
              className="h-9 w-[127px] md:h-11 md:w-[155px]"
            />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`link-underline t-label transition-colors ${
                  light ? "text-bone" : "text-ink"
                } ${pathname === l.href ? "text-accent" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${site.contact.phoneHref}`}
              className={`hidden text-[0.8125rem] font-medium tracking-wide xl:block ${
                light ? "text-bone" : "text-ink"
              }`}
            >
              {site.contact.phone}
            </a>
            <Link
              href="/book"
              className="btn btn-primary !min-h-[44px] !px-4 text-[0.6875rem] md:!min-h-[48px] md:!px-6 md:text-[0.75rem]"
            >
              Check your date
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={`grid h-11 w-11 shrink-0 place-items-center lg:hidden ${
                light ? "text-bone" : "text-ink"
              }`}
            >
              <span className="relative block h-4 w-6">
                <span
                  className={`absolute left-0 block h-px w-6 bg-current transition-transform duration-300 ${
                    open ? "top-2 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-2 block h-px w-6 bg-current transition-opacity duration-200 ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-px w-6 bg-current transition-transform duration-300 ${
                    open ? "top-2 -rotate-45" : "top-4"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-0 z-40 bg-bone lg:hidden"
        style={{ paddingTop: "var(--header-h)" }}
      >
        <nav className="shell flex h-full flex-col justify-between py-10" aria-label="Mobile">
          <ul className="space-y-1">
            {navLinks.map((l, i) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="t-h3 block border-b border-line py-4"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contact" className="t-h3 block border-b border-line py-4">
                Contact
              </Link>
            </li>
          </ul>

          <div className="space-y-4 pb-24">
            <Link href="/book" className="btn btn-primary w-full">
              Check your date
            </Link>
            <div className="flex flex-col gap-1 text-center">
              <a href={`tel:${site.contact.phoneHref}`} className="text-lg">
                {site.contact.phone}
              </a>
              <a href={`mailto:${site.contact.email}`} className="t-small text-muted">
                {site.contact.email}
              </a>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
