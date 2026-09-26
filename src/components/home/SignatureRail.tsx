"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signatureDishes, dishSrc } from "@/lib/dishes";
import { isDesktop, loadMotion, prefersReducedMotion } from "@/lib/motion";
import SplitHeading from "@/components/SplitHeading";

/**
 * Desktop: the plates travel sideways as the section passes through the
 * viewport — driven by scroll position, but deliberately NOT pinned.
 *
 * Pinning was the first thing built here and it was the right effect and the
 * wrong trade: ScrollTrigger injects a pin-spacer after first paint, the whole
 * page below it jumps down, and the home page measured 0.33 CLS. Driving the
 * same horizontal travel off scroll progress with the section at its natural
 * height gives the same read at 0.00.
 *
 * Mobile: the identical track is a native snap-scrolling swipe rail. On a touch
 * device the right interaction is the reader's thumb.
 */
export default function SignatureRail() {
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [driven, setDriven] = useState(false);

  useEffect(() => {
    const sec = section.current;
    const vp = viewport.current;
    const trk = track.current;
    if (!sec || !vp || !trk) return;
    if (prefersReducedMotion() || !isDesktop()) return;

    setDriven(true);

    let cancelled = false;
    let revert: (() => void) | undefined;
    let timer = 0;

    loadMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        const distance = () => Math.max(0, trk.scrollWidth - vp.clientWidth);
        gsap.fromTo(
          trk,
          { x: 0 },
          {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: sec,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          }
        );
      }, sec);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      revert?.();
      setDriven(false);
    };
  }, []);

  return (
    <section
      ref={section}
      id="signature"
      className="dark-section relative overflow-hidden py-20 md:py-28 lg:py-32"
      aria-labelledby="signature-heading"
    >
      <div className="shell">
        <p className="t-label text-accent">The plates</p>
        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SplitHeading
            id="signature-heading"
            text="Food that earns the room's silence."
            className="t-h2 max-w-[18ch] text-bone"
          />
          <p className="t-lead max-w-md lg:text-right">
            Real plates from real Chef Kearse events. Every menu is written for the
            night it is cooked for.
          </p>
        </div>
      </div>

      <div ref={viewport} className="mt-12 overflow-hidden lg:mt-16">
        <div
          ref={track}
          className={`flex snap-x snap-mandatory gap-5 px-[max(1rem,calc((100vw-var(--shell))/2))] pb-4 md:gap-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            driven ? "will-change-transform" : "overflow-x-auto"
          }`}
        >
          {signatureDishes.map((d, i) => (
            <article
              key={d.slug}
              className="w-[76vw] shrink-0 snap-start sm:w-[54vw] md:w-[42vw] lg:w-[27rem]"
            >
              <div className="grain relative aspect-[4/5] overflow-hidden bg-ink-2">
                <Image
                  src={dishSrc(d.slug, 1024)}
                  alt={d.alt}
                  fill
                  sizes="(min-width:1024px) 27rem, (min-width:640px) 54vw, 76vw"
                  loading={i < 2 ? "eager" : "lazy"}
                  className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] hover:scale-[1.04]"
                />
                <span className="t-label absolute left-4 top-4 bg-ink/70 px-3 py-2 text-bone/85 backdrop-blur-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="t-h3 mt-5 text-bone">{d.title}</h3>
              <p className="t-small mt-2 max-w-[38ch] text-muted-dark">{d.note}</p>
            </article>
          ))}

          <div className="flex w-[70vw] shrink-0 items-center sm:w-[40vw] lg:w-[22rem]">
            <div>
              <p className="t-h3 max-w-[16ch] text-bone">
                There are another two dozen in the gallery.
              </p>
              <Link href="/gallery" className="btn btn-ghost-light mt-7">
                See the full gallery
              </Link>
            </div>
          </div>
        </div>
      </div>

      <p className="t-label shell mt-8 text-bone/55 lg:hidden">Swipe</p>
    </section>
  );
}
