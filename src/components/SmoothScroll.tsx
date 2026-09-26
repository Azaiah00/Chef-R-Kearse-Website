"use client";

import { useEffect } from "react";
import { loadMotion, onIdle, prefersReducedMotion } from "@/lib/motion";

/**
 * Lenis smooth scroll, wired into GSAP's ticker so scrubbed timelines stay in
 * sync. Both libraries load dynamically, and only once the browser is idle —
 * nothing above the fold depends on either, and holding them back keeps
 * hydration off the critical path on a phone.
 *
 * Disabled entirely for reduced-motion users.
 */
export default function SmoothScroll() {
  useEffect(() => {
    document.documentElement.classList.remove("no-js");
    if (prefersReducedMotion()) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    const cancelIdle = onIdle(() => {
      if (cancelled) return;

      Promise.all([import("lenis"), loadMotion()]).then(
        ([{ default: Lenis }, { gsap, ScrollTrigger }]) => {
          if (cancelled) return;

          const lenis = new Lenis({
            duration: 1.05,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            syncTouch: false,
            touchMultiplier: 1.6,
          });

          lenis.on("scroll", ScrollTrigger.update);
          const raf = (time: number) => lenis.raf(time * 1000);
          gsap.ticker.add(raf);
          gsap.ticker.lagSmoothing(0);

          // Anchor links should ride the smooth scroller too.
          const onClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
            if (!target) return;
            const id = target.getAttribute("href");
            if (!id || id === "#") return;
            const node = document.querySelector(id);
            if (!node) return;
            e.preventDefault();
            lenis.scrollTo(node as HTMLElement, { offset: -90 });
          };
          document.addEventListener("click", onClick);

          const refresh = () => ScrollTrigger.refresh();
          window.addEventListener("load", refresh);

          cleanup = () => {
            document.removeEventListener("click", onClick);
            window.removeEventListener("load", refresh);
            gsap.ticker.remove(raf);
            lenis.destroy();
          };
        }
      );
    });

    return () => {
      cancelled = true;
      cancelIdle();
      cleanup?.();
    };
  }, []);

  return null;
}
