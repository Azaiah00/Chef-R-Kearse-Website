"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import SplitHeading from "@/components/SplitHeading";
import { loadMotion, prefersReducedMotion } from "@/lib/motion";
import { site } from "@/lib/site";

const FACTS = [
  { k: "Cooking privately since", v: String(site.founded) },
  { k: "Generation in the kitchen", v: "Third" },
  { k: "Where he cooks", v: "RVA · DC · MD" },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const meta = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    loadMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !root.current) return;
      const ctx = gsap.context(() => {
        gsap.fromTo(
          bg.current,
          { scale: 1.16, autoAlpha: 0 },
          { scale: 1.04, autoAlpha: 1, duration: 2.2, ease: "expo.out" }
        );
        gsap.fromTo(
          card.current,
          { autoAlpha: 0, y: 48, clipPath: "inset(0% 0% 100% 0%)" },
          {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.5,
            delay: 0.55,
            ease: "expo.out",
          }
        );
        gsap.fromTo(
          meta.current ? Array.from(meta.current.children) : [],
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 1, delay: 0.9, stagger: 0.09, ease: "expo.out" }
        );

        // Slow drift out on scroll
        gsap.to(bg.current, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        });
      }, el);
      ScrollTrigger.refresh();
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    <section
      ref={root}
      className="dark-section grain relative flex min-h-[100svh] items-end overflow-hidden"
      style={{ paddingTop: "var(--header-h)" }}
    >
      {/* Backdrop */}
      <div ref={bg} className="absolute inset-0 will-change-transform" aria-hidden="true">
        <Image
          src="/images/dishes/lamb-chops-asparagus-1600.webp"
          alt=""
          fill
          priority
          quality={58}
          sizes="100vw"
          className="scale-[1.08] object-cover opacity-[0.58]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,16,14,.86)_0%,rgba(18,16,14,.42)_32%,rgba(18,16,14,.78)_74%,rgba(18,16,14,.97)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_18%_45%,rgba(18,16,14,.72)_0%,rgba(18,16,14,0)_62%)]" />
      </div>

      <div className="shell relative z-10 grid items-end gap-12 pb-16 pt-24 lg:grid-cols-[1.35fr_0.65fr] lg:pb-24">
        <div className="max-w-[46rem]">
          <p className="t-label flex flex-wrap items-center gap-x-3 gap-y-1 text-accent">
            <span>Private Chef &amp; Catering</span>
            <span aria-hidden="true" className="inline-block h-px w-8 bg-accent/70" />
            <span className="text-bone/70">Richmond · Washington DC · Maryland</span>
          </p>

          <SplitHeading
            as="h1"
            immediate
            delay={0.15}
            text={site.tagline}
            className="t-display mt-6 text-bone"
          />

          <p className="t-lead mt-7 max-w-xl text-bone/80">
            Chef R. Kearse is a third-generation private chef. He brings the knives, the
            market run, the plating and the cleanup to your kitchen — and leaves you with
            nothing to do but sit down.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/book" className="btn btn-primary sm:min-w-[15rem]">
              Check your date
            </Link>
            <Link href="/menus" className="btn btn-ghost-light">
              See the plates
            </Link>
          </div>

          <div
            ref={meta}
            className="mt-12 grid max-w-2xl grid-cols-1 gap-x-10 gap-y-5 border-t border-line-dark pt-7 sm:grid-cols-3"
          >
            {FACTS.map((f) => (
              <div key={f.k}>
                <p className="t-label text-bone/65">{f.k}</p>
                <p className="t-serif-italic mt-2 text-2xl text-bone">{f.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Signature plate card — desktop only, keeps the hero from being one flat photo */}
        <div ref={card} className="hidden lg:block">
          <figure className="relative">
            <div className="grain relative aspect-[4/5] overflow-hidden border border-bone/12">
              <Image
                src="/images/dishes/snapper-mango-salsa-1024.webp"
                alt="Roasted fish under a heavy layer of mango, sweet pepper and red onion salsa, finished with an orchid"
                fill
                sizes="(min-width:1024px) 30vw, 0px"
                className="object-cover"
                priority
              />
            </div>
            <figcaption className="t-small mt-4 flex items-start gap-3 text-bone/60">
              <span className="mt-2 inline-block h-px w-6 shrink-0 bg-accent" />
              <span>
                Mango and pepper salsa over roasted fish — one of the plates his guests
                photograph before they eat.
              </span>
            </figcaption>
          </figure>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 lg:block"
        aria-hidden="true"
      >
        <span className="t-label block text-bone/60">Scroll</span>
      </div>
    </section>
  );
}
